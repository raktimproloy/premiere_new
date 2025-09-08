import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    const { valid, user } = await authService.verifyToken(token);
    if (!valid || !user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ success: false, message: 'Missing bookingId' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('premiere-stays');
    // Push bookingId to bookingIds array (create array if not exists)
    await db.collection('users').updateOne(
      { _id: new ObjectId(user._id) },
      { $push: { bookingIds: bookingId }, $set: { updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true, message: 'Booking ID added to user' });
  } catch (error) {
    console.error('Add booking to user error:', error);
    return NextResponse.json({ success: false, message: 'Failed to add booking to user', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}