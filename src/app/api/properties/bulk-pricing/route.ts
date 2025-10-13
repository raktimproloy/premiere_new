import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface BulkPricingRequest {
  properties: Array<{
    id: string | number;
    start: string;
    end: string;
  }>;
}

interface PropertyPricingResult {
  propertyId: string | number;
  success: boolean;
  pricing?: any;
  summary?: {
    totalAmount: number;
    totalNights: number;
    availableNights: number;
    blockedNights: number;
    averagePricePerNight: number;
    startDate: string;
    endDate: string;
  };
  error?: string;
}

interface BulkPricingResponse {
  success: boolean;
  message: string;
  results: PropertyPricingResult[];
  summary: {
    totalProperties: number;
    successfulProperties: number;
    failedProperties: number;
    grandTotalAmount: number;
    totalAvailableNights: number;
    totalBlockedNights: number;
    averagePricePerNight: number;
    dateRange: {
      earliestStart: string;
      latestEnd: string;
    };
  };
}

async function fetchPropertyPricing(
  propertyId: string | number,
  start: string,
  end: string
): Promise<PropertyPricingResult> {
  try {
    // Validate date format
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        propertyId,
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      };
    }
    
    if (startDate >= endDate) {
      return {
        propertyId,
        success: false,
        error: 'Start date must be before end date'
      };
    }

    // Helper: build local DB pricing summary if available
    const buildLocalPricing = async () => {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      const localProperty = await db.collection("properties").findOne({
        ownerRezId: parseInt(propertyId.toString())
      });

      if (localProperty && localProperty.pricing?.pricePerNight && localProperty.pricing.pricePerNight > 0) {
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalAmount = localProperty.pricing.pricePerNight * daysDiff;

        const dailyPricing: any[] = [];
        for (let i = 0; i < daysDiff; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() + i);
          dailyPricing.push({
            date: currentDate.toISOString().split('T')[0],
            amount: localProperty.pricing.pricePerNight,
            isStayDisallowed: false
          });
        }

        const summary = {
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          totalNights: daysDiff,
          availableNights: daysDiff,
          blockedNights: 0,
          averagePricePerNight: localProperty.pricing.pricePerNight,
          startDate: start,
          endDate: end
        };

        return {
          propertyId,
          success: true,
          pricing: {
            pricing: dailyPricing,
            summary,
            source: 'local_database'
          },
          summary
        } as PropertyPricingResult;
      }
      return null;
    };

    // First, try OwnerRez API pricing
    const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
    const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
    const pricingBaseUrl = process.env.NEXT_PUBLIC_OWNERREZ_API_V1 || "https://api.ownerrez.com/v1";
    
    if (!username || !password) {
      return {
        propertyId,
        success: false,
        error: 'API credentials not configured'
      };
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const pricingUrl = `${pricingBaseUrl}/listings/${propertyId}/pricing?includePricingRules=true&start=${start}&end=${end}`;
    
    const pricingRes = await fetch(pricingUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    const ownerRezOk = pricingRes.ok;
    let pricingData: any = [];
    if (ownerRezOk) {
      pricingData = await pricingRes.json();
    }
    
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

    if (ownerRezOk && totalAmount > 0) {
      const summary = {
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        totalNights,
        availableNights,
        blockedNights,
        averagePricePerNight: availableNights > 0 ? parseFloat((totalAmount / availableNights).toFixed(2)) : 0,
        startDate: start,
        endDate: end
      };

      return {
        propertyId,
        success: true,
        pricing: {
          pricing: pricingData,
          summary,
          source: 'ownerrez'
        },
        summary
      };
    }

    // OwnerRez returned 0 totals or failed; try local DB fallback
    const localResult = await buildLocalPricing();
    if (localResult) {
      return localResult;
    }

    // If no local fallback, return success with zeroed pricing if OwnerRez was ok; otherwise error
    if (ownerRezOk) {
      const summary = {
        totalAmount: 0,
        totalNights,
        availableNights,
        blockedNights,
        averagePricePerNight: 0,
        startDate: start,
        endDate: end
      };
      return {
        propertyId,
        success: true,
        pricing: {
          pricing: pricingData,
          summary,
          source: 'ownerrez'
        },
        summary
      };
    }

    // Neither OwnerRez nor local pricing available
    return {
      propertyId,
      success: false,
      error: 'Pricing unavailable from OwnerRez and no local fallback found'
    };

  } catch (error) {
    console.error(`Pricing fetch error for property ${propertyId}:`, error);
    return {
      propertyId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkPricingRequest = await request.json();
    
    if (!body.properties || !Array.isArray(body.properties) || body.properties.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Properties array is required and must not be empty'
      }, { status: 400 });
    }

    if (body.properties.length > 50) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 50 properties allowed per request'
      }, { status: 400 });
    }

    console.log(`Bulk pricing request for ${body.properties.length} properties`);

    // Fetch pricing for all properties concurrently
    const pricingPromises = body.properties.map(prop => 
      fetchPropertyPricing(prop.id, prop.start, prop.end)
    );

    const results = await Promise.all(pricingPromises);

    // Calculate summary statistics
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    let grandTotalAmount = 0;
    let totalAvailableNights = 0;
    let totalBlockedNights = 0;
    const allStartDates: string[] = [];
    const allEndDates: string[] = [];

    successfulResults.forEach(result => {
      if (result.summary) {
        grandTotalAmount += result.summary.totalAmount;
        totalAvailableNights += result.summary.availableNights;
        totalBlockedNights += result.summary.blockedNights;
        allStartDates.push(result.summary.startDate);
        allEndDates.push(result.summary.endDate);
      }
    });

    // Find earliest start and latest end dates
    const earliestStart = allStartDates.length > 0 ? 
      allStartDates.reduce((earliest, current) => 
        current < earliest ? current : earliest
      ) : '';
    
    const latestEnd = allEndDates.length > 0 ? 
      allEndDates.reduce((latest, current) => 
        current > latest ? current : latest
      ) : '';

    const averagePricePerNight = totalAvailableNights > 0 ? 
      parseFloat((grandTotalAmount / totalAvailableNights).toFixed(2)) : 0;

    const summary = {
      totalProperties: body.properties.length,
      successfulProperties: successfulResults.length,
      failedProperties: failedResults.length,
      grandTotalAmount: parseFloat(grandTotalAmount.toFixed(2)),
      totalAvailableNights,
      totalBlockedNights,
      averagePricePerNight,
      dateRange: {
        earliestStart,
        latestEnd
      }
    };

    const response: BulkPricingResponse = {
      success: true,
      message: `Successfully fetched pricing for ${successfulResults.length} out of ${body.properties.length} properties`,
      results,
      summary
    };

    console.log(`Bulk pricing completed. Success: ${successfulResults.length}, Failed: ${failedResults.length}, Total: $${grandTotalAmount}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Bulk pricing API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process bulk pricing request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'This endpoint only accepts POST requests with property IDs and dates'
  }, { status: 405 });
}
