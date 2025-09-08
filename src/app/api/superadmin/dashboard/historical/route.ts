import { NextResponse } from 'next/server';
import { startOfMonth, endOfMonth, subMonths, addMonths, parseISO, differenceInDays, getDaysInMonth } from 'date-fns';
import { promises as fs } from 'fs';
import path from 'path';

const TOTAL_PROPERTIES = 10; // Should come from environment/config

interface Booking {
  id: number;
  arrival: string;
  departure: string;
  charges?: { amount: number; type: string }[];
  listing_site?: string;
  total_amount?: number;
  total_owed?: number;
  type: string;
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
    const base = new URL(`${v2Url}/bookings`);
    base.searchParams.append('since_utc', start);
    base.searchParams.append('include_charges', 'true');
    base.searchParams.append('from', start);
    base.searchParams.append('to', end);
    base.searchParams.append('limit', String(limit));
    base.searchParams.append('offset', String(offset));
    const res = await fetch(base.toString(), {
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
    bookings.push(...data.items);
    if (data.items.length < limit) break;
    offset += limit;
  }

  return bookings;
}

function processHistoricalData(bookings: Booking[]) {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => startOfMonth(subMonths(now, 11 - i)));
  const revenueData = Array(12).fill(0);
  const bookedNightsPerMonth = Array(12).fill(0);
  const blockedNightsPerMonth = Array(12).fill(0);
  const bookingSources: Record<string, number> = {};
  const nightlyRateData: Array<{ monthName: string; year: number; totalNights: number; ratePerNight: number; }> = [];

  bookings.forEach(booking => {
    const arrival = parseISO(booking.arrival);
    const departure = parseISO(booking.departure);
    if (booking.type === 'booking') {
      const source = booking.listing_site || 'Direct';
      bookingSources[source] = (bookingSources[source] || 0) + 1;
      const rent = booking.charges?.reduce((sum, charge) => charge.type === 'rent' ? sum + charge.amount : sum, 0) || 0;
      const bookingNights = differenceInDays(departure, arrival);
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

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const occupancyData = months.map((month, index) => {
    const daysInMonth = getDaysInMonth(month) || 30;
    const totalPossibleNights = daysInMonth * TOTAL_PROPERTIES;
    const availableNights = totalPossibleNights - blockedNightsPerMonth[index];
    const occupancy = availableNights > 0 ? (bookedNightsPerMonth[index] / availableNights) * 100 : 0;
    return {
      month: monthNames[month.getMonth()],
      year: month.getFullYear(),
      value: parseFloat(occupancy.toFixed(2))
    };
  });

  months.forEach((month, index) => {
    const monthName = monthNames[month.getMonth()];
    const year = month.getFullYear();
    const totalNights = bookedNightsPerMonth[index];
    const revenue = revenueData[index];
    const ratePerNight = totalNights ? revenue / totalNights : 0;
    nightlyRateData.push({ monthName, year, totalNights, ratePerNight: parseFloat(ratePerNight.toFixed(2)) });
  });

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

export async function GET() {
  const CACHE_DIR = path.join(process.cwd(), 'src', 'app', 'api', 'bookings', 'historical');
  const CACHE_FILE = path.join(CACHE_DIR, 'historicalCache.json');
  const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours
  try {
    // Try cache first
    try {
      const cacheContent = await fs.readFile(CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(cacheContent);
      if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_DURATION_MS) {
        return NextResponse.json(parsed.data);
      }
    } catch {}

    const role = 'superadmin';
    const now = new Date();
    const start = startOfMonth(subMonths(now, 11)).toISOString();
    const end = endOfMonth(addMonths(now, 4)).toISOString();
    const bookings = await fetchBookings(start, end);
    const data = processHistoricalData(bookings);
    const responseData = {
      role,
      previousRevenue: data.revenueData,
      occupancyTrends: data.occupancyData,
      bookingSources: data.bookingSources,
      nightlyRates: data.nightlyRateData,
      bookings: data.rawBookings
    };
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      await fs.writeFile(
        CACHE_FILE,
        JSON.stringify({ timestamp: Date.now(), data: responseData }, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('Failed to write cache:', err);
    }
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Superadmin historical data error:', error);
    return NextResponse.json(
      { error: 'Failed to process historical data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


