import { NextResponse } from 'next/server';
import { getCachedProperties, isCacheValid, clearCache, getCacheInfo } from '@/utils/propertyCache';

export async function GET() {
  try {
    console.log('Cache debug API called');
    
    const cacheInfo = getCacheInfo();

    console.log('Cache info:', cacheInfo);

    return NextResponse.json({
      success: true,
      cacheInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cache debug API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to debug cache', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'clear') {
      clearCache();
      return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "clear" to clear cache' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Cache debug POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute cache action', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
