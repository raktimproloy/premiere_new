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

    // Only superadmin can upload about page images
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

    // Validate file type - support both images and videos
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, WebP images and MP4, WebM, OGV videos are allowed' },
        { status: 400 }
      );
    }

    // Validate file size based on type
    const isVideo = allowedVideoTypes.includes(file.type);
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for videos, 5MB for images
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { success: false, message: `File size too large. Maximum size is ${maxSizeMB}MB.` },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    try {
      console.log('Starting Cloudinary upload for about page:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasArrayBuffer: 'arrayBuffer' in file,
        fileConstructor: file.constructor.name
      });

      let uploadResult;
      
      if (isVideo) {
        // Use video upload for video files
        uploadResult = await cloudinaryService.uploadVideo(file, 'about-page', {
          quality: 80
        });
      } else {
        // Use image upload for image files
        uploadResult = await cloudinaryService.uploadImage(file, 'about-page', {
          quality: 80,
          format: 'webp'
        });
      }

      console.log('Cloudinary upload successful for about page:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        resourceType: uploadResult.resourceType
      });

      return NextResponse.json({
        success: true,
        message: `${isVideo ? 'Video' : 'Image'} uploaded successfully`,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        mediaType: isVideo ? 'video' : 'image'
      });
    } catch (uploadError) {
      console.error('Cloudinary upload failed for about page:', {
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
    console.error('Upload about page image API error:', error);
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
