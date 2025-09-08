import { NextResponse } from 'next/server';
import { SearchService } from '@/lib/services/searchService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchService = new SearchService();
    
    // Parse and validate search filters
    const filters = searchService.parseSearchFilters(searchParams);
    
    // Validate pagination parameters
    const paginationValidation = searchService.validatePagination(filters);
    if (!paginationValidation.isValid) {
      return NextResponse.json(
        { error: paginationValidation.error },
        { status: 400 }
      );
    }

    // Use the search service to get properties
    const result = await searchService.searchProperties(filters);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search properties', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 