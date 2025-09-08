import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get about page settings
    const aboutSettings = await db.collection("pageSettings").findOne(
      { type: "about" },
      { projection: { _id: 0 } }
    );

    if (!aboutSettings) {
      // Return default structure if no settings exist
      return NextResponse.json({
        success: true,
        data: {
          title: '',
          aboutText: '',
          items: [],
          mainMedia: '',
          mainMediaType: 'image',
          smallImages: ['', '', '']
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: aboutSettings.data
    });

  } catch (error) {
    console.error('Get about settings error:', error);
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

    const { title, aboutText, items, mainMedia, mainMediaType, smallImages } = await request.json();

    if (!title || !aboutText || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, message: 'Invalid data format. Title, aboutText, and items are required' },
        { status: 400 }
      );
    }

    // Validate media fields
    if (typeof mainMedia !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid mainMedia format' },
        { status: 400 }
      );
    }

    if (mainMediaType && !['image', 'video'].includes(mainMediaType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid mainMediaType. Must be either "image" or "video"' },
        { status: 400 }
      );
    }

    if (!Array.isArray(smallImages) || smallImages.length !== 3 || !smallImages.every(img => typeof img === 'string')) {
      return NextResponse.json(
        { success: false, message: 'Invalid smallImages format. Must be an array of 3 strings' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Upsert about page settings
    await db.collection("pageSettings").updateOne(
      { type: "about" },
      { 
        $set: { 
          type: "about",
          data: { title, aboutText, items, mainMedia, mainMediaType, smallImages },
          updatedAt: new Date(),
          updatedBy: result.user._id
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'About page settings updated successfully'
    });

  } catch (error) {
    console.error('Update about settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
