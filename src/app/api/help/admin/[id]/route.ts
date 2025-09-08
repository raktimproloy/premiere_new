import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authService } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('authToken')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });

    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    if (result.user.role !== 'admin' && result.user.role !== 'superadmin') {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    const { status } = await request.json();
    if (!status || !['unread', 'read', 'responded'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status value' }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid message ID format' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('premiere-stays');

    const updateResult = await db.collection('help_messages').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Message status updated successfully' });
  } catch (error) {
    console.error('Update help message API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('authToken')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });

    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    if (result.user.role !== 'superadmin') {
      return NextResponse.json({ success: false, message: 'Insufficient permissions. Only superadmin can delete messages.' }, { status: 403 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid message ID format' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('premiere-stays');

    const deleteResult = await db.collection('help_messages').deleteOne({ _id: new ObjectId(id) });
    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete help message API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


