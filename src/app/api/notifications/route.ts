import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface Notification {
  _id?: ObjectId;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  relatedId?: string; // ID of related booking, property, etc.
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

    // Build filter query
    const filter: any = { userId: result.user._id };
    
    if (unreadOnly) {
      filter.read = false;
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
      }
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
      userId,
      title,
      message,
      type,
      read: false,
      actionUrl,
      actionLabel,
      relatedId,
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
