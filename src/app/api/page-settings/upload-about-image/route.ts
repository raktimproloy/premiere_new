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

    // Check content length for Vercel limits
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) { // 5MB limit for Vercel
      return NextResponse.json(
        { success: false, message: 'File too large for upload. Please use a smaller file or compress it.' },
        { status: 413 }
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

    // Additional size check for Vercel deployment
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 5MB for deployment.' },
        { status: 413 }
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

    // File size validation removed - no size limits

    // Determine if file is video
    const isVideo = allowedVideoTypes.includes(file.type);

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
