import { NextResponse, NextRequest } from 'next/server';
import { startOfMonth, endOfMonth, addMonths, parseISO, differenceInDays, getDaysInMonth } from 'date-fns';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

const TOTAL_PROPERTIES = 10; // Should come from environment/config

interface Booking {
  id: number;
  arrival: string;
  departure: string;
  charges?: { amount: number; type: string }[];
  listing_site?: string;
  total_amount?: number;
  total_owed?: number;
  type: string; // Added type property
  property_id?: number;
  property?: { id: number; name?: string };
  [key: string]: any;
}

async function fetchBookings(start: string, end: string, propertyIds?: number[]): Promise<Booking[]> {
  const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
  const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
  const v2Url = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";

  if (!username || !password || !v2Url) {
    throw new Error('API credentials not configured');
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const bookings: Booking[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const base = new URL(`${v2Url}/bookings`);
    base.searchParams.append('since_utc', start);
    base.searchParams.append('include_charges', 'true');
    base.searchParams.append('from', start);
    base.searchParams.append('to', end);
    base.searchParams.append('limit', String(limit));
    base.searchParams.append('offset', String(offset));
    if (propertyIds && propertyIds.length) {
      base.searchParams.append('property_ids', propertyIds.join(','));
    }
    const url = base.toString();
    const res = await fetch(url, {
      headers: { 
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`OwnerRez API error: ${res.status} - ${error.message || 'Unknown error'}`);
    }

    const data = await res.json();
    
    // Check if data.items exists and is an array
    if (!data.items || !Array.isArray(data.items)) {
      console.error('Invalid response format:', data);
      break;
    }
    
    bookings.push(...data.items);
    
    if (data.items.length < limit) break;
    offset += limit;
  }

  return bookings;
}

function calculateMonthlyData(bookings: Booking[], month: Date) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  let bookingsCount = 0;
  let revenue = 0;
  let nights = 0;

  bookings.forEach(booking => {
    const arrival = parseISO(booking.arrival);
    const departure = parseISO(booking.departure);
    
    if (arrival > monthEnd || departure < monthStart) return;

    bookingsCount++;
    
    const bookingNights = differenceInDays(departure, arrival);
    const rent = booking.charges?.reduce((sum, charge) => 
      charge.type === 'rent' ? sum + charge.amount : sum, 0) || 0;
    
    const startOverlap = arrival > monthStart ? arrival : monthStart;
    const endOverlap = departure < monthEnd ? departure : monthEnd;
    const overlapNights = differenceInDays(endOverlap, startOverlap);
    
    if (bookingNights > 0) {
      nights += overlapNights;
      revenue += (overlapNights / bookingNights) * rent;
    }
  });

  const daysInMonth = getDaysInMonth(month) || 30;
  const occupancy = (nights / (TOTAL_PROPERTIES * daysInMonth)) * 100;

  return { bookingsCount, revenue, occupancy, nights };
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate and determine role
    const token = request.cookies.get('authToken')?.value || '';
    const result = token ? await authService.verifyToken(token) : { valid: false } as any;
    const role = result?.user?.role || 'user';
    const email = result?.user?.email || '';
    let propertyIds: number[] | undefined = undefined;

    if (role === 'admin' && email) {
      try {
        const client = await clientPromise;
        const db = client.db('premiere-stays');
        // Find properties owned by this admin and extract OwnerRez IDs
        const cursor = db.collection('properties').find({ 'owner.email': email }, { projection: { ownerRezId: 1 } });
        const props = await cursor.toArray();
        const ids = props
          .map((p: any) => Number(p.ownerRezId))
          .filter((id: number) => Number.isFinite(id));
        if (ids.length) propertyIds = Array.from(new Set(ids));
      } catch (e) {
        console.error('Failed to read properties for admin:', e);
      }
    }
    const now = new Date();
    
    // Date ranges for current + next 3 months
    const start = startOfMonth(now).toISOString();
    const end = endOfMonth(addMonths(now, 3)).toISOString();

    let bookings = await fetchBookings(start, end, propertyIds);
    
    // Extra guard: post-filter by propertyIds if present
    if (Array.isArray(propertyIds) && propertyIds.length > 0) {
      const idSet = new Set(propertyIds);
      bookings = bookings.filter(b => {
        const pid = typeof b.property_id === 'number' ? b.property_id : (typeof b.property?.id === 'number' ? b.property.id : undefined);
        return typeof pid === 'number' ? idSet.has(pid) : false;
      });
    } else if (role === 'admin' && (!propertyIds || propertyIds.length === 0)) {
      // If admin has no properties, return empty data
      return NextResponse.json({
        role,
        totalBookings: 0,
        totalRevenue: 0,
        occupancyRate: 0
      });
    }
    
    const currentMonthData = calculateMonthlyData(bookings, now);

    // Filter bookings for response
    // const filteredBookings = bookings.map(booking => {
    //   const { charges, total_amount, total_owed, ...safeFields } = booking;
    //   return role === 'admin' ? booking : safeFields;
    // });

    return NextResponse.json({
      role,
      totalBookings: currentMonthData.bookingsCount,
      totalRevenue: role === 'admin' ? currentMonthData.revenue : 0,
      occupancyRate: currentMonthData.occupancy,
      // bookings: filteredBookings
    });
  } catch (error) {
    console.error('Current month error:', error);
    return NextResponse.json(
      { error: 'Failed to process data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
