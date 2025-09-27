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

    // Verify the token and check if user is admin or superadmin
    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Only admin and superadmin can approve/reject reviews
    if (result.user.role !== 'admin' && result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only admins can approve/reject reviews.' },
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

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // For regular admins, check if they own the properties for these reviews
    if (result.user.role === 'admin') {
      // Get admin's properties
      const adminProperties = await db.collection("properties")
        .find({
          'owner.id': result.user._id
        })
        .project({ _id: 1, ownerRezId: 1 })
        .toArray();

      const adminOwnerRezIds = adminProperties
        .filter(p => p.ownerRezId)
        .map(p => p.ownerRezId);

      // Check if all reviews belong to admin's properties
      const reviewsToCheck = await db.collection("reviews")
        .find({
          _id: { $in: reviewIds.map(id => new ObjectId(id)) }
        })
        .project({ property_id: 1 })
        .toArray();

      const unauthorizedReviews = reviewsToCheck.filter(review => 
        !adminOwnerRezIds.includes(review.property_id)
      );

      if (unauthorizedReviews.length > 0) {
        return NextResponse.json(
          { success: false, message: 'You can only approve/reject reviews for your own properties' },
          { status: 403 }
        );
      }
    }

    // Validate ObjectId format
    const validIds = reviewIds.filter(id => ObjectId.isValid(id));
    if (validIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid review IDs provided' },
        { status: 400 }
      );
    }

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
    console.error('Admin review approval error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
