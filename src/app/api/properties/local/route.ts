import { NextResponse } from 'next/server';
import { propertyService } from '@/lib/propertyService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    let properties;

    if (search) {
      // Search properties
      properties = await propertyService.searchProperties(search);
    } else if (status) {
      // Get properties by status
      properties = await propertyService.getPropertiesByStatus(status);
    } else {
      // Get all properties
      properties = await propertyService.getAllProperties();
    }

    // Apply pagination
    const totalCount = properties.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProperties = properties.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      message: 'Local properties retrieved successfully',
      data: {
        properties: paginatedProperties,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      },
      filters: {
        status: status || null,
        search: search || null
      },
      source: 'local_database'
    });

  } catch (error) {
    console.error('Local properties API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch local properties', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
