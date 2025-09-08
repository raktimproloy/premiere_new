import { NextRequest, NextResponse } from 'next/server';
import { cloudinaryService } from '@/lib/cloudinaryService';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { authService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie and verify authentication
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token and get user information
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin or superadmin
    if (authResult.user.role !== 'admin' && authResult.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only admins can create properties.' },
        { status: 403 }
      );
    }

    console.log('Property creation initiated by user:', {
      userId: authResult.user._id,
      userEmail: authResult.user.email,
      userName: authResult.user.fullName,
      userRole: authResult.user.role
    });

    const formData = await request.formData();
    
    console.log('FormData received:', {
      hasPropertyData: formData.has('propertyData'),
      hasImages: formData.has('images'),
      imageCount: formData.getAll('images').length
    });
    
    // Extract property data
    const propertyData = JSON.parse(formData.get('propertyData') as string);
    const images = formData.getAll('images') as File[];
    
    console.log('Property data:', propertyData);
    console.log('Images extracted:', images?.length || 0);
    if (images && images.length > 0) {
      console.log('First image:', {
        name: images[0].name,
        size: images[0].size,
        type: images[0].type,
        constructor: images[0].constructor.name,
        isFile: images[0] instanceof File,
        hasArrayBuffer: typeof images[0].arrayBuffer === 'function'
      });
    }
    
    const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
    const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
    const baseUrl = process.env.NEXT_PUBLIC_OWNERREZ_API_V1 || "https://api.ownerrez.com/v1";

    // Check Cloudinary configuration
    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
    
    console.log('Cloudinary config check:', {
      hasCloudName: !!cloudinaryCloudName,
      hasApiKey: !!cloudinaryApiKey,
      hasApiSecret: !!cloudinaryApiSecret
    });

    if (!username || !password) {
      return NextResponse.json({ error: 'API credentials not configured' }, { status: 500 });
    }

    if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
      return NextResponse.json({ error: 'Cloudinary configuration not complete' }, { status: 500 });
    }

    // STEP 1: Create property in OwnerRez first
    console.log('Step 1: Creating property in OwnerRez...');
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    const ownerRezPayload = {
      active: false, // Start as inactive (draft) - superadmin will approve later
      name: propertyData.name,
      address: {
        street1: propertyData.address?.street1 || propertyData.propertyLocation || '',
        street2: propertyData.address?.street2 || '',
        city: propertyData.address?.city || '',
        province: propertyData.address?.state || '',
        state: propertyData.address?.state || '',
        postalCode: propertyData.address?.postalCode || '',
        country: propertyData.address?.country || 'USA',
      },
      calendar_color: "FF0000",
      check_in: "15:00",
      check_out: "11:00",
      days_before_arrival_for_check: 5,
      days_before_arrival_for_custom: 1,
      min_hours_before_arrival: 2,
      min_nights: 1,
      pending_action: "cancel",
      pending_for: "payment",
      pending_hours_for_check: 1,
      pending_hours_for_credit_card: 1,
      pending_hours_for_custom: 1,
      quote_expiration_days: 7,
      require_confirmation_for_online_bookings: true,
      second_payment_rule: "schedule_never",
      security_deposit_rule: "take_if",
      security_deposit_type: "hold",
      send_payment_reminder: true,
      send_security_deposit_reminder: true,
      travel_insurance_rule: "disabled",
      user_id: 1,
    };

    console.log('OwnerRez payload:', ownerRezPayload);

    const ownerRezRes = await fetch(`${baseUrl}/properties`, {
      method: 'POST',
      headers,
      body: JSON.stringify(ownerRezPayload),
    });

    const ownerRezData = await ownerRezRes.json();
    console.log('OwnerRez response:', {
      status: ownerRezRes.status,
      data: ownerRezData
    });

    if (!ownerRezRes.ok) {
      console.error('OwnerRez API error:', ownerRezData);
      return NextResponse.json({ 
        success: false,
        error: ownerRezData.message || 'Failed to create property in OwnerRez', 
        details: ownerRezData 
      }, { status: ownerRezRes.status });
    }

    // Extract the OwnerRez property ID
    const ownerRezId = ownerRezData.id;
    if (!ownerRezId) {
      console.error('OwnerRez response missing ID:', ownerRezData);
      return NextResponse.json({ 
        success: false,
        error: 'OwnerRez API did not return a property ID' 
      }, { status: 500 });
    }

    console.log('Property created in OwnerRez with ID:', ownerRezId);

    // STEP 2: Upload images to Cloudinary
    console.log('Step 2: Uploading images to Cloudinary...');
    let cloudinaryImages: Array<{
      url: string;
      publicId: string;
      width?: number;
      height?: number;
      format: string;
      size: number;
    }> = [];
    
    // console.log('Images to upload:', images?.length || 0);
    
    if (images && images.length > 0) {
      try {
        console.log('Starting Cloudinary upload...');
        console.log('Image types:', images.map(img => img.type));
        console.log('Image sizes:', images.map(img => img.size));
        
        // Ensure images are properly converted to the expected format
        const processedImages = images.filter(img => 
          img instanceof File || typeof img === 'string' || Buffer.isBuffer(img)
        );
        
        if (processedImages.length > 0) {
          cloudinaryImages = await cloudinaryService.uploadMultipleImages(
            processedImages,
            'properties',
            { quality: 80 }
          );
          console.log('Cloudinary upload successful:', cloudinaryImages.length, 'images');
          if (cloudinaryImages.length > 0) {
            console.log('First image URL:', cloudinaryImages[0]?.url);
          }
        } else {
          console.warn('No valid images to upload after processing');
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        console.error('Error details:', {
          name: cloudinaryError instanceof Error ? cloudinaryError.name : 'Unknown',
          message: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error',
          stack: cloudinaryError instanceof Error ? cloudinaryError.stack : 'No stack trace'
        });
        // Continue with property creation even if image upload fails
        cloudinaryImages = []; // Ensure it's an empty array on error
      }
    } else {
      console.log('No images to upload');
    }

    // STEP 3: Save property data to MongoDB with OwnerRez ID
    console.log('Step 3: Saving property to local database...');
    const client = await clientPromise;
    const db = client.db("premiere-stays");
    
    const mongoPropertyData = {
      ownerRezId: ownerRezId, // Use the ID returned from OwnerRez
      name: propertyData.name,
      description: propertyData.details || propertyData.editorValue || '',
      propertyType: propertyData.propertyType || 'house',
      address: {
        street1: propertyData.address?.street1 || propertyData.propertyLocation || '',
        street2: propertyData.address?.street2 || '',
        city: propertyData.address?.city || '',
        state: propertyData.address?.state || '',
        country: propertyData.address?.country || 'USA',
        postalCode: propertyData.address?.postalCode || '',
      },
      bedrooms: parseInt(propertyData.totalBedroom) || 1,
      bathrooms: parseInt(propertyData.totalBathroom) || 1,
      maxGuests: parseInt(propertyData.capacity) || 2,
      maxPets: 0,
      images: cloudinaryImages.map((img, index) => ({
        url: img.url,
        publicId: img.publicId,
        alt: `${propertyData.name} - Image ${index + 1}`,
        isPrimary: index === 0,
        uploadedAt: new Date(),
      })),
      amenities: [],
      rules: [],
      pricing: {
        baseRate: 0,
        currency: 'USD',
        cleaningFee: 0,
        serviceFee: 0,
        taxes: 0,
      },
      availability: {
        checkInTime: "15:00",
        checkOutTime: "11:00",
        minStay: 1,
        maxStay: 30,
      },
      policies: {
        cancellationPolicy: "Standard",
        houseRules: [],
        petPolicy: "No pets allowed",
        smokingPolicy: "No smoking",
      },
      owner: {
        id: authResult.user._id,
        name: authResult.user.fullName,
        email: authResult.user.email,
        phone: authResult.user.phone || "",
      },
      status: 'draft', // Start as draft - superadmin will approve
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSyncedWithOwnerRez: new Date(),
    };

    console.log('MongoDB property data to save:', {
      ownerRezId: mongoPropertyData.ownerRezId,
      name: mongoPropertyData.name,
      ownerId: mongoPropertyData.owner.id,
      ownerName: mongoPropertyData.owner.name,
      ownerEmail: mongoPropertyData.owner.email,
      imageCount: mongoPropertyData.images.length,
      firstImageUrl: mongoPropertyData.images[0]?.url
    });

    const mongoResult = await db.collection("properties").insertOne(mongoPropertyData);

    console.log('MongoDB insert result:', {
      success: mongoResult.acknowledged,
      insertedId: mongoResult.insertedId
    });

    if (!mongoResult.acknowledged) {
      console.error('Failed to insert property into MongoDB');
      return NextResponse.json({ 
        success: false,
        error: 'Failed to save property to local database' 
      }, { status: 500 });
    }

    console.log('Property creation completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Property created successfully in both OwnerRez and local database',
      ownerRezProperty: {
        id: ownerRezId,
        ...ownerRezData
      },
      mongoProperty: {
        _id: mongoResult.insertedId,
        ...mongoPropertyData
      },
      images: cloudinaryImages,
      nextSteps: 'Property is now in draft status. A superadmin must approve it before it becomes active.'
    });

  } catch (error) {
    console.error('Property creation error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create property', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}