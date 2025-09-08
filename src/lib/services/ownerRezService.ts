import { SearchFilters, OwnerRezSearchResponse, PricingData } from '@/lib/types/property';

export class OwnerRezService {
  private username: string;
  private password: string;
  private baseUrl: string;

  constructor() {
    this.username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
    this.password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
    this.baseUrl = process.env.NEXT_PUBLIC_OWNERREZ_API_V1 || "https://api.ownerrez.com/v1";

    if (!this.username || !this.password) {
      throw new Error('API credentials not configured');
    }
  }

  private getAuthHeaders() {
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    return { 
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    };
  }

  async searchProperties(filters: SearchFilters): Promise<OwnerRezSearchResponse> {
    const searchUrl = new URL(`${this.baseUrl}/properties/search`);
    
    if (filters.ids) searchUrl.searchParams.append('ids', filters.ids);
    if (filters.rateFrom) searchUrl.searchParams.append('rateFrom', filters.rateFrom.toString());
    if (filters.rateTo) searchUrl.searchParams.append('rateTo', filters.rateTo.toString());
    if (filters.bedroomsFrom) searchUrl.searchParams.append('bedroomsFrom', filters.bedroomsFrom.toString());
    if (filters.bedroomsTo) searchUrl.searchParams.append('bedroomsTo', filters.bedroomsTo.toString());
    if (filters.allowsPets !== undefined) searchUrl.searchParams.append('allowsPets', filters.allowsPets.toString());
    if (filters.allowsChildren !== undefined) searchUrl.searchParams.append('allowsChildren', filters.allowsChildren.toString());
    if (filters.evaluateAvailabilityRules !== undefined) searchUrl.searchParams.append('evaluateAvailabilityRules', filters.evaluateAvailabilityRules.toString());
    if (filters.active !== undefined) searchUrl.searchParams.append('active', filters.active.toString());
    if (filters.includedTagIds) searchUrl.searchParams.append('includedTagIds', filters.includedTagIds);
    if (filters.excludedTagIds) searchUrl.searchParams.append('excludedTagIds', filters.excludedTagIds);
    if (filters.availabilityFrom) searchUrl.searchParams.append('availabilityFrom', filters.availabilityFrom);
    if (filters.availabilityTo) searchUrl.searchParams.append('availabilityTo', filters.availabilityTo);

    const limit = filters.pageSize || 10;
    const offset = ((filters.page || 1) - 1) * limit;
    searchUrl.searchParams.append('limit', limit.toString());
    searchUrl.searchParams.append('offset', offset.toString());

    const res = await fetch(searchUrl.toString(), { 
      headers: this.getAuthHeaders() 
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`OwnerRez API error: ${res.status} - ${error.message || 'Unknown error'}`);
    }

    return await res.json();
  }

  async getPropertyPricing(
    propertyId: number, 
    startDate: string, 
    endDate: string, 
    includePricingRules: boolean = true
  ): Promise<PricingData[]> {
    const pricingUrl = new URL(`${this.baseUrl}/listings/${propertyId}/pricing`);
    pricingUrl.searchParams.append('includePricingRules', includePricingRules.toString());
    pricingUrl.searchParams.append('start', startDate);
    pricingUrl.searchParams.append('end', endDate);

    const res = await fetch(pricingUrl.toString(), { 
      headers: this.getAuthHeaders() 
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`OwnerRez Pricing API error: ${res.status} - ${error.message || 'Unknown error'}`);
    }

    return await res.json();
  }

  async getPropertiesPricing(
    propertyIds: number[], 
    startDate: string, 
    endDate: string
  ): Promise<Map<number, PricingData[]>> {
    const pricingMap = new Map<number, PricingData[]>();
    
    const pricingPromises = propertyIds.map(async (id) => {
      try {
        const pricing = await this.getPropertyPricing(id, startDate, endDate);
        return { id, pricing };
      } catch (error) {
        console.error(`Failed to get pricing for property ${id}:`, error);
        return { id, pricing: [] };
      }
    });

    const results = await Promise.all(pricingPromises);
    
    results.forEach(({ id, pricing }) => {
      pricingMap.set(id, pricing);
    });

    return pricingMap;
  }
}