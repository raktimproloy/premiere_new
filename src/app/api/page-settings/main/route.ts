import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get main settings
    const mainSettings = await db.collection("pageSettings").findOne(
      { type: "main" },
      { projection: { _id: 0 } }
    );

    if (!mainSettings) {
      // Return default structure if no settings exist
      return NextResponse.json({
        success: true,
        data: {
          phone: '',
          email: '',
          address: '',
          facebook: '',
          x: '',
          instagram: '',
          youtube: ''
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: mainSettings.data
    });

  } catch (error) {
    console.error('Get main settings error:', error);
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

    // Verify the token and check if user is superadmin
    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Only superadmin can update page settings
    if (result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { phone, email, address, facebook, x, instagram, youtube } = await request.json();

    // Validate data - all fields are optional but should be strings if provided
    if (phone !== undefined && typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Phone must be a string' },
        { status: 400 }
      );
    }

    if (email !== undefined && typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email must be a string' },
        { status: 400 }
      );
    }

    if (address !== undefined && typeof address !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Address must be a string' },
        { status: 400 }
      );
    }

    if (facebook !== undefined && typeof facebook !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Facebook URL must be a string' },
        { status: 400 }
      );
    }

    if (x !== undefined && typeof x !== 'string') {
      return NextResponse.json(
        { success: false, message: 'X URL must be a string' },
        { status: 400 }
      );
    }

    if (instagram !== undefined && typeof instagram !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Instagram URL must be a string' },
        { status: 400 }
      );
    }

    if (youtube !== undefined && typeof youtube !== 'string') {
      return NextResponse.json(
        { success: false, message: 'YouTube URL must be a string' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Upsert main settings
    await db.collection("pageSettings").updateOne(
      { type: "main" },
      { 
        $set: { 
          type: "main",
          data: { phone, email, address, facebook, x, instagram, youtube },
          updatedAt: new Date(),
          updatedBy: result.user._id
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Main settings updated successfully'
    });

  } catch (error) {
    console.error('Update main settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
