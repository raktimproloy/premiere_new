export interface Property {
  id: number;
  active: boolean;
  address: {
    city: string;
    country: string;
    id: number;
    is_default: boolean;
    postal_code: string;
    state: string;
    street1: string;
    street2: string;
  };
  bathrooms: number;
  bathrooms_full: number;
  bathrooms_half: number;
  bedrooms: number;
  check_in: string;
  check_out: string;
  currency_code: string;
  key: string;
  latitude: number;
  longitude: number;
  max_guests: number;
  max_pets: number;
  name: string;
  property_type: string;
  thumbnail_url: string;
  thumbnail_url_large: string;
  thumbnail_url_medium: string;
  [key: string]: any;
}

export interface SearchFilters {
  ids?: string;
  rateFrom?: number;
  rateTo?: number;
  bedroomsFrom?: number;
  bedroomsTo?: number;
  allowsPets?: boolean;
  allowsChildren?: boolean;
  availabilityFrom?: string;
  availabilityTo?: string;
  bathroomsFullFrom?: number;
  bathroomsFullTo?: number;
  bathroomsHalfFrom?: number;
  bathroomsHalfTo?: number;
  guestsFrom?: number;
  guestsTo?: number;
  evaluateAvailabilityRules?: boolean;
  active?: boolean;
  includedTagIds?: string;
  excludedTagIds?: string;
  page?: number;
  pageSize?: number;
  // New filter properties for UI
  roomTypes?: string[];
  bedroomRanges?: string[];
  bathroomRanges?: string[];
  guestRanges?: string[];
  priceRange?: [number, number];
}

export interface OwnerRezSearchResponse {
  count: number;
  items: Array<{
    id: number;
    key: string;
    name: string;
  }>;
  limit: number;
  offset: number;
  next_page_url?: string;
}

export interface PricingData {
  date: string;
  amount: number;
  minNights: number;
  isArrivalDisallowed: boolean;
  isDepartureDisallowed: boolean;
  isStayDisallowed: boolean;
}

export interface PropertyWithPricing extends Property {
  totalPrice?: number;
  pricingData?: PricingData[];
}