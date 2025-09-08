import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get main settings (public access)
    const mainSettings = await db.collection("pageSettings").findOne(
      { type: "main" },
      { projection: { _id: 0, updatedAt: 0, updatedBy: 0 } }
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
    console.error('Get public main settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
