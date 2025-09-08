import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, property, message } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Create contact message document
    const contactMessage = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      property: property?.trim() || 'General Inquiry',
      message: message.trim(),
      status: 'unread', // unread, read, responded
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // Save to database
    const result = await db.collection("contact_messages").insertOne(contactMessage);

    if (result.insertedId) {
      return NextResponse.json({
        success: true,
        message: 'Contact message sent successfully! We will get back to you soon.',
        messageId: result.insertedId
      }, { status: 201 });
    } else {
      throw new Error('Failed to save contact message');
    }

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint could be used by admins to view contact messages
    // For now, we'll just return a simple response
    return NextResponse.json({
      success: true,
      message: 'Contact API is working'
    });
  } catch (error) {
    console.error('Contact GET API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
