import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
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

    // Verify the token and check if user is superadmin
    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Only superadmin can upload home page images
    if (result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

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
    try {
      console.log('Starting Cloudinary upload for home page:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasArrayBuffer: 'arrayBuffer' in file,
        fileConstructor: file.constructor.name
      });

      const uploadResult = await cloudinaryService.uploadImage(file, 'home-page', {
        quality: 80,
        format: 'webp'
      });

      console.log('Cloudinary upload successful for home page:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: uploadResult.url,
        publicId: uploadResult.publicId
      });

      return NextResponse.json({
        success: true,
        message: 'Image uploaded successfully',
        url: uploadResult.url,
        publicId: uploadResult.publicId
      });
    } catch (uploadError) {
      console.error('Cloudinary upload failed for home page:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error: uploadError,
        errorMessage: uploadError instanceof Error ? uploadError.message : String(uploadError),
        errorStack: uploadError instanceof Error ? uploadError.stack : undefined
      });
      throw uploadError;
    }

  } catch (error) {
    console.error('Upload home page image API error:', error);
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
