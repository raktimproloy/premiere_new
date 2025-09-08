import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { authService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Read token (optional: allow anonymous but prefer authenticated)
    const token = request.cookies.get('authToken')?.value || '';
    let userInfo: any = null;
    if (token) {
      const result = await authService.verifyToken(token);
      if (result.valid && result.user) {
        userInfo = {
          id: result.user._id,
          email: result.user.email,
          name: result.user.fullName,
          role: result.user.role,
        };
      }
    }

    const client = await clientPromise;
    const db = client.db('premiere-stays');

    const helpMessage = {
      subject: String(subject).trim(),
      message: String(message).trim(),
      status: 'unread', // unread, read, responded
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      user: userInfo,
    };

    const result = await db.collection('help_messages').insertOne(helpMessage);

    if (!result.insertedId) {
      throw new Error('Failed to save help message');
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Help request submitted successfully',
        messageId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Help API POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit help request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'Help API is working' });
}


