import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    if (result.user.role !== 'admin' && result.user.role !== 'superadmin') {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db('premiere-stays');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || '';

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ success: false, message: 'Invalid pagination parameters' }, { status: 400 });
    }

    const filter: any = {};
    if (status && status !== 'all') filter.status = status;

    const totalMessages = await db.collection('help_messages').countDocuments(filter);
    const totalPages = Math.ceil(totalMessages / limit);
    const skip = (page - 1) * limit;

    const messages = await db
      .collection('help_messages')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        currentPage: page,
        totalPages,
        totalMessages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Admin help messages API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


