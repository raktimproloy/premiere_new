import { NextResponse } from 'next/server';
import { getCachedProperties, isCacheValid } from '@/utils/propertyCache';

export async function GET() {
  try {
    console.log('Cache status API called. Environment:', process.env.NODE_ENV);
    console.log('Vercel environment:', process.env.VERCEL);

    const cachedProperties = getCachedProperties();
    const isValid = isCacheValid();

    console.log(`Cache status - Valid: ${isValid}, Properties count: ${cachedProperties?.length || 0}`);

    return NextResponse.json({
      success: true,
      cacheValid: isValid,
      totalProperties: cachedProperties ? cachedProperties.length : 0,
      hasCache: cachedProperties !== null,
      timestamp: cachedProperties ? new Date().toISOString() : null,
      environment: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1'
    });

  } catch (error) {
    console.error('Cache status API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check cache status', 
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
        isVercel: process.env.VERCEL === '1'
      },
      { status: 500 }
    );
  }
} 