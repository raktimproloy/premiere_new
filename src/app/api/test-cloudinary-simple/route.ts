import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET() {
  try {
    // Configure Cloudinary directly
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
    });

    console.log('Cloudinary configured, attempting simple upload...');

    // Try a very simple upload
    const result = await cloudinary.uploader.upload(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      {
        folder: 'test',
        public_id: 'test-simple'
      }
    );

    console.log('Simple upload successful:', result);

    return NextResponse.json({
      success: true,
      result: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      },
      message: 'Simple Cloudinary upload successful'
    });

  } catch (error) {
    console.error('Simple Cloudinary test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fullError: error,
      message: 'Simple Cloudinary test failed'
    }, { status: 500 });
  }
}
