import { NextResponse } from 'next/server';
import { cloudinaryService } from '@/lib/cloudinaryService';

export async function GET() {
  try {
    // Check environment variables
    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
    
    const configStatus = {
      hasCloudName: !!cloudinaryCloudName,
      hasApiKey: !!cloudinaryApiKey,
      hasApiSecret: !!cloudinaryApiSecret,
      cloudName: cloudinaryCloudName,
      apiKey: cloudinaryApiKey ? `${cloudinaryApiKey.substring(0, 8)}...` : 'missing',
      apiSecret: cloudinaryApiSecret ? `${cloudinaryApiSecret.substring(0, 8)}...` : 'missing'
    };

    // Try to upload a simple test image (base64)
    let uploadTest = null;
    try {
      // Test with a simple 1x1 pixel PNG
      const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      console.log('Attempting to upload test image...');
      uploadTest = await cloudinaryService.uploadImage(testImage, 'test');
      console.log('Upload successful:', uploadTest);
    } catch (uploadError) {
      console.error('Upload test failed:', uploadError);
      uploadTest = { 
        error: uploadError instanceof Error ? uploadError.message : 'Unknown upload error',
        fullError: uploadError
      };
    }

    return NextResponse.json({
      success: true,
      configStatus,
      uploadTest,
      message: 'Cloudinary test completed'
    });

  } catch (error) {
    console.error('Cloudinary test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Cloudinary test failed'
    }, { status: 500 });
  }
}
