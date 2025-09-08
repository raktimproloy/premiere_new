import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get home page settings
    const homeSettings = await db.collection("pageSettings").findOne(
      { type: "home" },
      { projection: { _id: 0 } }
    );

    if (!homeSettings) {
      // Return default structure if no settings exist
      return NextResponse.json({
        success: true,
        data: {
          partners: [],
          features: []
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: homeSettings.data
    });

  } catch (error) {
    console.error('Get home settings error:', error);
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

    const { partners, features } = await request.json();

    // Validate data structure
    if (!Array.isArray(partners) || !Array.isArray(features)) {
      return NextResponse.json(
        { success: false, message: 'Invalid data format. Partners and features must be arrays' },
        { status: 400 }
      );
    }

    // Validate partners data
    for (const partner of partners) {
      if (!partner.id || !partner.name || typeof partner.name !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Invalid partner data. Each partner must have an id and name' },
          { status: 400 }
        );
      }
    }

    // Validate features data
    for (const feature of features) {
      if (!feature.id || !feature.title || !feature.description || 
          typeof feature.title !== 'string' || typeof feature.description !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Invalid feature data. Each feature must have an id, title, and description' },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Upsert home page settings
    await db.collection("pageSettings").updateOne(
      { type: "home" },
      { 
        $set: { 
          type: "home",
          data: { partners, features },
          updatedAt: new Date(),
          updatedBy: result.user._id
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Home page settings updated successfully'
    });

  } catch (error) {
    console.error('Update home settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
