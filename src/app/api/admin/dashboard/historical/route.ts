import { NextResponse, NextRequest } from 'next/server';
import { startOfMonth, endOfMonth, subMonths, addMonths, parseISO, differenceInDays, getDaysInMonth } from 'date-fns';
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
    if (!data || !Array.isArray(data.items)) {
      console.error('Invalid response format from OwnerRez (expected items array):', data);
      break;
    }
    bookings.push(...data.items);
    
    if (data.items.length < limit) break;
    offset += limit;
  }

  return bookings;
}

function processHistoricalData(bookings: Booking[]) {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => 
    startOfMonth(subMonths(now, 11 - i))
  );

  // Initialize data structures
  const revenueData = Array(12).fill(0);
  const bookedNightsPerMonth = Array(12).fill(0);
  const blockedNightsPerMonth = Array(12).fill(0);
  const bookingSources: Record<string, number> = {};
  const nightlyRateData: Array<{
    monthName: string;
    year: number;
    totalNights: number;
    ratePerNight: number;
  }> = [];

  // Process each booking
  bookings.forEach(booking => {
    const arrival = parseISO(booking.arrival);
    const departure = parseISO(booking.departure);
    
    // Separate booking and block processing
    if (booking.type === 'booking') {
      const source = booking.listing_site || 'Direct';
      bookingSources[source] = (bookingSources[source] || 0) + 1;

      const rent = booking.charges?.reduce((sum, charge) => 
        charge.type === 'rent' ? sum + charge.amount : sum, 0) || 0;
      const bookingNights = differenceInDays(departure, arrival);

      // Process monthly breakdown for bookings
      months.forEach((month, index) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        if (arrival > monthEnd || departure < monthStart) return;

        const startOverlap = arrival > monthStart ? arrival : monthStart;
        const endOverlap = departure < monthEnd ? departure : monthEnd;
        const overlapNights = differenceInDays(endOverlap, startOverlap);
        
        const nightlyRevenue = overlapNights * (rent / bookingNights);
        revenueData[index] += nightlyRevenue;
        bookedNightsPerMonth[index] += overlapNights;
      });
    } else {
      // Process blocks
      months.forEach((month, index) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        if (arrival > monthEnd || departure < monthStart) return;

        const startOverlap = arrival > monthStart ? arrival : monthStart;
        const endOverlap = departure < monthEnd ? departure : monthEnd;
        const overlapNights = differenceInDays(endOverlap, startOverlap);
        
        blockedNightsPerMonth[index] += overlapNights;
      });
    }
  });

  // Calculate occupancy data with blocks
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const occupancyData = months.map((month, index) => {
    const daysInMonth = getDaysInMonth(month) || 30;
    const totalPossibleNights = daysInMonth * TOTAL_PROPERTIES;
    const availableNights = totalPossibleNights - blockedNightsPerMonth[index];
    
    // Handle division by zero
    const occupancy = availableNights > 0 
      ? (bookedNightsPerMonth[index] / availableNights) * 100 
      : 0;
      
    return {
      month: monthNames[month.getMonth()],
      year: month.getFullYear(),
      value: parseFloat(occupancy.toFixed(2))
    };
  });

  // Calculate nightly rate data
  months.forEach((month, index) => {
    const monthName = monthNames[month.getMonth()];
    const year = month.getFullYear();
    const totalNights = bookedNightsPerMonth[index];
    const revenue = revenueData[index];
    const ratePerNight = totalNights ? revenue / totalNights : 0;

    nightlyRateData.push({
      monthName,
      year,
      totalNights,
      ratePerNight: parseFloat(ratePerNight.toFixed(2))
    });
  });

  // Convert revenue data to array of objects
  const revenueDataObjects = revenueData.map((amount, index) => ({
    amount: parseFloat(amount.toFixed(2)),
    month: months[index].getMonth() + 1,
    year: months[index].getFullYear()
  }));

  return {
    revenueData: revenueDataObjects,
    occupancyData,
    bookingSources: {
      total: Object.values(bookingSources).reduce((sum, count) => sum + count, 0),
      sources: Object.entries(bookingSources).map(([name, count]) => ({ name, count }))
    },
    nightlyRateData,
    rawBookings: bookings
  };
}

export async function GET(request: NextRequest) {
  try {
    // Auth and role
    const token = request.cookies.get('authToken')?.value || '';
    const result = token ? await authService.verifyToken(token) : { valid: false } as any;
    const role = result?.user?.role || 'user';
    const email = result?.user?.email || '';
    let propertyIds: number[] | undefined = undefined;
    
    if (role === 'admin' && email) {
      try {
        const client = await clientPromise;
        const db = client.db('premiere-stays');
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
    // Date range: 12 months back (including current month)
    const start = startOfMonth(subMonths(now, 11)).toISOString();
    const end = endOfMonth(addMonths(now, 4)).toISOString();
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
        previousRevenue: [],
        occupancyTrends: [],
        bookingSources: { total: 0, sources: [] },
        nightlyRates: [],
        bookings: []
      });
    }
    const data = processHistoricalData(bookings);
    const responseData = {
      role,
      previousRevenue: role === 'admin' ? data.revenueData : [],
      occupancyTrends: data.occupancyData,
      bookingSources: data.bookingSources,
      nightlyRates: role === 'admin' ? data.nightlyRateData : [],
      bookings: data.rawBookings
    };
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Historical data error:', error);
    return NextResponse.json(
      { error: 'Failed to process historical data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}