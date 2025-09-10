import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
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

    // Check if user is superadmin
    if (authResult.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only superadmins can view all reviews.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '8');
    const statusFilter = (searchParams.get('status') || 'all').toLowerCase(); // 'all' | 'visible' | 'hidden'

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

          // Convert OwnerRez reviews to unified format
          allReviews = reviews.map((review: OwnerRezReview) => ({
            id: review.id,
            propertyName: review.property.name,
            propertyId: review.property_id,
            type: 'Property', // Default type since OwnerRez doesn't provide this
            price: '0', // OwnerRez reviews don't include pricing
            listingDate: new Date(review.created_utc).toISOString(),
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
          }));

          // Apply status filter
          if (statusFilter === 'visible') {
            allReviews = allReviews.filter(review => review.visible);
          } else if (statusFilter === 'hidden') {
            allReviews = allReviews.filter(review => !review.visible);
          }
          // 'all' returns everything

        } else {
          console.error('OwnerRez reviews fetch failed:', res.status, await res.text());
          return NextResponse.json(
            { 
              success: false,
              error: 'Failed to fetch reviews from OwnerRez API',
              details: `API returned status ${res.status}`
            },
            { status: 500 }
          );
        }
      } catch (err) {
        console.error('OwnerRez reviews fetch error:', err);
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to fetch reviews from OwnerRez API',
            details: err instanceof Error ? err.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'OwnerRez API credentials not configured',
          details: 'Missing username, password, or baseUrl'
        },
        { status: 500 }
      );
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
      canManageAllReviews: true
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Superadmin reviews API error:', error);
    
    const errorMessage = error instanceof Error ? 
      error.message : 
      'Unknown error occurred';
      
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch superadmin reviews',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
