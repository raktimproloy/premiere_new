import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    return NextResponse.json({
      success: false,
      message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      error: 'Stripe not configured'
    }, { status: 500 });
  }

  try {
    // Test Stripe connection by creating a test payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000, // $20.00
      currency: 'usd',
      metadata: {
        test: 'true',
        source: 'api_test'
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Stripe connection successful',
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status
    });

  } catch (error) {
    console.error('Stripe test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Stripe connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


