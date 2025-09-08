import { NextRequest, NextResponse } from 'next/server';

interface GuestAddress {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  type: string;
  is_default: boolean;
}

interface GuestEmail {
  address: string;
  type: string;
  is_default: boolean;
}

interface GuestPhone {
  number: string;
  type: string;
  is_default: boolean;
}

interface OwnerRezGuestRequest {
  first_name: string;
  last_name: string;
  addresses?: GuestAddress[];
  email_addresses?: GuestEmail[];
  phones?: GuestPhone[];
  notes?: string;
  opt_out_marketing_email?: boolean;
  opt_out_marketing_sms?: boolean;
  opt_out_transactional_sms?: boolean;
}

interface CreateGuestRequest {
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
}

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  addresses: GuestAddress[];
  email_addresses: GuestEmail[];
  phones: GuestPhone[];
  notes?: string;
  opt_out_marketing_email: boolean;
  opt_out_marketing_sms: boolean;
  opt_out_transactional_sms: boolean;
}

interface OwnerRezGuestsResponse {
  items: Guest[];
  limit: number;
  offset: number;
}

function parseFullName(fullName: string): { first_name: string; last_name: string } {
  const nameParts = fullName.trim().split(' ');
  
  if (nameParts.length === 1) {
    return {
      first_name: nameParts[0],
      last_name: ''
    };
  }
  
  const first_name = nameParts[0];
  const last_name = nameParts.slice(1).join(' ');
  
  return { first_name, last_name };
}

async function createGuestInOwnerRez(guestData: OwnerRezGuestRequest) {
  const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
  const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
  const v2Url = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";

  if (!username || !password || !v2Url) {
    throw new Error('API credentials not configured');
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  
  const response = await fetch(`${v2Url}/guests`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(guestData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OwnerRez API error: ${response.status} - ${error.message || 'Unknown error'}`);
  }

  return await response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone, notes }: CreateGuestRequest = await request.json();

    // Validate required fields
    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'Full name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Parse full name into first and last name
    const { first_name, last_name } = parseFullName(fullName);

    if (!first_name) {
      return NextResponse.json(
        { success: false, message: 'Valid full name is required' },
        { status: 400 }
      );
    }

    // Prepare guest data for OwnerRez API
    const guestData: OwnerRezGuestRequest = {
      first_name,
      last_name,
      email_addresses: [
        {
          address: email,
          type: 'home',
          is_default: true
        }
      ],
      phones: [
        {
          number: phone,
          type: 'mobile',
          is_default: true
        }
      ],
      opt_out_marketing_email: false,
      opt_out_marketing_sms: true,
      opt_out_transactional_sms: false
    };

    // Add notes if provided
    if (notes) {
      guestData.notes = notes;
    }

    // Create guest in OwnerRez
    const result = await createGuestInOwnerRez(guestData);

    return NextResponse.json({
      success: true,
      message: 'Guest created successfully',
      guest: result
    }, { status: 201 });

  } catch (error) {
    console.error('Create guest API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create guest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
    const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
    const v2Url = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";

    if (!username || !password || !v2Url) {
      throw new Error('API credentials not configured');
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Search for guests using the email
    const url = `${v2Url}/guests?q=${encodeURIComponent(email)}&limit=${limit}&offset=${offset}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OwnerRez API error: ${response.status} - ${error.message || 'Unknown error'}`);
    }

    const data: OwnerRezGuestsResponse = await response.json();

    // Fix: If items is not an array, return not found
    if (!Array.isArray(data.items)) {
      return NextResponse.json({
        success: true,
        guest: null,
        found: false,
        message: 'No guest found with the specified email address'
      });
    }

    // Filter for the exact email match
    const exactMatch = data.items.find(guest => 
      guest.email_addresses.some(emailAddr => 
        emailAddr.address.toLowerCase() === email.toLowerCase()
      )
    );

    if (exactMatch) {
      return NextResponse.json({
        success: true,
        guest: exactMatch,
        found: true
      });
    } else {
      return NextResponse.json({
        success: true,
        guest: null,
        found: false,
        message: 'No guest found with the specified email address'
      });
    }

  } catch (error) {
    console.error('Get guest API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch guest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}