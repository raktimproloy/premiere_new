import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
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

    // Only superadmin can approve/reject reviews
    if (result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only superadmin can approve/reject reviews.' },
        { status: 403 }
      );
    }

    const { reviewIds, action, reason } = await request.json();

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Review IDs are required' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Action must be either "approve" or "reject"' },
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

    // Check if reviews exist and are in pending status
    const existingReviews = await db.collection("reviews").find({
      _id: { $in: objectIds },
      status: 'pending'
    }).toArray();

    if (existingReviews.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No pending reviews found with the provided IDs' },
        { status: 404 }
      );
    }

    // Update reviews
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      updated_at: new Date(),
      updated_by: result.user._id
    };

    if (reason) {
      updateData.rejection_reason = reason;
    }

    const updateResult = await db.collection("reviews").updateMany(
      { _id: { $in: objectIds } },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: `${updateResult.modifiedCount} review(s) ${action}d successfully`,
      modifiedCount: updateResult.modifiedCount,
      action: action
    });

  } catch (error) {
    console.error('Superadmin review approval error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Only superadmin can bulk approve/reject reviews
    if (result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only superadmin can bulk approve/reject reviews.' },
        { status: 403 }
      );
    }

    const { action, filters, reason } = await request.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Build filter query
    const filter: any = { status: 'pending' };
    
    if (filters) {
      if (filters.property_id) {
        filter.property_id = parseInt(filters.property_id);
      }
      
      if (filters.date_from && filters.date_to) {
        filter.created_at = {
          $gte: new Date(filters.date_from),
          $lte: new Date(filters.date_to)
        };
      }
      
      if (filters.stars) {
        filter.stars = parseInt(filters.stars);
      }
    }

    // Update reviews
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      updated_at: new Date(),
      updated_by: result.user._id
    };

    if (reason) {
      updateData.rejection_reason = reason;
    }

    const updateResult = await db.collection("reviews").updateMany(
      filter,
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: `${updateResult.modifiedCount} review(s) ${action}d successfully`,
      modifiedCount: updateResult.modifiedCount,
      action: action
    });

  } catch (error) {
    console.error('Superadmin bulk review approval error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
