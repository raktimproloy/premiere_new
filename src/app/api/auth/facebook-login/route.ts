import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, name, image } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Check if user exists and is a Facebook user
    const existingUser = await db.collection("users").findOne({
      email: email.toLowerCase(),
      registerType: 'facebook'
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'Facebook user not found' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!existingUser.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Update last login and any profile changes
    await db.collection("users").updateOne(
      { _id: existingUser._id },
      { 
        $set: { 
          lastLogin: new Date(), 
          updatedAt: new Date(),
          // Update profile image if provided and different
          ...(image && image !== existingUser.profileImage && { profileImage: image }),
          // Update name if provided and different
          ...(name && name !== existingUser.fullName && { fullName: name })
        } 
      }
    );

    // Generate JWT token
    const token = generateToken({
      userId: existingUser._id.toString(),
      email: existingUser.email,
      role: existingUser.role
    });

    const response = NextResponse.json({
      success: true,
      message: 'Facebook login successful',
      user: existingUser,
      token
    }, { status: 200 });

    // Set HTTP-only cookie with the token
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Facebook login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Facebook login failed' },
      { status: 500 }
    );
  }
}
