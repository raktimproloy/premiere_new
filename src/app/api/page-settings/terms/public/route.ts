import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get terms & conditions settings (public access)
    const termsSettings = await db.collection("pageSettings").findOne(
      { type: "terms" },
      { projection: { _id: 0, updatedAt: 0, updatedBy: 0 } }
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
    console.error('Get public terms settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
