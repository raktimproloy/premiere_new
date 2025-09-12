import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface ReviewData {
  body: string;
  date: string;
  display_name: string;
  property: {
    id: number;
    name: string;
  };
  property_id: number;
  response?: string;
  reviewer: string;
  stars: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      body, 
      display_name, 
      property_id, 
      stars, 
      reviewer = 'guest',
      response = ''
    } = await request.json();

    // Validate required fields
    if (!body || !display_name || !property_id || !stars) {
      return NextResponse.json(
        { success: false, message: 'Body, display_name, property_id, and stars are required' },
        { status: 400 }
      );
    }

    // Validate stars rating (1-5)
    if (stars < 1 || stars > 5 || !Number.isInteger(stars)) {
      return NextResponse.json(
        { success: false, message: 'Stars must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate reviewer type
    if (!['guest', 'owner', 'admin'].includes(reviewer)) {
      return NextResponse.json(
        { success: false, message: 'Invalid reviewer type' },
        { status: 400 }
      );
    }

    // Get property name from OwnerRez API
    let propertyName = 'Unknown Property';
    try {
      const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
      const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
      const v2Url = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";

      const auth = Buffer.from(`${username}:${password}`).toString('base64');
      const response = await fetch(`${v2Url}/properties/${property_id}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const propertyData = await response.json();
        propertyName = propertyData.name || 'Unknown Property';
      }
    } catch (error) {
      console.error('Error fetching property name:', error);
      // Continue with default name
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Create review document
    const reviewData: ReviewData = {
      body: body.trim(),
      date: new Date().toISOString(),
      display_name: display_name.trim(),
      property: {
        id: property_id,
        name: propertyName
      },
      property_id,
      response: response.trim(),
      reviewer,
      stars,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Save to database
    const result = await db.collection("reviews").insertOne(reviewData);

    if (result.insertedId) {
      return NextResponse.json({
        success: true,
        message: 'Review submitted successfully and is pending approval',
        review_id: result.insertedId
      }, { status: 201 });
    } else {
      throw new Error('Failed to save review');
    }

  } catch (error) {
    console.error('Public review POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit review. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const property_id = searchParams.get('property_id');
    const limit = parseInt(searchParams.get('limit') || '4');
    const page = parseInt(searchParams.get('page') || '1');

    if (!property_id) {
      return NextResponse.json(
        { success: false, message: 'Property ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get approved reviews for the property
    const skip = (page - 1) * limit;
    const reviews = await db.collection("reviews")
      .find({ 
        property_id: parseInt(property_id), 
        status: 'approved' 
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get review statistics
    const totalReviews = await db.collection("reviews").countDocuments({ 
      property_id: parseInt(property_id), 
      status: 'approved' 
    });

    // Calculate average rating
    const ratingStats = await db.collection("reviews").aggregate([
      { $match: { property_id: parseInt(property_id), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$stars' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$stars'
          }
        }
      }
    ]).toArray();

    let averageRating = 0;
        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (ratingStats.length > 0) {
      averageRating = Math.round(ratingStats[0].averageRating * 10) / 10;
      
      // Calculate rating distribution
      ratingStats[0].ratingDistribution.forEach((rating: number) => {
        if (rating >= 5) ratingDistribution[5]++;
        else if (rating >= 4) ratingDistribution[4]++;
        else if (rating >= 3) ratingDistribution[3]++;
        else if (rating >= 2) ratingDistribution[2]++;
        else ratingDistribution[1]++;
      });
    }

    // Format reviews for response
    const formattedReviews = reviews.map(review => ({
      body: review.body,
      date: review.date,
      display_name: review.display_name,
      property: review.property,
      property_id: review.property_id,
      response: review.response || '',
      reviewer: review.reviewer,
      stars: review.stars,
      status: review.status
    }));

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          limit,
          hasNextPage: page < Math.ceil(totalReviews / limit),
          hasPrevPage: page > 1
        },
        statistics: {
          averageRating,
          totalReviews,
          ratingDistribution,
          averageRatingText: `${averageRating} out of 5`
        }
      }
    });

  } catch (error) {
    console.error('Public review GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
