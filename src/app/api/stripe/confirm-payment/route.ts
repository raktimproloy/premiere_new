import { NextRequest, NextResponse } from 'next/server';
import { retrievePaymentIntent } from '@/lib/stripe';
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
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Payment intent ID is required' 
      }, { status: 400 });
    }

    // Retrieve payment intent to check status
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    // Check if payment was successful
    if (paymentIntent.status === 'succeeded') {
      return NextResponse.json({
        success: true,
        paymentIntent,
        message: 'Payment confirmed successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to confirm payment'
    }, { status: 500 });
  }
}

