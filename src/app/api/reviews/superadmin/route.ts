import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface ReviewData {
  _id: ObjectId;
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

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token and check if user is superadmin
    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Only superadmin can view all reviews
    if (result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only superadmin can view all reviews.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const property_id = searchParams.get('property_id');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Validate sort parameters
    const validSortFields = ['created_at', 'updated_at', 'stars', 'display_name', 'status'];
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        { success: false, message: 'Invalid sort field' },
        { status: 400 }
      );
    }
    
    const validSortOrders = ['asc', 'desc'];
    if (!validSortOrders.includes(sortOrder)) {
      return NextResponse.json(
        { success: false, message: 'Invalid sort order' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Build filter query
    const filter: any = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (property_id) {
      filter.property_id = parseInt(property_id);
    }
    
    if (search) {
      filter.$or = [
        { display_name: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { 'property.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const totalReviews = await db.collection("reviews").countDocuments(filter);
    const totalPages = Math.ceil(totalReviews / limit);
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get reviews with pagination
    const reviews = await db.collection("reviews")
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get review statistics
    const stats = await db.collection("reviews").aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const statusStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: totalReviews
    };

    stats.forEach(stat => {
      statusStats[stat._id as keyof typeof statusStats] = stat.count;
    });

    // Format reviews for response
    const formattedReviews = reviews.map((review: ReviewData) => ({
      _id: review._id,
      body: review.body,
      date: review.date,
      display_name: review.display_name,
      property: review.property,
      property_id: review.property_id,
      response: review.response || '',
      reviewer: review.reviewer,
      stars: review.stars,
      status: review.status,
      created_at: review.created_at,
      updated_at: review.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalReviews: totalReviews,
          limit: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        statistics: statusStats
      }
    });

  } catch (error) {
    console.error('Superadmin reviews GET error:', error);
          return NextResponse.json(
      { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token and check if user is superadmin
    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Only superadmin can delete reviews
    if (result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only superadmin can delete reviews.' },
        { status: 403 }
      );
    }

    const { reviewIds } = await request.json();

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
        return NextResponse.json(
        { success: false, message: 'Review IDs are required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    const validIds = reviewIds.filter(id => ObjectId.isValid(id));
    if (validIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid review IDs provided' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Convert string IDs to ObjectIds
    const objectIds = validIds.map(id => new ObjectId(id));

    // Delete reviews
    const deleteResult = await db.collection("reviews").deleteMany({
      _id: { $in: objectIds }
    });

    return NextResponse.json({
      success: true,
      message: `${deleteResult.deletedCount} review(s) deleted successfully`,
      deletedCount: deleteResult.deletedCount
    });

  } catch (error) {
    console.error('Superadmin reviews DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}