import { NextResponse } from 'next/server';
import { getCachedProperties, setCachedProperties } from '@/utils/propertyCache';

interface Property {
  id: number;
  address: {
    city: string;
    country: string;
    id: number;
    is_default: boolean;
    postal_code: string;
    state: string;
    street1: string;
    street2: string;
  };
  [key: string]: any;
}

interface LocationData {
  city: string;
  country: string;
  propertyIds: number[];
}

async function fetchAllProperties(): Promise<Property[]> {
  const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
  const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
  const baseUrl = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";

  if (!username || !password) {
    throw new Error('API credentials not configured');
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const headers = { 
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  };

  const allProperties: Property[] = [];
  let offset = 0;
  const limit = 1000;

  console.log('Starting to fetch properties from OwnerRez API for locations...');

  while (true) {
    const apiUrl = new URL(`${baseUrl}/properties`);
    apiUrl.searchParams.append('include_tags', 'True');
    apiUrl.searchParams.append('include_fields', 'True');
    apiUrl.searchParams.append('include_listing_numbers', 'True');
    apiUrl.searchParams.append('limit', limit.toString());
    apiUrl.searchParams.append('offset', offset.toString());

    console.log(`Fetching properties with offset: ${offset}, limit: ${limit}`);

    const res = await fetch(apiUrl.toString(), { headers });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`OwnerRez API error: ${res.status} - ${error.message || 'Unknown error'}`);
    }

    const data = await res.json();
    allProperties.push(...data.items);
    
    console.log(`Fetched ${data.items.length} properties. Total so far: ${allProperties.length}`);
    
    if (data.items.length < limit) break;
    offset += limit;
  }

  console.log(`Total properties fetched for locations: ${allProperties.length}`);
  return allProperties;
}

export async function GET() {
  try {
    console.log('Locations API called. Environment:', process.env.NODE_ENV);
    console.log('Vercel environment:', process.env.VERCEL);

    // Get properties from cache
    let allProperties = getCachedProperties();
    
    console.log(`Retrieved ${allProperties?.length || 0} properties from cache`);
    
    if (!allProperties || allProperties.length === 0) {
      console.log('No cached properties available, fetching from API...');
      try {
        // Fetch properties from API and cache them
        allProperties = await fetchAllProperties();
        
        // Cache the properties
        const cacheSuccess = setCachedProperties(allProperties);
        console.log(`Properties cached: ${cacheSuccess ? 'success' : 'failed'}`);
        
        if (!allProperties || allProperties.length === 0) {
          return NextResponse.json({
            success: true,
            message: 'No properties found from API',
            totalLocations: 0,
            locations: [],
            environment: process.env.NODE_ENV,
            isVercel: process.env.VERCEL === '1'
          });
        }
      } catch (error) {
        console.error('Error fetching properties for locations:', error);
        return NextResponse.json({
          success: false,
          message: 'Failed to fetch properties from API',
          error: error instanceof Error ? error.message : 'Unknown error',
          totalLocations: 0,
          locations: [],
          environment: process.env.NODE_ENV,
          isVercel: process.env.VERCEL === '1'
        }, { status: 500 });
      }
    }

    const locationMap = new Map<string, LocationData>();

    console.log('Processing properties to extract locations...');

    allProperties.forEach((property: Property) => {
      const city = property.address?.city?.trim() || '';
      const country = property.address?.country?.trim() || '';
      
      if (!city || !country) {
        console.log(`Skipping property ${property.id} - missing city or country: city="${city}", country="${country}"`);
        return;
      }

      const locationKey = `${city}-${country}`;
      
      if (locationMap.has(locationKey)) {
        const existing = locationMap.get(locationKey)!;
        if (!existing.propertyIds.includes(property.id)) {
          existing.propertyIds.push(property.id);
        }
      } else {
        locationMap.set(locationKey, {
          city,
          country,
          propertyIds: [property.id]
        });
      }
    });

    const uniqueLocations = Array.from(locationMap.values()).sort((a, b) => 
      a.city.localeCompare(b.city)
    );

    console.log(`Found ${uniqueLocations.length} unique locations`);

    return NextResponse.json({
      success: true,
      message: 'Locations retrieved successfully',
      totalLocations: uniqueLocations.length,
      locations: uniqueLocations,
      source: allProperties ? 'cache' : 'api',
      environment: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1'
    });

  } catch (error) {
    console.error('Locations API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch locations', 
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
        isVercel: process.env.VERCEL === '1'
      },
      { status: 500 }
    );
  }
} 