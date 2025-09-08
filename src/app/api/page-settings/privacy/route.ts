import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get privacy policy settings
    const privacySettings = await db.collection("pageSettings").findOne(
      { type: "privacy" },
      { projection: { _id: 0 } }
    );

    if (!privacySettings) {
      // Return default structure if no settings exist
      return NextResponse.json({
        success: true,
        data: {
          privacyContent: ''
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: privacySettings.data
    });

  } catch (error) {
    console.error('Get privacy settings error:', error);
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

    const { privacyContent } = await request.json();

    if (typeof privacyContent !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid data format. Privacy content must be a string' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Upsert privacy policy settings
    await db.collection("pageSettings").updateOne(
      { type: "privacy" },
      { 
        $set: { 
          type: "privacy",
          data: { privacyContent },
          updatedAt: new Date(),
          updatedBy: result.user._id
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Privacy policy updated successfully'
    });

  } catch (error) {
    console.error('Update privacy settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
