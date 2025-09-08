import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

async function createGuestInOwnerRez(fullName: string, email: string, phone: string, request: NextRequest) {
  try {
    // Get the base URL from the request headers
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    const response = await fetch(`${baseUrl}/api/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName,
        email,
        phone
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Guest creation failed: ${error.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result.guest;
  } catch (error) {
    console.error('Guest creation error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Signup API called. Environment:', process.env.NODE_ENV);
    console.log('Vercel environment:', process.env.VERCEL);
    
    const { fullName, email, phone, dob, password, profileImage, registerType, role, contactPerson, mailingAddress, desiredService } = await request.json();

    // Debug logging for role
    console.log('API route role debug:', {
      receivedRole: role,
      roleType: typeof role,
      isGoogleUser: registerType === 'google'
    });

    // Check if this is a Google user
    const isGoogleUser = registerType === 'google';

    // Validate required fields (different for Google users)
    if (isGoogleUser) {
      // For Google users, only email and fullName are required
      if (!fullName || !email) {
        return NextResponse.json(
          { success: false, message: 'Full name and email are required' },
          { status: 400 }
        );
      }
    } else {
      // For regular users, all fields are required
      if (!fullName || !email || !phone || !dob || !password || !role) {
        return NextResponse.json(
          { success: false, message: 'All fields are required' },
          { status: 400 }
        );
      }
      
      // Validate role
      if (!['user', 'admin'].includes(role)) {
        return NextResponse.json(
          { success: false, message: 'Invalid role selected' },
          { status: 400 }
        );
      }
      
      // Additional validation for admin users
      if (role === 'admin') {
        if (!mailingAddress || !desiredService) {
          return NextResponse.json(
            { success: false, message: 'Mailing address and desired service are required for admin users' },
            { status: 400 }
          );
        }
        
        // Validate desired service
        const validServices = ['full-management', 'stage-and-manage', 'custom-manage'];
        if (!validServices.includes(desiredService)) {
          return NextResponse.json(
            { success: false, message: 'Invalid desired service selected' },
            { status: 400 }
          );
        }
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength (only for non-Google users)
    if (!isGoogleUser && password && password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // First, create guest in OwnerRez
    let guestData;
    try {
      // For Google users, use a valid phone number format
      const guestPhone = isGoogleUser ? '555-000-0000' : phone;
      console.log('Creating guest in OwnerRez with:', { fullName, email, guestPhone });
      guestData = await createGuestInOwnerRez(fullName, email, guestPhone, request);
      console.log('Guest created successfully:', guestData?.id);
    } catch (error) {
      console.error('Failed to create guest in OwnerRez:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create guest profile. Please try again.' },
        { status: 500 }
      );
    }

    // Then create user in our database with the guest ID
    const signupData = {
      fullName,
      email,
      phone: isGoogleUser ? '555-000-0000' : phone,
      dob: isGoogleUser ? '20-20-2020' : dob,
      password: isGoogleUser ? '' : password, // Empty password for Google users
      profileImage,
      guestId: guestData.id, // Add guest ID to the signup data
      registerType: registerType || 'manual', // Add register type
      role: role, // Add role
      // Admin-specific fields
      contactPerson: role === 'admin' ? contactPerson : undefined,
      mailingAddress: role === 'admin' ? mailingAddress : undefined,
      desiredService: role === 'admin' ? desiredService : undefined
    };

    // Debug logging for signup data
    console.log('Signup data being sent to auth service:', signupData);


    const result = await authService.signup(signupData);

    if (result.success) {
      const response = NextResponse.json(result, { status: 201 });
      
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
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Signup API error:', error);
    
    // Check if it's a MongoDB connection error
    if (error instanceof Error && error.message.includes('Server selection timed out')) {
      return NextResponse.json(
        { success: false, message: 'Database connection error. Please try again in a few moments.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 