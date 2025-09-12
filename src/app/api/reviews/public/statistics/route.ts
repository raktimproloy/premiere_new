import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const property_id = searchParams.get('property_id');

    if (!property_id) {
      return NextResponse.json(
        { success: false, message: 'Property ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get approved reviews for the property
    const reviews = await db.collection("reviews").find({
      property_id: parseInt(property_id),
      status: 'approved'
    }).toArray();

    // Calculate statistics
    const totalReviews = reviews.length;
    let averageRating = 0;
        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalReviews > 0) {
      // Calculate average rating
      const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
      averageRating = Math.round((totalStars / totalReviews) * 10) / 10;

      // Calculate rating distribution
      reviews.forEach(review => {
        const rating = Math.round(review.stars);
        if (rating >= 5) ratingDistribution[5]++;
        else if (rating >= 4) ratingDistribution[4]++;
        else if (rating >= 3) ratingDistribution[3]++;
        else if (rating >= 2) ratingDistribution[2]++;
        else ratingDistribution[1]++;
      });
    }

    // Get property name from the first review (if any)
    let propertyName = 'Unknown Property';
    if (reviews.length > 0) {
      propertyName = reviews[0].property?.name || 'Unknown Property';
    }

    return NextResponse.json({
      success: true,
      data: {
        property_id: parseInt(property_id),
        property_name: propertyName,
        totalReviews,
        averageRating,
        averageRatingText: `${averageRating} out of 5`,
        ratingDistribution,
        hasReviews: totalReviews > 0
      }
    });

  } catch (error) {
    console.error('Public review statistics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch review statistics' },
      { status: 500 }
    );
  }
}
