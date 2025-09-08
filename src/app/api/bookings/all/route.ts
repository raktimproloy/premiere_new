import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
const v2Url = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  email_addresses: {
    address: string;
    is_default: boolean;
    type: string;
  }[];
  phones: {
    number: string;
    is_default: boolean;
    type: string;
  }[];
}

interface Booking {
  id: number;
  arrival: string;
  departure: string;
  property_id: number;
  guest_id: number;
  status: string;
  is_block: boolean;
  created_utc: string;
  updated_utc: string;
  total_amount?: number;
  property: {
    id: number;
    name: string;
  };
  [key: string]: any;
}

interface TransformedBooking {
  id: string;
  personName: string;
  email: string;
  phone: string;
  propertyName: string;
  status: string;
  applyDate: string;
  price: string;
  arrival: string;
  departure: string;
  created_utc: string;
  updated_utc: string;
  guest_id: number;
  property_id: number;
  guest?: Guest;
}

async function fetchAllBookings(limit: number = 50, offset: number = 0, sinceDate?: string, propertyIds?: number[]) {
  if (!username || !password || !v2Url) {
    throw new Error('API credentials not configured');
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const sinceParam = sinceDate ? `&since_utc=${sinceDate}` : '';
  const propertyParam = Array.isArray(propertyIds) && propertyIds.length > 0
    ? `&property_ids=${propertyIds.join(',')}`
    : '';
  const url = `${v2Url}/bookings?limit=${limit}&offset=${offset}${sinceParam}${propertyParam}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('Bookings API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    let errorMessage: string;
    
    try {
      if (contentType.includes('application/json')) {
        const error = await response.json();
        errorMessage = error.message || 'Unknown error';
      } else {
        const errorText = await response.text();
        errorMessage = `Non-JSON response: ${errorText.substring(0, 200)}...`;
      }
    } catch (parseError) {
      errorMessage = `Failed to parse error response: ${response.statusText}`;
    }
    
    throw new Error(`OwnerRez API error: ${response.status} - ${errorMessage}`);
  }

  const data: any = await response.json();
  if (process.env.NODE_ENV !== 'production') {
    console.log('Bookings data received meta:', {
      hasItems: Array.isArray((data as any)?.items),
      itemsCount: Array.isArray((data as any)?.items) ? (data as any).items.length : 0,
    });
  }
  return data;
}

// Small per-guest cache to avoid re-fetching the same guest repeatedly
const GUEST_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const guestCache = new Map<number, { timestamp: number; guest: Guest }>();

async function fetchGuestById(guestId: number): Promise<Guest | null> {
  if (!username || !password || !v2Url) {
    throw new Error('API credentials not configured');
  }

  const cached = guestCache.get(guestId);
  if (cached && Date.now() - cached.timestamp < GUEST_CACHE_TTL_MS) {
    return cached.guest;
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const url = `${v2Url}/guests/${guestId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // If guest not found or other error, return null instead of throwing to avoid breaking bookings listing
    return null;
  }

  const data: Guest = await response.json();
  guestCache.set(guestId, { timestamp: Date.now(), guest: data });
  return data;
}

// Simple in-memory cache to prevent repeated upstream calls for identical queries
const CACHE_TTL_MS = 30 * 1000; // 30 seconds
const bookingsCache = new Map<string, { timestamp: number; payload: any }>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sinceDate = searchParams.get('since') || '2024-01-01T00:00:00Z';
    // Authenticate to determine role and filter
    const token = request.cookies.get('authToken')?.value || '';
    const authResult = token ? await authService.verifyToken(token) : { valid: false } as any;
    const role: string = authResult?.user?.role || 'user';
    const email: string = authResult?.user?.email || '';

    let propertyIds: number[] | undefined = undefined;
    if (role === 'admin' && email) {
      try {
        const client = await clientPromise;
        const db = client.db('premiere-stays');
        const cursor = db.collection('properties').find({ 'owner.email': email }, { projection: { ownerRezId: 1 } });
        const props = await cursor.toArray();
        const ids = props
          .map((p: any) => Number(p.ownerRezId))
          .filter((n: number) => Number.isFinite(n));
        if (ids.length > 0) propertyIds = ids;
      } catch (e) {
        console.error('Failed to load admin property IDs:', e);
      }
    }

    // guestSince is no longer used since we fetch guests by ID only
    const pidKey = propertyIds && propertyIds.length > 0 ? `&pids=${propertyIds.join(',')}` : '';
    const cacheKey = `limit=${limit}&offset=${offset}&since=${sinceDate}${pidKey}`;
    const cached = bookingsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.payload, { headers: { 'X-Cache': 'HIT' } });
    }

    // Fetch bookings first (filtered for admins)
    const bookingsData = await fetchAllBookings(limit, offset, sinceDate, propertyIds);

    if (process.env.NODE_ENV !== 'production') {
      console.log("bookings-meta", { items: Array.isArray(bookingsData?.items) ? bookingsData.items.length : 0, role, filtered: Array.isArray(propertyIds) && propertyIds.length > 0 });
    }

    // Collect unique guest IDs from this page and fetch details for each (with small cache)
    const uniqueGuestIds = Array.from(new Set((bookingsData.items || []).map((b: Booking) => b.guest_id).filter(Boolean)));
    const guestResults = await Promise.all(uniqueGuestIds.map(id => fetchGuestById(id as number)));
    const guestsMap = new Map<number, Guest>();
    guestResults.forEach((g, idx) => {
      const id = uniqueGuestIds[idx];
      if (g) guestsMap.set(id as number, g);
    });

    // Transform bookings with guest information
    const transformedBookings: TransformedBooking[] = (bookingsData.items || []).map((booking: Booking) => {
      const guest = guestsMap.get(booking.guest_id);
      
      // Extract primary email and phone
      const primaryEmail = guest?.email_addresses?.find(e => e.is_default)?.address || 
                          guest?.email_addresses?.[0]?.address || 'N/A';
      const primaryPhone = guest?.phones?.find(p => p.is_default)?.number || 
                          guest?.phones?.[0]?.number || 'N/A';
      
      return {
        id: booking.id.toString(),
        personName: guest ? `${guest.first_name} ${guest.last_name}` : 'N/A',
        email: primaryEmail,
        phone: primaryPhone,
        propertyName: booking.property?.name || 'N/A',
        status: booking.status || 'Pending',
        applyDate: booking.created_utc ? booking.created_utc.split('T')[0] : '',
        price: booking.total_amount ? `$${booking.total_amount}` : 'N/A',
        arrival: booking.arrival,
        departure: booking.departure,
        created_utc: booking.created_utc,
        updated_utc: booking.updated_utc,
        guest_id: booking.guest_id,
        property_id: booking.property_id,
        guest: guest
      };
    });

    const payload = {
      bookings: transformedBookings,
      pagination: {
        total: bookingsData.total || 0,
        limit: bookingsData.limit,
        offset: bookingsData.offset,
        hasMore: !!bookingsData.next_page_url
      }
    };

    bookingsCache.set(cacheKey, { timestamp: Date.now(), payload });
    return NextResponse.json(payload, { headers: { 'X-Cache': 'MISS' } });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}