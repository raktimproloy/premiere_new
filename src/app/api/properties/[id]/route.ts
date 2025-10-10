import { NextRequest, NextResponse } from 'next/server';
import { propertyService } from '@/lib/propertyService';
import { ensureThumbnailUrls } from '@/utils/propertyCache';
import { updateProperty } from '@/lib/ownerRezService';
import { authService } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
  }

  try {
    const idAsNumber = Number(id);
    const shouldQueryOwnerRez = !Number.isNaN(idAsNumber) && Number.isFinite(idAsNumber);

    // First, check local database for property with ownerRezId
    let localProperty = null;
    if (shouldQueryOwnerRez) {
      localProperty = await propertyService.getPropertyByOwnerRezId(idAsNumber);
    } else {
      localProperty = await propertyService.getPropertyById(id);
    }

    // If property exists in local database, return it with the same response format
    if (localProperty) {
      console.log(`Property ${id} found in local database, returning local data`);
      
      // Format the response to match the expected structure
      const formattedProperty = {
        id: localProperty.ownerRezId || localProperty._id,
        name: localProperty.name,
        property_type: localProperty.propertyType,
        bedrooms: localProperty.bedrooms,
        bathrooms: localProperty.bathrooms,
        bathrooms_full: localProperty.bathrooms,
        bathrooms_half: 0,
        max_guests: localProperty.maxGuests,
        max_children: 0,
        max_pets: localProperty.maxPets || 0,
        active: localProperty.status === 'active',
        check_in: localProperty.availability?.checkInTime || '15:00',
        check_out: localProperty.availability?.checkOutTime || '11:00',
        address: localProperty.address,
        thumbnail_url: localProperty.images?.[0]?.url || localProperty.thumbnail_url,
        thumbnail_url_medium: localProperty.images?.[0]?.url || localProperty.thumbnail_url_medium,
        thumbnail_url_large: localProperty.images?.[0]?.url || localProperty.thumbnail_url_large,
        currency_code: 'USD',
        is_snoozed: false,
        key: localProperty.ownerRezId ? `local-${localProperty.ownerRezId}` : `local-${localProperty._id}`,
        latitude: localProperty.address?.latitude || null,
        longitude: localProperty.address?.longitude || null,
        listing_numbers: {},
        living_area: null,
        living_area_type: null,
        owner_id: localProperty.owner?.id || null,
        services: localProperty.services || [],
        localData: {
          _id: (localProperty as any)._id,
          description: localProperty.description,
          amenities: localProperty.amenities,
          rules: localProperty.rules,
          pricing: localProperty.pricing,
          availability: localProperty.availability,
          policies: localProperty.policies,
          owner: localProperty.owner,
          status: localProperty.status,
          isVerified: localProperty.isVerified,
          images: localProperty.images,
          services: localProperty.services,
          features: localProperty.features || [],
          createdAt: localProperty.createdAt,
          updatedAt: localProperty.updatedAt,
          lastSyncedWithOwnerRez: localProperty.lastSyncedWithOwnerRez
        }
      };

      return NextResponse.json({ 
        success: true, 
        property: formattedProperty,
        source: 'local_database',
        ownerRezError: null,
        localId: String((localProperty as any)._id)
      });
    }

    // If not found in local database, try OwnerRez as fallback
    const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
    const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
    const baseUrl = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";

    if (!username || !password || !baseUrl) {
      return NextResponse.json({ error: 'API credentials not configured' }, { status: 500 });
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    let ownerRezProperty = null;
    let ownerRezError = null;

    if (shouldQueryOwnerRez) {
      const url = `${baseUrl}/properties/${id}`;
      try {
        const res = await fetch(url, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          ownerRezProperty = await res.json();
        } else {
          const errorText = await res.text();
          try {
            const errorJson = JSON.parse(errorText);
            ownerRezError = `${res.status} - ${errorJson.message || 'Unknown error'}`;
          } catch {
            ownerRezError = `${res.status} - ${errorText || 'Unknown error'}`;
          }
        }
      } catch (error) {
        ownerRezError = 'Failed to fetch from OwnerRez API';
      }
    }

    if (ownerRezProperty) {
      // Only OwnerRez exists
      const mergedProperty = {
        ...ownerRezProperty,
        localData: null
      };
      
      return NextResponse.json({ 
        success: true, 
        property: mergedProperty,
        source: 'ownerrez_only',
        ownerRezError: null,
        localId: null
      });
    } else {
      // Neither exists
      return NextResponse.json({ 
        error: 'Property not found in either local database or OwnerRez',
        ownerRezError,
        source: 'not_found'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Property fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch property', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
  }

  try {
    // Get token from cookie and verify authentication
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    // Verify the token and get user information
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin or superadmin
    if (authResult.user.role !== 'admin' && authResult.user.role !== 'superadmin') {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const idAsNumber = Number(id);
    const isNumericId = !Number.isNaN(idAsNumber) && Number.isFinite(idAsNumber);

    let ownerRezId: number | null = null;
    let ownerRezResponse: any = null;
    let ownerRezSuccess = false;

    // First, get the property from local database to find ownerRezId
    const client = await (await import('@/lib/mongodb')).default;
    const db = client.db('premiere-stays');

    let localProperty = null;
    if (isNumericId) {
      // If ID is numeric, it might be an OwnerRez ID
      ownerRezId = idAsNumber;
      localProperty = await db.collection('properties').findOne({ ownerRezId: idAsNumber });
    } else {
      // If ID is not numeric, it's a MongoDB ObjectId
      const { ObjectId } = await import('mongodb');
      localProperty = await db.collection('properties').findOne({ _id: new ObjectId(id) });
      if (localProperty && localProperty.ownerRezId) {
        ownerRezId = localProperty.ownerRezId;
      }
    }

    // If we have an ownerRezId, try to update in OwnerRez first
    if (ownerRezId) {
      try {
        // Prepare OwnerRez update data
        const ownerRezUpdateData: any = {
          Name: body.name
        };

        // Add check-in and check-out times if provided
        if (typeof body.check_in === 'string') {
          ownerRezUpdateData.check_in = body.check_in;
        }
        if (typeof body.check_out === 'string') {
          ownerRezUpdateData.check_out = body.check_out;
        }

        // Only allow Active field update if user is superadmin and active is explicitly provided
        if (authResult.user.role === 'superadmin' && body.active !== undefined) {
          console.log('Updating OwnerRez Active field:', body.active);
          ownerRezUpdateData.Active = body.active;
        } else {
          console.log('No OwnerRez Active update - body.active:', body.active, 'user role:', authResult.user.role);
        }

        // Call OwnerRez service directly
        const ownerRezUpdateResult = await updateProperty(ownerRezId, ownerRezUpdateData);
        
        if (ownerRezUpdateResult.success) {
          ownerRezSuccess = true;
          ownerRezResponse = ownerRezUpdateResult.data;
          console.log('OwnerRez update successful:', ownerRezUpdateResult);
        } else {
          console.error('OwnerRez update failed:', ownerRezUpdateResult.error);
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to update property in OwnerRez: ' + ownerRezUpdateResult.error,
            details: ownerRezUpdateResult 
          }, { status: 400 });
        }
      } catch (ownerRezError) {
        console.error('OwnerRez API error:', ownerRezError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to update property in OwnerRez: ' + (ownerRezError instanceof Error ? ownerRezError.message : 'Unknown error')
        }, { status: 500 });
      }
    } else {
      // No ownerRezId found, proceed with local update only
      console.log('No ownerRezId found, updating local database only');
      ownerRezSuccess = true;
    }

    // Only update local database if OwnerRez update was successful (or if it's not an OwnerRez property)
    if (ownerRezSuccess) {
      try {
        // Build local update payload from incoming body (best-effort mapping)
        const localUpdate: any = {
          updatedAt: new Date(),
          lastSyncedWithOwnerRez: ownerRezId ? new Date() : undefined,
        };

        if (typeof body.name === 'string') localUpdate.name = body.name;
        if (typeof body.property_type === 'string') localUpdate.propertyType = body.property_type;
        if (typeof body.bedrooms === 'number') localUpdate.bedrooms = body.bedrooms;
        if (typeof body.bathrooms === 'number') localUpdate.bathrooms = body.bathrooms;
        if (typeof body.max_guests === 'number') localUpdate.maxGuests = body.max_guests;
        if (typeof body.editorValue === 'string') localUpdate.description = body.editorValue;
        if (typeof body.details === 'string') localUpdate.description = body.details;
        if (Array.isArray(body.services)) localUpdate.services = body.services;
        if (Array.isArray(body.features)) localUpdate.features = body.features;
        
        // Update check-in and check-out times
        if (typeof body.check_in === 'string') {
          localUpdate.availability = {
            ...localUpdate.availability,
            checkInTime: body.check_in
          };
        }
        if (typeof body.check_out === 'string') {
          localUpdate.availability = {
            ...localUpdate.availability,
            checkOutTime: body.check_out
          };
        }
        
        // Only update status if explicitly provided and user is superadmin
        if (authResult.user.role === 'superadmin' && body.status !== undefined) {
          console.log('Updating local status from body.status:', body.status);
          localUpdate.status = body.status;
        } else if (authResult.user.role === 'superadmin' && body.active !== undefined) {
          // Only allow active field to change status if superadmin explicitly sets it
          console.log('Updating local status from body.active:', body.active);
          localUpdate.status = body.active ? 'active' : 'disabled';
        } else {
          console.log('No status update - body.status:', body.status, 'body.active:', body.active, 'user role:', authResult.user.role);
        }
        // For regular updates, don't change the status at all

        if (body.address) {
          localUpdate.address = {
            street1: body.address.street1 || body.address.street || body.address.address1 || '',
            street2: body.address.street2 || body.address.address2 || '',
            city: body.address.city || '',
            state: body.address.state || body.address.province || '',
            country: body.address.country || 'USA',
            postalCode: body.address.postal_code || body.address.postalCode || '',
            latitude: body.address.latitude,
            longitude: body.address.longitude,
          };
        }

        // Update price per night
        if (typeof body.pricePerNight === 'number') {
          localUpdate.pricing = {
            ...localUpdate.pricing,
            pricePerNight: body.pricePerNight
          };
        }

        // Use the correct filter based on the ID type
        let filter;
        if (isNumericId) {
          filter = { ownerRezId: idAsNumber };
        } else {
          const { ObjectId } = await import('mongodb');
          filter = { _id: new ObjectId(id) };
        }

        const localUpdateResult = await db.collection('properties').updateOne(
          filter,
          { $set: localUpdate }
        );

        if (localUpdateResult.matchedCount === 0) {
          return NextResponse.json({ 
            success: false, 
            error: 'Property not found in local database' 
          }, { status: 404 });
        }

        const successMessage = ownerRezId 
          ? 'Property updated successfully in both OwnerRez and local database'
          : 'Property updated successfully in local database';

        return NextResponse.json({ 
          success: true, 
          message: successMessage,
          property: ownerRezResponse || null, 
          localUpdate: { success: true, modifiedCount: localUpdateResult.modifiedCount },
          ownerRezUpdated: !!ownerRezId
        });

      } catch (localErr) {
        console.error('Local DB update failed after OwnerRez update:', localErr);
        return NextResponse.json({ 
          success: false, 
          error: ownerRezId 
            ? 'Property updated in OwnerRez but failed to update local database: ' + (localErr instanceof Error ? localErr.message : 'Unknown error')
            : 'Failed to update local database: ' + (localErr instanceof Error ? localErr.message : 'Unknown error'),
          property: ownerRezResponse || null,
          localUpdate: { success: false, error: localErr instanceof Error ? localErr.message : 'Unknown error' }
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: 'OwnerRez update failed, local database not updated' 
    }, { status: 400 });

  } catch (error) {
    console.error('Property update error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update property', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 