import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';
import { authService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie for authentication
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const { valid, user } = await authService.verifyToken(token);
    if (!valid || !user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency = 'usd', bookingData } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid amount' 
      }, { status: 400 });
    }

    if (!bookingData) {
      return NextResponse.json({ 
        success: false, 
        message: 'Booking data is required' 
      }, { status: 400 });
    }

    // Create payment intent with booking metadata
    const paymentIntent = await createPaymentIntent(amount, currency, {
      user_id: user._id,
      user_email: user.email,
      booking_data: JSON.stringify(bookingData),
      property_id: bookingData.propertyId,
      check_in: bookingData.checkInDate,
      check_out: bookingData.checkOutDate,
      guests: bookingData.guests,
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create payment intent'
    }, { status: 500 });
  }
}

