import { NextRequest, NextResponse } from 'next/server';
import { propertyService } from '@/lib/propertyService';
import { ensureThumbnailUrls } from '@/utils/propertyCache';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
  }

  try {
    // First, try to get property from OwnerRez
    const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
    const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
    const baseUrl = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";

    if (!username || !password || !baseUrl) {
      return NextResponse.json({ error: 'API credentials not configured' }, { status: 500 });
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const idAsNumber = Number(id);
    const shouldQueryOwnerRez = !Number.isNaN(idAsNumber) && Number.isFinite(idAsNumber);

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

    // Get local property data (by ownerRezId if numeric, otherwise by Mongo _id)
    const localProperty = shouldQueryOwnerRez
      ? await propertyService.getPropertyByOwnerRezId(idAsNumber)
      : await propertyService.getPropertyById(id);

    // Merge data (OwnerRez takes priority)
    let mergedProperty = null;
    let source = '';

    if (ownerRezProperty && localProperty) {
      // Both exist - merge them
      mergedProperty = {
        ...ownerRezProperty,
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
          createdAt: localProperty.createdAt,
          updatedAt: localProperty.updatedAt,
          lastSyncedWithOwnerRez: localProperty.lastSyncedWithOwnerRez
        }
      };
      source = 'ownerrez_merged_local';
    } else if (ownerRezProperty) {
      // Only OwnerRez exists
      mergedProperty = {
        ...ownerRezProperty,
        localData: null
      };
      source = 'ownerrez_only';
    } else if (localProperty) {
      // Only local exists
      mergedProperty = {
        ...localProperty,
        ownerRezData: null,
        ownerRezError
      };
      source = 'local_only';
    } else {
      // Neither exists
      return NextResponse.json({ 
        error: 'Property not found in either OwnerRez or local database',
        ownerRezError,
        source: 'not_found'
      }, { status: 404 });
    }

    // Ensure the property has thumbnail URLs by fetching from local API if needed
    if (!mergedProperty.thumbnail_url || !mergedProperty.thumbnail_url_medium || !mergedProperty.thumbnail_url_large) {
      console.log(`Property ${mergedProperty.id} missing thumbnail URLs, ensuring they are available...`);
      const [propertyWithThumbnails] = await ensureThumbnailUrls([mergedProperty]);
      mergedProperty = propertyWithThumbnails;
    }

    return NextResponse.json({ 
      success: true, 
      property: mergedProperty,
      source,
      ownerRezError: ownerRezError || null,
      localId: (localProperty as any)?._id ? String((localProperty as any)._id) : null
    });

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
    const body = await request.json();
    const idAsNumber = Number(id);
    const shouldUpdateOwnerRez = !Number.isNaN(idAsNumber) && Number.isFinite(idAsNumber);

    let ownerRezResponse: any = null;
    if (shouldUpdateOwnerRez) {
      const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
      const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
      const baseUrl = process.env.NEXT_PUBLIC_OWNERREZ_API_V1 || "https://api.ownerrez.com/v1";

      if (!username || !password) {
        return NextResponse.json({ error: 'API credentials not configured' }, { status: 500 });
      }

      const auth = Buffer.from(`${username}:${password}`).toString('base64');
      const headers = {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${baseUrl}/properties/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ error: data.message || 'Failed to update property', details: data }, { status: res.status });
      }
      ownerRezResponse = data;
    }

    // Update local MongoDB record by ownerRezId (if numeric) else by _id
    try {
      const client = await (await import('@/lib/mongodb')).default;
      const db = client.db('premiere-stays');

      // Build local update payload from incoming body (best-effort mapping)
      const localUpdate: any = {
        updatedAt: new Date(),
        lastSyncedWithOwnerRez: new Date(),
      };

      if (typeof body.name === 'string') localUpdate.name = body.name;
      if (typeof body.property_type === 'string') localUpdate.propertyType = body.property_type;
      if (typeof body.bedrooms === 'number') localUpdate.bedrooms = body.bedrooms;
      if (typeof body.bathrooms === 'number') localUpdate.bathrooms = body.bathrooms;
      if (typeof body.max_guests === 'number') localUpdate.maxGuests = body.max_guests;
      if (typeof body.editorValue === 'string') localUpdate.description = body.editorValue;
      if (typeof body.details === 'string') localUpdate.description = body.details;

      if (body.address) {
        localUpdate.address = {
          street1: body.address.street1 || body.address.street || body.address.address1 || '',
          street2: body.address.street2 || body.address.address2 || '',
          city: body.address.city || '',
          state: body.address.state || body.address.province || '',
          country: body.address.country || 'USA',
          postalCode: body.address.postal_code || body.address.postalCode || '',
        };
      }

      const filter = shouldUpdateOwnerRez ? { ownerRezId: idAsNumber } : { _id: (await import('mongodb')).ObjectId.createFromHexString(id) };

      await db.collection('properties').updateOne(
        filter,
        { $set: localUpdate }
      );
    } catch (localErr) {
      console.error('Local DB update failed after property update:', localErr);
      return NextResponse.json({ success: true, property: ownerRezResponse || null, localUpdate: { success: false, error: localErr instanceof Error ? localErr.message : 'Unknown error' } });
    }

    return NextResponse.json({ success: true, property: ownerRezResponse || null, localUpdate: { success: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update property', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 