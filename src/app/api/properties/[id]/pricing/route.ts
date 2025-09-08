import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    // Validate date format
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }
    
    if (startDate >= endDate) {
      return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
    }

    // Fetch pricing from OwnerRez v1 API
    const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
    const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
    const pricingBaseUrl = process.env.NEXT_PUBLIC_OWNERREZ_API_V1 || "https://api.ownerrez.com/v1";
    
    if (!username || !password) {
      return NextResponse.json({ error: 'API credentials not configured' }, { status: 500 });
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const pricingUrl = `${pricingBaseUrl}/listings/${id}/pricing?includePricingRules=true&start=${start}&end=${end}`;
    
    const pricingRes = await fetch(pricingUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!pricingRes.ok) {
      const errorText = await pricingRes.text();
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ 
          error: errorJson.message || `Failed to fetch pricing: ${pricingRes.status}` 
        }, { status: pricingRes.status });
      } catch {
        return NextResponse.json({ 
          error: `Failed to fetch pricing: ${pricingRes.status} - ${errorText || 'Unknown error'}` 
        }, { status: pricingRes.status });
      }
    }

    const pricingData = await pricingRes.json();
    
    // Calculate total amount and provide summary
    let totalAmount = 0;
    let totalNights = 0;
    let availableNights = 0;
    let blockedNights = 0;

    if (Array.isArray(pricingData)) {
      pricingData.forEach((day: any) => {
        if (!day.isStayDisallowed) {
          totalAmount += day.amount || 0;
          availableNights++;
        } else {
          blockedNights++;
        }
        totalNights++;
      });
    }

    const pricing = {
      pricing: pricingData,
      summary: {
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        totalNights,
        availableNights,
        blockedNights,
        averagePricePerNight: availableNights > 0 ? parseFloat((totalAmount / availableNights).toFixed(2)) : 0,
        startDate: start,
        endDate: end
      }
    };

    return NextResponse.json({ 
      success: true, 
      pricing: pricing
    });

  } catch (error) {
    console.error('Pricing fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch pricing', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
