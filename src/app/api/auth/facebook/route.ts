import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/jwt';
import clientPromise from '@/lib/mongodb';

// Function to create guest in OwnerRez (same as Google)
async function createGuestInOwnerRez(fullName: string, email: string, phone?: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_OWNERREZ_API_V1}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        firstName: fullName.split(' ')[0] || fullName,
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        email: email,
        phone: phone || 'N/A',
        address: {
          country: 'US',
          state: 'FL',
          city: 'Miami'
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`OwnerRez API error: ${response.status}`);
    }

    const guestData = await response.json();
    return guestData;
  } catch (error) {
    console.error('Error creating guest in OwnerRez:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, image } = await request.json();

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { success: false, message: 'Email and name are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      // Update last login
      await db.collection("users").updateOne(
        { _id: existingUser._id },
        { $set: { lastLogin: new Date(), updatedAt: new Date() } }
      );

      // Generate JWT token
      const token = generateToken({
        userId: existingUser._id.toString(),
        email: existingUser.email,
        role: existingUser.role
      });

      const response = NextResponse.json({
        success: true,
        message: 'Facebook login successful',
        user: existingUser,
        token
      }, { status: 200 });

      // Set HTTP-only cookie with the token
      response.cookies.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });

      return response;
    } else {
      // First, create guest in OwnerRez
      let guestData;
      try {
        guestData = await createGuestInOwnerRez(name, email);
      } catch (error) {
        console.error('Failed to create guest in OwnerRez:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to create guest profile. Please try again.' },
          { status: 500 }
        );
      }

      // Create new user in our database
      const newUser = {
        fullName: name,
        email: email.toLowerCase(),
        phone: 'N/A', // Facebook doesn't provide phone
        dob: 'N/A', // Facebook doesn't provide DOB
        password: '', // No password for Facebook users
        profileImage: image || "",
        role: "admin" as const,
        isActive: true,
        emailVerified: true, // Facebook accounts are verified
        guestId: guestData.id, // Store the guest ID
        registerType: 'facebook', // Mark as Facebook user
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
      };

      const result = await db.collection("users").insertOne(newUser);
      const userId = result.insertedId.toString();

      // Generate JWT token
      const token = generateToken({
        userId: userId,
        email: newUser.email,
        role: newUser.role
      });

      const response = NextResponse.json({
        success: true,
        message: 'Facebook signup successful',
        user: { ...newUser, _id: userId },
        token
      }, { status: 201 });

      // Set HTTP-only cookie with the token
      response.cookies.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });

      return response;
    }
  } catch (error) {
    console.error('Facebook auth API error:', error);
    return NextResponse.json(
      { success: false, message: 'Facebook authentication failed' },
      { status: 500 }
    );
  }
}
