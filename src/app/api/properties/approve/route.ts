import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

    // Only superadmin can approve properties
    if (authResult.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only superadmins can approve properties.' },
        { status: 403 }
      );
    }

    const { propertyId } = await request.json();

    if (!propertyId) {
      return NextResponse.json(
        { success: false, message: 'Property ID is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to approve property with ID:', propertyId);
    console.log('Property ID type:', typeof propertyId);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Try to find the property using different query strategies
    let property = null;
    let queryStrategy = '';

    // Strategy 1: Try to find by MongoDB ObjectId if it's a valid ObjectId
    if (ObjectId.isValid(propertyId)) {
      console.log('Strategy 1: Searching by MongoDB ObjectId');
      property = await db.collection("properties").findOne({ _id: new ObjectId(propertyId) });
      queryStrategy = 'ObjectId';
    }

    // Strategy 2: If not found by ObjectId, try to find by string ID
    if (!property) {
      console.log('Strategy 2: Searching by string ID');
      property = await db.collection("properties").findOne({ _id: propertyId });
      queryStrategy = 'string';
    }

    // Strategy 3: If still not found, try to find by ownerRezId
    if (!property) {
      console.log('Strategy 3: Searching by ownerRezId');
      property = await db.collection("properties").findOne({ ownerRezId: parseInt(propertyId) });
      queryStrategy = 'ownerRezId';
    }

    // Strategy 4: If still not found, try to find by ownerRezId as string
    if (!property) {
      console.log('Strategy 4: Searching by ownerRezId as string');
      property = await db.collection("properties").findOne({ ownerRezId: propertyId });
      queryStrategy = 'ownerRezId_string';
    }

    if (!property) {
      console.error('Property not found with any query strategy');
      console.error('Searched for propertyId:', propertyId);
      console.error('Tried strategies:', ['ObjectId', 'string', 'ownerRezId', 'ownerRezId_string']);
      
      // Let's also check what properties exist in the database
      const allProperties = await db.collection("properties").find({}).limit(5).toArray();
      console.error('Sample properties in database:', allProperties.map(p => ({
        _id: p._id,
        ownerRezId: p.ownerRezId,
        name: p.name
      })));

      return NextResponse.json(
        { 
          success: false, 
          message: 'Property not found',
          debug: {
            searchedId: propertyId,
            searchedIdType: typeof propertyId,
            triedStrategies: ['ObjectId', 'string', 'ownerRezId', 'ownerRezId_string'],
            sampleProperties: allProperties.map(p => ({
              _id: p._id,
              ownerRezId: p.ownerRezId,
              name: p.name
            }))
          }
        },
        { status: 404 }
      );
    }

    console.log('Property found using strategy:', queryStrategy);
    console.log('Property details:', {
      _id: property._id,
      ownerRezId: property.ownerRezId,
      name: property.name,
      status: property.status
    });

    if (!property.ownerRezId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Property does not have an OwnerRez ID',
          propertyDetails: {
            _id: property._id,
            name: property.name,
            status: property.status
          }
        },
        { status: 400 }
      );
    }

    // Update property in OwnerRez to set active = true
    const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
    const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
    const baseUrl = process.env.NEXT_PUBLIC_OWNERREZ_API_V1 || "https://api.ownerrez.com/v1";

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'API credentials not configured' },
        { status: 500 }
      );
    }

    console.log('Updating property in OwnerRez with ID:', property.ownerRezId);

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    // Update property in OwnerRez with ALL required fields
    const ownerRezRes = await fetch(`${baseUrl}/properties/${property.ownerRezId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ 
        active: true,
        name: property.name,
        // Required fields according to API documentation
        calendarColor: "FF0000",
        checkIn: "15:00",
        checkOut: "11:00",
        daysBeforeArrivalForCheck: 5,
        daysBeforeArrivalForCustom: 1,
        minHoursBeforeArrival: 2,
        minNights: 1,
        pendingAction: "cancel",
        pendingFor: "payment",
        pendingHoursForCheck: 1,
        pendingHoursForCreditCard: 1,
        pendingHoursForCustom: 1,
        quoteExpirationDays: 7,
        requireConfirmationForOnlineBookings: true,
        secondPaymentRule: "",
        securityDepositRule: "",
        securityDepositType: "hold",
        sendPaymentReminder: true,
        sendSecurityDepositReminder: true,
        travelInsuranceRule: "disabled",
        userId: 1,
        firstPaymentRule: "amount",
        maxGuests: property.maxGuests || 2,
        maxNights: 30
      }),
    });

    if (!ownerRezRes.ok) {
      const errorData = await ownerRezRes.json();
      console.error('OwnerRez API error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to approve property in OwnerRez',
          details: errorData,
          ownerRezId: property.ownerRezId
        },
        { status: ownerRezRes.status }
      );
    }

    console.log('Property successfully updated in OwnerRez');

    // Update property status in local database
    const updateResult = await db.collection("properties").updateOne(
      { _id: property._id },
      { 
        $set: { 
          status: 'active',
          updatedAt: new Date(),
          approvedBy: authResult.user._id,
          approvedAt: new Date()
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      console.error('Failed to update property in local database');
      return NextResponse.json(
        { success: false, message: 'Failed to update property in local database' },
        { status: 500 }
      );
    }

    console.log('Property successfully updated in local database');

    return NextResponse.json({
      success: true,
      message: 'Property approved successfully',
      propertyId: property._id,
      ownerRezId: property.ownerRezId,
      approvedBy: authResult.user._id,
      approvedAt: new Date(),
      debug: {
        queryStrategy: queryStrategy,
        originalPropertyId: propertyId
      }
    });

  } catch (error) {
    console.error('Property approval API error:', error);
    
    const errorMessage = error instanceof Error ? 
      error.message : 
      'Unknown error occurred';
      
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to approve property',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
