import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { cloudinaryService } from '@/lib/cloudinaryService';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const result = await authService.verifyToken(token);

    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinaryService.uploadImage(
      file,
      'profiles', // folder name
      {
        quality: 80,
        format: 'auto'
      }
    );

    // Use Cloudinary URL
    const publicUrl = uploadResult.url;

    // Update user's profile image in MongoDB
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    const updateResult = await db.collection("users").updateOne(
      { _id: new ObjectId(result.user._id) },
      { 
        $set: { 
          profileImage: publicUrl,
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to update profile image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: publicUrl
    });

  } catch (error) {
    console.error('Upload image API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 