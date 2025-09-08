import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
const v2Url = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";

interface OwnerRezBooking {
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

async function fetchAllBookingsFromOwnerRez(): Promise<OwnerRezBooking[]> {
  if (!username || !password || !v2Url) {
    throw new Error('API credentials not configured');
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const allBookings: OwnerRezBooking[] = [];
  let offset = 0;
  const limit = 1000;
  const sinceDate = '2024-01-01T00:00:00Z'; // Use a fixed date like the working route

  console.log('Fetching bookings from OwnerRez API...');

  while (true) {
    const sinceParam = sinceDate ? `&since_utc=${sinceDate}` : '';
    const url = `${v2Url}/bookings?limit=${limit}&offset=${offset}${sinceParam}`;
    
    console.log('Fetching URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

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

    const data = await response.json();
    console.log(`Fetched ${data.items?.length || 0} bookings from OwnerRez (offset: ${offset})`);
    
    if (data.items && data.items.length > 0) {
      allBookings.push(...data.items);
    }

    // Check if there are more pages
    if (!data.items || data.items.length < limit || !data.next_page_url) {
      break;
    }
    offset += limit;
  }

  console.log(`Total bookings fetched from OwnerRez: ${allBookings.length}`);
  return allBookings;
}

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const authToken = request.cookies.get('authToken')?.value;
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    // Verify the token and get user data
    const result = await authService.verifyToken(authToken);
    if (!result.valid || !result.user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const user = result.user;
    console.log(`Fetching bookings for user: ${user.email} (guestId: ${user.guestId})`);

    // Check if user has a guestId
    if (!user.guestId) {
      return NextResponse.json({ success: false, message: 'No guest ID found for this user' }, { status: 404 });
    }

    // Fetch all bookings from OwnerRez API
    const allBookings = await fetchAllBookingsFromOwnerRez();

    // Filter bookings by guest_id
    const userBookings = allBookings.filter(booking => booking.guest_id === user.guestId);
    console.log(`Found ${userBookings.length} bookings for guest ID: ${user.guestId}`);

    // Format the bookings data for display
    const formattedBookings = userBookings.map(booking => ({
      id: booking.id.toString(),
      propertyName: booking.property?.name || 'N/A',
      checkIn: booking.arrival ? new Date(booking.arrival).toLocaleDateString() : 'N/A',
      checkOut: booking.departure ? new Date(booking.departure).toLocaleDateString() : 'N/A',
      totalAmount: booking.total_amount || 0,
      status: booking.status || 'N/A',
      bookingDate: booking.created_utc ? new Date(booking.created_utc).toLocaleDateString() : 'N/A',
      guests: 1, // Default value since OwnerRez doesn't provide this directly
      nights: booking.arrival && booking.departure 
        ? Math.ceil((new Date(booking.departure).getTime() - new Date(booking.arrival).getTime()) / (1000 * 60 * 60 * 24))
        : 1
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      totalBookings: formattedBookings.length
    });

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
} 