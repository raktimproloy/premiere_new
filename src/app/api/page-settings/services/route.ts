import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get services page settings
    const servicesSettings = await db.collection("pageSettings").findOne(
      { type: "services" },
      { projection: { _id: 0 } }
    );

    if (!servicesSettings) {
      // Return default structure if no settings exist
      return NextResponse.json({
        success: true,
        data: {
          services: []
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: servicesSettings.data
    });

  } catch (error) {
    console.error('Get services settings error:', error);
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

    const { services } = await request.json();

    if (!Array.isArray(services)) {
      return NextResponse.json(
        { success: false, message: 'Invalid data format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Upsert services page settings
    await db.collection("pageSettings").updateOne(
      { type: "services" },
      { 
        $set: { 
          type: "services",
          data: { services },
          updatedAt: new Date(),
          updatedBy: result.user._id
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Services page settings updated successfully'
    });

  } catch (error) {
    console.error('Update services settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
