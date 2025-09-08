import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get terms & conditions settings
    const termsSettings = await db.collection("pageSettings").findOne(
      { type: "terms" },
      { projection: { _id: 0 } }
    );

    if (!termsSettings) {
      // Return default structure if no settings exist
      return NextResponse.json({
        success: true,
        data: {
          termsContent: ''
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: termsSettings.data
    });

  } catch (error) {
    console.error('Get terms settings error:', error);
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

    const { termsContent } = await request.json();

    if (typeof termsContent !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid data format. Terms content must be a string' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Upsert terms & conditions settings
    await db.collection("pageSettings").updateOne(
      { type: "terms" },
      { 
        $set: { 
          type: "terms",
          data: { termsContent },
          updatedAt: new Date(),
          updatedBy: result.user._id
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Terms & conditions updated successfully'
    });

  } catch (error) {
    console.error('Update terms settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
