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

    // Only admin and superadmin can update roles
    if (result.user.role !== 'admin' && result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { userId, newRole } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { success: false, message: 'User ID and new role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['user', 'admin', 'superadmin'].includes(newRole)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Only superadmin can assign superadmin role
    if (newRole === 'superadmin' && result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Only superadmin can assign superadmin role' },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Update user role
    const updateResult = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role: newRole,
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully'
    });

  } catch (error) {
    console.error('Update role API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 