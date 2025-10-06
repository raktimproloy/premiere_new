import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // First check if user exists and get their register type
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    const user = await db.collection("users").findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Check register type and show appropriate error for social login users
    if (user.registerType === 'google') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'This account was created with Google. Please use the "Continue with Google" button to login.',
          error: 'GOOGLE_ACCOUNT'
        },
        { status: 401 }
      );
    }

        if (user.registerType === 'facebook') {
      return NextResponse.json(
        { 
          success: false,
          message: 'This account was created with Facebook. Please use the "Continue with Facebook" button to login.',
          error: 'FACEBOOK_ACCOUNT'
        },
        { status: 401 }
      );
    }

    if (user.registerType === 'apple') {
      return NextResponse.json(
        { 
          success: false,
          message: 'This account was created with Apple. Please use the "Continue with Apple" button to login.',
          error: 'APPLE_ACCOUNT'
        },
        { status: 401 }
      );
    }

    // For manual users, proceed with normal login
    const result = await authService.login(email, password);

    if (result.success) {
      const response = NextResponse.json(result, { status: 200 });
      
      // Set HTTP-only cookie with the token
      response.cookies.set('authToken', result.token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });

      return response;
    } else {
      return NextResponse.json(result, { status: 401 });
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 