import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

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

    const result = await authService.verifyToken(token);

    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { oldPassword, newPassword, confirmPassword } = await request.json();

    // Validate required fields
    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All password fields are required' },
        { status: 400 }
      );
    }

    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if new password is different from old password
    if (oldPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from old password' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get current user with password
    const user = await db.collection("users").findOne({
      _id: new ObjectId(result.user._id)
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password in MongoDB
    const updateResult = await db.collection("users").updateOne(
      { _id: new ObjectId(result.user._id) },
      { 
        $set: { 
          password: hashedNewPassword,
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Update password API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update password',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 