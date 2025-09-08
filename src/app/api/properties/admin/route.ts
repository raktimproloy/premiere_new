import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
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
        { success: false, message: 'Insufficient permissions. Only admins can view properties.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '8');

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page number. Must be a positive integer' },
        { status: 400 }
      );
    }
    
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: 'Invalid page size. Must be between 1 and 100' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * pageSize;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Build query based on user role
    let query = {};
    
    if (authResult.user.role === 'superadmin') {
      // Superadmin can see ALL properties
      query = {};
    } else {
      // Regular admin can only see their own properties
      query = {
        'owner.id': authResult.user._id
      };
    }

    // Get total count of properties based on role
    const totalCount = await db.collection("properties").countDocuments(query);

    // Get properties with pagination
    const properties = await db.collection("properties")
      .find(query)
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .skip(offset)
      .limit(pageSize)
      .toArray();

    // Format properties for frontend
    const formattedProperties = properties.map(property => ({
      id: property._id.toString(),
      name: property.name,
      type: property.propertyType,
      property_type: property.propertyType,
      bathrooms: property.bathrooms,
      bedrooms: property.bedrooms,
      capacity: property.maxGuests?.toString(),
      max_guests: property.maxGuests,
      price: property.pricing?.baseRate?.toString() || '0',
      status: property.status === 'draft' ? 'Pending' : 
              property.status === 'active' ? 'Active' : 
              property.status === 'occupied' ? 'Occupied' : 'Pending',
      active: property.status === 'active',
      listingDate: property.createdAt,
      description: property.description,
      address: property.address,
      images: property.images || [],
      amenities: property.amenities || [],
      rules: property.rules || [],
      owner: property.owner,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    }));

    return NextResponse.json({
      success: true,
      total: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      properties: formattedProperties,
      userRole: authResult.user.role,
      canManageAllProperties: authResult.user.role === 'superadmin'
    });

  } catch (error) {
    console.error('Admin properties API error:', error);
    
    const errorMessage = error instanceof Error ? 
      error.message : 
      'Unknown error occurred';
      
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch admin properties',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
