import { NextResponse } from 'next/server';
import { startOfMonth, endOfMonth, addMonths, parseISO, differenceInDays, getDaysInMonth } from 'date-fns';

const TOTAL_PROPERTIES = 10; // Should come from environment/config

interface Booking {
  id: number;
  arrival: string;
  departure: string;
  charges?: { amount: number; type: string }[];
  listing_site?: string;
  total_amount?: number;
  total_owed?: number;
  [key: string]: any;
}

async function fetchBookings(start: string, end: string): Promise<Booking[]> {
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
    const url = `${v2Url}/bookings?since_utc=${start}&include_charges=true&from=${start}&to=${end}&limit=${limit}&offset=${offset}`;
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

export async function GET() {
  try {
    // Dummy role assignment (in real app, use auth token)
    const role = Math.random() > 0.5 ? 'admin' : 'owner';
    const now = new Date();
    
    // Date ranges for current + next 3 months
    const start = startOfMonth(now).toISOString();
    const end = endOfMonth(addMonths(now, 3)).toISOString();

    const bookings = await fetchBookings(start, end);
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
