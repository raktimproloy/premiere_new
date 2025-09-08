import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
    const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
    const v2Url = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";

    if (!username || !password || !v2Url) {
      throw new Error('API credentials not configured');
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const body = await request.json();
    
    // Validate required fields based on OwnerRez API v2 documentation
    const requiredFields = ['arrival', 'departure', 'property_id', 'is_block', 'guest_id'];
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json({ success: false, message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Prepare the booking payload according to OwnerRez API v2 specification
    const bookingPayload = {
      arrival: body.arrival, // Required: yyyy-MM-dd format
      departure: body.departure, // Required: yyyy-MM-dd format
      property_id: body.property_id, // Required: integer
      guest_id: body.guest_id, // Required: integer (contact ID)
      is_block: body.is_block, // Required: boolean
      // Optional fields with defaults
      check_in: body.check_in || "15:00", // Default check-in time 3:00 PM
      check_out: body.check_out || "11:00", // Default check-out time 11:00 AM
      title: body.title || `Booking for ${body.arrival} to ${body.departure}`,
      notes: body.notes || "",
      cleaning_date: body.cleaning_date || null
    };

    const response = await fetch(`${v2Url}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingPayload),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        message: data.message || 'Failed to create booking', 
        details: data 
      }, { status: response.status });
    }
    
    return NextResponse.json({ success: true, booking: data });
  } catch (error) {
    console.error('Create booking API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create booking', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}