import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { OwnerRezReview, OwnerRezReviewsResponse, UnifiedReview, ReviewsApiResponse } from '@/types/review';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie and verify authentication
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token and get user information
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin or superadmin
    if (authResult.user.role !== 'admin' && authResult.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only admins can view reviews.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '8');

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page number. Must be a positive integer' },
        { status: 400 }
      );
    }
    
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: 'Invalid page size. Must be between 1 and 100' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * pageSize;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get admin's properties to filter reviews
    let propertyQuery = {};
    
    if (authResult.user.role === 'superadmin') {
      // Superadmin can see all reviews - no property filter
      propertyQuery = {};
    } else {
      // Regular admin can only see reviews for their own properties
      propertyQuery = {
        'owner.id': authResult.user._id
      };
    }

    const adminProperties = await db.collection("properties")
      .find(propertyQuery)
      .project({ _id: 1, ownerRezId: 1, name: 1, propertyType: 1, pricing: 1, createdAt: 1 })
      .toArray();

    // Create mapping of OwnerRez property IDs to property details
    const ownerRezIdToProperty = adminProperties.reduce((acc, p) => {
      if (p.ownerRezId) {
        acc[p.ownerRezId] = {
          id: p._id.toString(),
          name: p.name,
          type: p.propertyType,
          price: p.pricing?.baseRate?.toString() || '0',
          listingDate: p.createdAt
        };
      }
      return acc;
    }, {} as Record<number, { id: string; name: string; type: string; price: string; listingDate: string }>);

    // Get the OwnerRez property IDs that belong to this admin
    const adminOwnerRezIds = adminProperties
      .filter(p => p.ownerRezId)
      .map(p => p.ownerRezId);

    console.log(`Admin ${authResult.user._id} has ${adminProperties.length} properties with ${adminOwnerRezIds.length} OwnerRez IDs:`, adminOwnerRezIds);

    // Fetch reviews from OwnerRez API
    const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
    const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
    const baseUrl = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";
    
    let allReviews: UnifiedReview[] = [];

    if (username && password && baseUrl) {
      try {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const apiUrl = new URL(`${baseUrl}/reviews`);
        apiUrl.searchParams.append('limit', '1000');
        apiUrl.searchParams.append('offset', '0');
        
        const res = await fetch(apiUrl.toString(), {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          }
        });

        if (res.ok) {
          const data: OwnerRezReviewsResponse = await res.json();
          const reviews = data.items || [];

          // Filter reviews based on admin's properties
          let filteredReviews = reviews;
          
          if (authResult.user.role !== 'superadmin') {
            // For regular admins, only show reviews for their properties
            filteredReviews = reviews.filter(review => {
              // Check if this review's property_id matches any of the admin's OwnerRez property IDs
              return adminOwnerRezIds.includes(review.property_id);
            });
            console.log(`Filtered ${reviews.length} total reviews to ${filteredReviews.length} reviews for admin's properties`);
          }

          // Convert OwnerRez reviews to unified format
          allReviews = filteredReviews.map((review: OwnerRezReview) => {
            // Get property details from our mapping
            const propertyDetails = ownerRezIdToProperty[review.property_id] || {
              id: review.property_id.toString(),
              name: review.property.name,
              type: 'Property',
              price: '0',
              listingDate: new Date(review.created_utc).toISOString()
            };

            return {
              id: review.id,
              propertyName: propertyDetails.name,
              propertyId: review.property_id,
              type: propertyDetails.type,
              price: propertyDetails.price,
              listingDate: propertyDetails.listingDate,
              rating: review.stars,
              reviewCount: '1', // Individual review
              reviewerName: review.display_name,
              reviewDate: new Date(review.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              reviewText: review.body,
              reviewTitle: review.title,
              reviewerAvatar: "/images/review.png", // Default avatar
              response: review.response,
              visible: review.visible,
              monthOfStay: review.month_of_stay,
              yearOfStay: review.year_of_stay,
              listingSite: review.listing_site,
              reviewer: review.reviewer
            };
          });
        } else {
          console.error('OwnerRez reviews fetch failed:', res.status, await res.text());
        }
      } catch (err) {
        console.error('OwnerRez reviews fetch error:', err);
      }
    }

    // Sort reviews by creation date (newest first)
    allReviews.sort((a, b) => new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime());

    const totalCount = allReviews.length;

    // Apply pagination
    const paginatedReviews = allReviews.slice(offset, offset + pageSize);

    const response: ReviewsApiResponse = {
      success: true,
      total: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      reviews: paginatedReviews,
      userRole: authResult.user.role,
      canManageAllReviews: authResult.user.role === 'superadmin'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Admin reviews API error:', error);
    
    const errorMessage = error instanceof Error ? 
      error.message : 
      'Unknown error occurred';
      
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch admin reviews',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
