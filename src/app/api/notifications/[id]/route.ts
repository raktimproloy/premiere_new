import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token
    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { read } = await request.json();

    if (typeof read !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'read field must be a boolean' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification ID format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Update notification read status
    const updateResult = await db.collection("notifications").updateOne(
      { 
        _id: new ObjectId(id),
        userId: result.user._id // Ensure user can only update their own notifications
      },
      { 
        $set: { 
          read: read,
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Notification not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully'
    });

  } catch (error) {
    console.error('Update notification API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token
    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification ID format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // First, check if the notification exists
    const notification = await db.collection("notifications").findOne({
      _id: new ObjectId(id)
    });

    if (!notification) {
      console.log('Notification not found with ID:', id);
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    console.log('Notification found:', {
      notificationId: id,
      notificationUserId: notification.userId,
      notificationUserIdType: typeof notification.userId,
      currentUserId: result.user._id,
      currentUserIdType: typeof result.user._id,
      match: notification.userId === result.user._id,
      matchString: String(notification.userId) === String(result.user._id)
    });

    // Check if user owns this notification (handle both string and ObjectId)
    const userIdMatches = 
      notification.userId === result.user._id || 
      String(notification.userId) === String(result.user._id);

    if (!userIdMatches) {
      console.log('User does not own this notification');
      return NextResponse.json(
        { success: false, message: 'Access denied - you can only delete your own notifications' },
        { status: 403 }
      );
    }

    // Delete the notification
    const deleteResult = await db.collection("notifications").deleteOne({
      _id: new ObjectId(id)
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
