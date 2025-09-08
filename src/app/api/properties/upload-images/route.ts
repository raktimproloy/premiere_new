import { NextRequest, NextResponse } from 'next/server';
import { cloudinaryService } from '@/lib/cloudinaryService';
import { propertyService } from '@/lib/propertyService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const propertyId = formData.get('propertyId') as string;
    const images = formData.getAll('images') as File[];
    const folder = formData.get('folder') as string || 'properties';

    if (!propertyId) {
      return NextResponse.json({ 
        error: 'Property ID is required' 
      }, { status: 400 });
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ 
        error: 'At least one image is required' 
      }, { status: 400 });
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = images.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
        invalidFiles: invalidFiles.map(f => f.name)
      }, { status: 400 });
    }

    // Upload images to Cloudinary
    console.log(`Uploading ${images.length} images to Cloudinary...`);
    const uploadResults = await cloudinaryService.uploadMultipleImages(images, folder);

    // Update property in database with new images
    const property = await propertyService.getPropertyById(propertyId);
    if (!property) {
      return NextResponse.json({ 
        error: 'Property not found' 
      }, { status: 404 });
    }

    // Convert upload results to PropertyImage format
    const newImages = uploadResults.map((result, index) => ({
      url: result.url,
      publicId: result.publicId,
      alt: `Property image ${index + 1}`,
      isPrimary: index === 0, // First image is primary
      uploadedAt: new Date()
    }));

    // Update property with new images
    const updateResult = await propertyService.updateProperty(propertyId, {
      images: [...property.images, ...newImages]
    });

    if (!updateResult.success) {
      console.error('Failed to update property with images:', updateResult.error);
      // Note: Images were uploaded successfully, but property update failed
      // We should consider cleaning up the uploaded images
    }

    return NextResponse.json({
      success: true,
      message: 'Images uploaded successfully',
      images: newImages,
      propertyUpdated: updateResult.success,
      uploadResults
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload images', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, imagePublicIds } = body;

    if (!propertyId || !imagePublicIds || !Array.isArray(imagePublicIds)) {
      return NextResponse.json({ 
        error: 'Property ID and image public IDs are required' 
      }, { status: 400 });
    }

    // Delete images from Cloudinary
    console.log(`Deleting ${imagePublicIds.length} images from Cloudinary...`);
    const deleteResult = await cloudinaryService.deleteMultipleImages(imagePublicIds);

    if (!deleteResult.success) {
      console.warn('Some images failed to delete from Cloudinary:', deleteResult.error);
    }

    // Update property in database to remove deleted images
    const property = await propertyService.getPropertyById(propertyId);
    if (!property) {
      return NextResponse.json({ 
        error: 'Property not found' 
      }, { status: 404 });
    }

    // Remove deleted images from property
    const updatedImages = property.images.filter(img => 
      !imagePublicIds.includes(img.publicId)
    );

    const updateResult = await propertyService.updateProperty(propertyId, {
      images: updatedImages
    });

    if (!updateResult.success) {
      console.error('Failed to update property after image deletion:', updateResult.error);
    }

    return NextResponse.json({
      success: true,
      message: 'Images deleted successfully',
      deletedCount: deleteResult.deletedCount,
      propertyUpdated: updateResult.success,
      remainingImages: updatedImages.length
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete images', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
