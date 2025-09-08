import { NextResponse } from 'next/server';
import { ensureThumbnailUrls } from '@/utils/propertyCache';

interface Property {
  id: number;
  active: boolean;
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
  bathrooms: number;
  bathrooms_full: number;
  bathrooms_half: number;
  bedrooms: number;
  check_in: string;
  check_out: string;
  currency_code: string;
  key: string;
  latitude: number;
  longitude: number;
  max_guests: number;
  max_pets: number;
  name: string;
  property_type: string;
  thumbnail_url: string;
  thumbnail_url_large: string;
  thumbnail_url_medium: string;
}

interface OwnerRezPropertiesResponse {
  count: number;
  items: Property[];
  limit: number;
  offset: number;
  next_page_url?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '4');

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

    const apiUrl = new URL(`${baseUrl}/properties`);
    apiUrl.searchParams.append('include_tags', 'True');
    apiUrl.searchParams.append('include_fields', 'True');
    apiUrl.searchParams.append('include_listing_numbers', 'True');
    apiUrl.searchParams.append('limit', pageSize.toString());
    apiUrl.searchParams.append('offset', offset.toString());

    const res = await fetch(apiUrl.toString(), { headers });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `OwnerRez API error: ${res.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage += ` - ${errorJson.message || 'Unknown error'}`;
      } catch {
        errorMessage += ` - ${errorText || 'Unknown error'}`;
      }
      
      throw new Error(errorMessage);
    }

    const data: OwnerRezPropertiesResponse = await res.json();
    
    // Ensure all properties have thumbnail URLs by fetching from local API if needed
    console.log('Ensuring all properties have thumbnail URLs...');
    const propertiesWithThumbnails = await ensureThumbnailUrls(data.items);
    
    return NextResponse.json({
      total: data.count,
      page,
      pageSize,
      totalPages: Math.ceil(data.count / pageSize),
      properties: propertiesWithThumbnails
    });
  } catch (error) {
    console.error('Properties API error:', error);
    
    const errorMessage = error instanceof Error ? 
      error.message : 
      'Unknown error occurred';
      
    return NextResponse.json(
      { 
        error: 'Failed to fetch properties',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}