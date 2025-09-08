import { Property, SearchFilters } from '@/lib/types/property';
import { OwnerRezService } from './ownerRezService';
import { getCachedProperties, getPropertiesByIds, ensureThumbnailUrls } from '@/utils/propertyCache';

export class SearchService {
  private ownerRezService: OwnerRezService;

  constructor() {
    this.ownerRezService = new OwnerRezService();
  }

  /**
   * Parse and validate search filters from URL parameters
   */
  parseSearchFilters(searchParams: URLSearchParams): SearchFilters {
    return {
      ids: searchParams.get('ids') || undefined,
      rateFrom: searchParams.get('rateFrom') ? Number(searchParams.get('rateFrom')) : undefined,
      rateTo: searchParams.get('rateTo') ? Number(searchParams.get('rateTo')) : undefined,
      bedroomsFrom: searchParams.get('bedroomsFrom') ? Number(searchParams.get('bedroomsFrom')) : undefined,
      bedroomsTo: searchParams.get('bedroomsTo') ? Number(searchParams.get('bedroomsTo')) : undefined,
      allowsPets: searchParams.get('allowsPets') ? searchParams.get('allowsPets') === 'true' : undefined,
      allowsChildren: searchParams.get('allowsChildren') ? searchParams.get('allowsChildren') === 'true' : undefined,
      availabilityFrom: searchParams.get('availabilityFrom') || undefined,
      availabilityTo: searchParams.get('availabilityTo') || undefined,
      bathroomsFullFrom: searchParams.get('bathroomsFullFrom') ? Number(searchParams.get('bathroomsFullFrom')) : undefined,
      bathroomsFullTo: searchParams.get('bathroomsFullTo') ? Number(searchParams.get('bathroomsFullTo')) : undefined,
      bathroomsHalfFrom: searchParams.get('bathroomsHalfFrom') ? Number(searchParams.get('bathroomsHalfFrom')) : undefined,
      bathroomsHalfTo: searchParams.get('bathroomsHalfTo') ? Number(searchParams.get('bathroomsHalfTo')) : undefined,
      guestsFrom: searchParams.get('guestsFrom') ? Number(searchParams.get('guestsFrom')) : undefined,
      guestsTo: searchParams.get('guestsTo') ? Number(searchParams.get('guestsTo')) : undefined,
      evaluateAvailabilityRules: searchParams.get('evaluateAvailabilityRules') ? searchParams.get('evaluateAvailabilityRules') === 'true' : undefined,
      active: searchParams.get('active') ? searchParams.get('active') === 'true' : undefined,
      includedTagIds: searchParams.get('includedTagIds') || undefined,
      excludedTagIds: searchParams.get('excludedTagIds') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 10,
      // Parse new UI filter parameters
      roomTypes: searchParams.get('roomTypes') ? searchParams.get('roomTypes')!.split(',') : undefined,
      bedroomRanges: searchParams.get('bedroomRanges') ? searchParams.get('bedroomRanges')!.split(',') : undefined,
      bathroomRanges: searchParams.get('bathroomRanges') ? searchParams.get('bathroomRanges')!.split(',') : undefined,
      guestRanges: searchParams.get('guestRanges') ? searchParams.get('guestRanges')!.split(',') : undefined,
      priceRange: searchParams.get('priceRange') ? JSON.parse(searchParams.get('priceRange')!) : undefined
    };
  }

  /**
   * Validate pagination parameters
   */
  validatePagination(filters: SearchFilters): { isValid: boolean; error?: string } {
    if (filters.page && (isNaN(filters.page) || filters.page < 1)) {
      return { 
        isValid: false, 
        error: 'Invalid page number. Must be greater than 0' 
      };
    }

    if (filters.pageSize && (isNaN(filters.pageSize) || filters.pageSize < 1 || filters.pageSize > 100)) {
      return { 
        isValid: false, 
        error: 'Invalid page size. Must be between 1 and 100' 
      };
    }

    return { isValid: true };
  }

  /**
   * Apply custom filters that aren't supported by OwnerRez search API
   */
  applyCustomFilters(properties: Property[], filters: SearchFilters): Property[] {
    let filteredProperties = properties;
    
    // Filter by bathrooms_full
    if (filters.bathroomsFullFrom !== undefined || filters.bathroomsFullTo !== undefined) {
      filteredProperties = filteredProperties.filter((property: Property) => {
        const bathroomsFull = property.bathrooms_full || 0;
        if (filters.bathroomsFullFrom !== undefined && bathroomsFull < filters.bathroomsFullFrom) return false;
        if (filters.bathroomsFullTo !== undefined && bathroomsFull > filters.bathroomsFullTo) return false;
        return true;
      });
    }

    // Filter by bathrooms_half
    if (filters.bathroomsHalfFrom !== undefined || filters.bathroomsHalfTo !== undefined) {
      filteredProperties = filteredProperties.filter((property: Property) => {
        const bathroomsHalf = property.bathrooms_half || 0;
        if (filters.bathroomsHalfFrom !== undefined && bathroomsHalf < filters.bathroomsHalfFrom) return false;
        if (filters.bathroomsHalfTo !== undefined && bathroomsHalf > filters.bathroomsHalfTo) return false;
        return true;
      });
    }

    // Apply UI-specific filters
    filteredProperties = this.applyUIFilters(filteredProperties, filters);

    return filteredProperties;
  }

  /**
   * Apply UI-specific filters (room type, bedrooms, bathrooms, guests, price)
   */
  private applyUIFilters(properties: Property[], filters: SearchFilters): Property[] {
    let filteredProperties = properties;

    // Filter by room types
    if (filters.roomTypes && filters.roomTypes.length > 0) {
      filteredProperties = filteredProperties.filter(property => 
        filters.roomTypes!.includes(property.property_type)
      );
    }

    // Filter by bedroom ranges
    if (filters.bedroomRanges && filters.bedroomRanges.length > 0) {
      filteredProperties = filteredProperties.filter(property => {
        return filters.bedroomRanges!.some(range => {
          if (range === '1-2') return property.bedrooms >= 1 && property.bedrooms <= 2;
          if (range === '3-4') return property.bedrooms >= 3 && property.bedrooms <= 4;
          if (range === '5+') return property.bedrooms >= 5;
          return false;
        });
      });
    }

    // Filter by bathroom ranges
    if (filters.bathroomRanges && filters.bathroomRanges.length > 0) {
      filteredProperties = filteredProperties.filter(property => {
        return filters.bathroomRanges!.some(range => {
          if (range === '1-2') return property.bathrooms >= 1 && property.bathrooms <= 2;
          if (range === '3-4') return property.bathrooms >= 3 && property.bathrooms <= 4;
          if (range === '5+') return property.bathrooms >= 5;
          return false;
        });
      });
    }

    // Filter by guest ranges
    if (filters.guestRanges && filters.guestRanges.length > 0) {
      filteredProperties = filteredProperties.filter(property => {
        return filters.guestRanges!.some(range => {
          if (range === '1-4') return property.max_guests >= 1 && property.max_guests <= 4;
          if (range === '5-8') return property.max_guests >= 5 && property.max_guests <= 8;
          if (range === '9+') return property.max_guests >= 9;
          return false;
        });
      });
    }

    // Filter by price range (if pricing data is available)
    if (filters.priceRange && filters.priceRange[0] > 0 || filters.priceRange && filters.priceRange[1] < 10000) {
      filteredProperties = filteredProperties.filter(property => {
        // For now, we'll skip price filtering as pricing is loaded separately
        // This can be enhanced when pricing data is integrated
        return true;
      });
    }

    return filteredProperties;
  }

  /**
   * Apply pagination to properties
   */
  applyPagination(
    properties: Property[], 
    page: number, 
    pageSize: number
  ): { properties: Property[]; pagination: any } {
    const limit = pageSize;
    const offset = (page - 1) * limit;
    const totalCount = properties.length;
    const paginatedProperties = properties.slice(offset, offset + limit);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      properties: paginatedProperties,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  /**
   * Main search method that combines all services
   */
  async searchProperties(filters: SearchFilters): Promise<{
    success: boolean;
    message: string;
    data: any;
    filters: SearchFilters;
    source: string;
    searchStats?: any;
  }> {
    try {
      // Step 1: Search properties using OwnerRez API
      const searchResponse = await this.ownerRezService.searchProperties(filters);
      
      if (!searchResponse.items || searchResponse.items.length === 0) {
        return {
          success: true,
          message: 'No properties found matching search criteria',
          data: {
            properties: [],
            pagination: {
              currentPage: filters.page || 1,
              totalPages: 0,
              totalCount: 0,
              pageSize: filters.pageSize || 10,
              hasNextPage: false,
              hasPreviousPage: false
            }
          },
          filters: filters,
          source: 'ownerrez_search'
        };
      }

      // Step 2: Get full property details from cache
      const propertyIds = searchResponse.items.map(item => item.id);
      const cachedProperties = getCachedProperties();
      
      if (!cachedProperties || cachedProperties.length === 0) {
        return {
          success: false,
          message: 'No cached properties available. Please call /api/properties/cache first.',
          data: {
            properties: [],
            pagination: {
              currentPage: filters.page || 1,
              totalPages: 0,
              totalCount: 0,
              pageSize: filters.pageSize || 10,
              hasNextPage: false,
              hasPreviousPage: false
            }
          },
          filters: filters,
          source: 'ownerrez_search'
        };
      }

      const fullProperties = getPropertiesByIds(propertyIds);

      // Step 3: Apply custom filters
      const filteredProperties = this.applyCustomFilters(fullProperties, filters);

      // Step 4: Return properties without pricing (pricing will be fetched separately when needed)
      const propertiesWithoutPricing = filteredProperties.map(prop => ({ ...prop }));

      // Step 5: Apply pagination
      const { properties: paginatedProperties, pagination } = this.applyPagination(
        propertiesWithoutPricing,
        filters.page || 1,
        filters.pageSize || 10
      );

      // Step 6: Ensure thumbnail URLs
      const propertiesWithThumbnails = await ensureThumbnailUrls(paginatedProperties);

      return {
        success: true,
        message: 'Properties retrieved from OwnerRez search and cached details',
        data: {
          properties: propertiesWithThumbnails,
          pagination
        },
        filters: filters,
        source: 'ownerrez_search_with_cache',
        searchStats: {
          ownerRezResults: searchResponse.items.length,
          cachedPropertiesFound: fullProperties.length,
          finalResults: propertiesWithThumbnails.length
        }
      };

    } catch (error) {
      console.error('Search service error:', error);
      throw error;
    }
  }
}
