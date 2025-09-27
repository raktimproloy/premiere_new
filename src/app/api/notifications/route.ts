import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface Notification {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  relatedId?: ObjectId; // ID of related booking, property, etc.
  relatedType?: 'booking' | 'property' | 'review' | 'contact';
  createdAt: Date;
  updatedAt: Date;
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

    // Verify the token
    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Check if we should show all notifications for debugging
    const showAll = searchParams.get('showAll') === 'true';
    const createTest = searchParams.get('createTest') === 'true';
    const createRealReview = searchParams.get('createRealReview') === 'true';
    
    // Create a test notification for this user if requested (for testing purposes only)
    if (createTest) {
      // Create different types of real-world notifications
      const realNotifications = [
        {
          userId: new ObjectId(result.user._id),
          title: 'New Booking Request',
          message: 'John Smith has made a booking request for Ocean View Villa for 3 nights',
          type: 'success',
          read: false,
          actionUrl: '/admin/bookings',
          actionLabel: 'Review Booking',
          relatedId: new ObjectId(result.user._id),
          relatedType: 'booking',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          userId: new ObjectId(result.user._id),
          title: 'Payment Received',
          message: 'Payment of $1,250 has been received for booking #BK-2025-001',
          type: 'success',
          read: false,
          actionUrl: '/admin/bookings',
          actionLabel: 'View Booking',
          relatedId: new ObjectId(result.user._id),
          relatedType: 'booking',
          createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          updatedAt: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          userId: new ObjectId(result.user._id),
          title: 'Property Maintenance Alert',
          message: 'Scheduled maintenance for Beach House scheduled for tomorrow at 10:00 AM',
          type: 'warning',
          read: false,
          actionUrl: '/admin/properties',
          actionLabel: 'View Property',
          relatedId: new ObjectId(result.user._id),
          relatedType: 'property',
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          updatedAt: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          userId: new ObjectId(result.user._id),
          title: 'Guest Review Received',
          message: 'Sarah Johnson left a 5-star review for Sunset Paradise Villa',
          type: 'success',
          read: false,
          actionUrl: '/admin/reviews',
          actionLabel: 'View Review',
          relatedId: new ObjectId(result.user._id),
          relatedType: 'review',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          userId: new ObjectId(result.user._id),
          title: 'Booking Cancelled',
          message: 'Michael Brown cancelled their booking for City Center Apartment',
          type: 'warning',
          read: false,
          actionUrl: '/admin/bookings',
          actionLabel: 'View Details',
          relatedId: new ObjectId(result.user._id),
          relatedType: 'booking',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ];

      // Insert all real-world notifications
      await db.collection("notifications").insertMany(realNotifications);
    }

    // Create a real review notification (simulating actual review submission)
    if (createRealReview) {
      const realReviewNotification = {
        userId: new ObjectId(result.user._id),
        title: 'New Guest Review',
        message: 'Emma Wilson submitted a 5-star review for "Luxury Beachfront Villa"',
        type: 'success',
        read: false,
        actionUrl: '/admin/reviews',
        actionLabel: 'View Review',
        relatedId: new ObjectId(result.user._id),
        relatedType: 'review',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const insertResult = await db.collection("notifications").insertOne(realReviewNotification);
      console.log('Real review notification created:', insertResult.insertedId);
    }

    // Force refresh notification check (for debugging)
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    
    let filter: any;
    
    if (showAll) {
      // For debugging: show all notifications
      filter = {};
    } else {
      // Build filter query
      // Show notifications where user is either the recipient (userId) OR the related user (relatedId)
      filter = { 
        $or: [
          { userId: result.user._id },
          { relatedId: result.user._id }
        ]
      };
    }
    
    if (unreadOnly) {
      filter.read = false;
    }

    // Debug force refresh
    if (forceRefresh) {
      console.log('Force refresh requested for user:', result.user._id);
      console.log('Current filter:', filter);
      
      // Debug: Check if the specific notification exists
      const specificNotification = await db.collection("notifications").findOne({
        userId: result.user._id,
        title: "New Review"
      });
      console.log('Found notification for user:', specificNotification);
    }

    // Get total count for pagination
    const totalNotifications = await db.collection("notifications").countDocuments(filter);
    const totalPages = Math.ceil(totalNotifications / limit);
    const skip = (page - 1) * limit;

    // Get notifications with pagination, sorted by newest first
    const notifications = await db.collection("notifications")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      notifications: notifications,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalNotifications: totalNotifications,
        limit: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
    });

  } catch (error) {
    console.error('Get notifications API error:', error);
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

    // Verify the token
    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { userId, title, message, type, actionUrl, actionLabel, relatedId, relatedType } = await request.json();

    // Validate required fields
    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { success: false, message: 'userId, title, message, and type are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['info', 'success', 'warning', 'error'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification type' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Create notification
    const notification: Notification = {
      userId: new ObjectId(userId),
      title,
      message,
      type,
      read: false,
      actionUrl,
      actionLabel,
      relatedId: relatedId ? new ObjectId(relatedId) : undefined,
      relatedType,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result_notification = await db.collection("notifications").insertOne(notification);

    if (result_notification.insertedId) {
      return NextResponse.json({
        success: true,
        message: 'Notification created successfully',
        notification: { ...notification, _id: result_notification.insertedId }
      }, { status: 201 });
    } else {
      throw new Error('Failed to create notification');
    }

  } catch (error) {
    console.error('Create notification API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Verify the token
    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { action, notificationId } = await request.json();

    if (action === 'markAllAsRead') {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      // Mark all notifications as read for the user
      const updateResult = await db.collection("notifications").updateMany(
        { 
          $or: [
            { userId: result.user._id },
            { relatedId: result.user._id }
          ],
          read: false
        },
        { 
          $set: { 
            read: true,
            updatedAt: new Date()
          } 
        }
      );

      return NextResponse.json({
        success: true,
        message: `${updateResult.modifiedCount} notifications marked as read`,
        modifiedCount: updateResult.modifiedCount
      });
    }

    if (action === 'markAsRead' && notificationId) {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      // Mark specific notification as read
      const updateResult = await db.collection("notifications").updateOne(
        { 
          _id: new ObjectId(notificationId),
          $or: [
            { userId: result.user._id },
            { relatedId: result.user._id }
          ]
        },
        { 
          $set: { 
            read: true,
            updatedAt: new Date()
          } 
        }
      );

      if (updateResult.matchedCount === 0) {
        return NextResponse.json({
          success: false,
          message: 'Notification not found or access denied'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
        modifiedCount: updateResult.modifiedCount
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Mark all notifications as read API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}