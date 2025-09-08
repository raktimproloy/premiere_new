import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get privacy policy settings (public access)
    const privacySettings = await db.collection("pageSettings").findOne(
      { type: "privacy" },
      { projection: { _id: 0, updatedAt: 0, updatedBy: 0 } }
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
    console.error('Get public privacy settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
