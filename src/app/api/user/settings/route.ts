import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

    const result = await authService.verifyToken(token);

    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get user settings from database
    const userSettings = await db.collection("userSettings").findOne({
      userId: new ObjectId(result.user._id)
    });

    // Return default settings if none exist
    const defaultSettings = {
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      propertyPreferences: {
        preferredLocation: '',
        maxPrice: 0,
        propertyType: '',
        minBedrooms: 1
      },
      socialMedia: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: ''
      }
    };

    const settings = userSettings ? userSettings.settings : defaultSettings;
    
    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Get settings API error:', error);
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

    const result = await authService.verifyToken(token);

    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const settings = await request.json();

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Upsert user settings
    const result2 = await db.collection("userSettings").updateOne(
      { userId: new ObjectId(result.user._id) },
      { 
        $set: { 
          settings,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    if (result2.acknowledged) {
      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to update settings' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Update settings API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
