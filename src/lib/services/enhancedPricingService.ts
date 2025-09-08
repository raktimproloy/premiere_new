import { Property, PropertyWithPricing, PricingData } from '@/lib/types/property';
import { OwnerRezService } from './ownerRezService';

export interface PricingRequest {
  propertyIds: number[];
  arrivalDate: string;
  departureDate: string;
  includePricingRules?: boolean;
}

export interface PropertyPricingResult {
  propertyId: number;
  success: boolean;
  totalPrice: number;
  nightlyPrices: PricingData[];
  error?: string;
  pricingSummary: {
    totalNights: number;
    averagePricePerNight: number;
    minPricePerNight: number;
    maxPricePerNight: number;
    unavailableNights: number;
  };
}

export interface BatchPricingResponse {
  success: boolean;
  message: string;
  results: PropertyPricingResult[];
  summary: {
    totalProperties: number;
    successfulProperties: number;
    failedProperties: number;
    totalRevenue: number;
    averagePricePerProperty: number;
  };
}

export class EnhancedPricingService {
  private ownerRezService: OwnerRezService;

  constructor() {
    this.ownerRezService = new OwnerRezService();
  }

  /**
   * Calculate total price for a property based on pricing data
   */
  calculateTotalPrice(pricingData: PricingData[]): number {
    if (!pricingData || pricingData.length === 0) {
      return 0;
    }

    return pricingData.reduce((total, day) => {
      // Only add price if stay is allowed
      if (!day.isStayDisallowed) {
        return total + day.amount;
      }
      return total;
    }, 0);
  }

  /**
   * Calculate pricing summary statistics for a property
   */
  calculatePricingSummary(pricingData: PricingData[], arrivalDate: string, departureDate: string): {
    totalNights: number;
    averagePricePerNight: number;
    minPricePerNight: number;
    maxPricePerNight: number;
    unavailableNights: number;
  } {
    if (!pricingData || pricingData.length === 0) {
      return {
        totalNights: 0,
        averagePricePerNight: 0,
        minPricePerNight: 0,
        maxPricePerNight: 0,
        unavailableNights: 0
      };
    }

    const availablePrices = pricingData
      .filter(day => !day.isStayDisallowed)
      .map(day => day.amount);

    const unavailableNights = pricingData.filter(day => day.isStayDisallowed).length;
    const totalNights = pricingData.length;
    
    if (availablePrices.length === 0) {
      return {
        totalNights,
        averagePricePerNight: 0,
        minPricePerNight: 0,
        maxPricePerNight: 0,
        unavailableNights
      };
    }

    const totalPrice = availablePrices.reduce((sum, price) => sum + price, 0);
    const averagePricePerNight = totalPrice / availablePrices.length;
    const minPricePerNight = Math.min(...availablePrices);
    const maxPricePerNight = Math.max(...availablePrices);

    return {
      totalNights,
      averagePricePerNight: Math.round(averagePricePerNight * 100) / 100,
      minPricePerNight,
      maxPricePerNight,
      unavailableNights
    };
  }

  /**
   * Get pricing for a single property with detailed analysis
   */
  async getPropertyPricing(
    propertyId: number,
    arrivalDate: string,
    departureDate: string,
    includePricingRules: boolean = true
  ): Promise<PropertyPricingResult> {
    try {
      const pricingData = await this.ownerRezService.getPropertyPricing(
        propertyId,
        arrivalDate,
        departureDate,
        includePricingRules
      );

      const totalPrice = this.calculateTotalPrice(pricingData);
      const pricingSummary = this.calculatePricingSummary(pricingData, arrivalDate, departureDate);

      return {
        propertyId,
        success: true,
        totalPrice,
        nightlyPrices: pricingData,
        pricingSummary
      };
    } catch (error) {
      console.error(`Failed to get pricing for property ${propertyId}:`, error);
      return {
        propertyId,
        success: false,
        totalPrice: 0,
        nightlyPrices: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        pricingSummary: {
          totalNights: 0,
          averagePricePerNight: 0,
          minPricePerNight: 0,
          maxPricePerNight: 0,
          unavailableNights: 0
        }
      };
    }
  }

  /**
   * Get pricing for multiple properties with batch processing
   */
  async getBatchPropertyPricing(request: PricingRequest): Promise<BatchPricingResponse> {
    const { propertyIds, arrivalDate, departureDate, includePricingRules = true } = request;
    
    if (!propertyIds || propertyIds.length === 0) {
      return {
        success: false,
        message: 'No property IDs provided',
        results: [],
        summary: {
          totalProperties: 0,
          successfulProperties: 0,
          failedProperties: 0,
          totalRevenue: 0,
          averagePricePerProperty: 0
        }
      };
    }

    try {
      // Process all properties concurrently for better performance
      const pricingPromises = propertyIds.map(async (propertyId) => {
        return await this.getPropertyPricing(
          propertyId,
          arrivalDate,
          departureDate,
          includePricingRules
        );
      });

      const results = await Promise.all(pricingPromises);

      // Calculate summary statistics
      const successfulResults = results.filter(result => result.success);
      const failedResults = results.filter(result => !result.success);
      const totalRevenue = successfulResults.reduce((sum, result) => sum + result.totalPrice, 0);
      const averagePricePerProperty = successfulResults.length > 0 
        ? totalRevenue / successfulResults.length 
        : 0;

      return {
        success: true,
        message: `Successfully processed ${successfulResults.length} out of ${propertyIds.length} properties`,
        results,
        summary: {
          totalProperties: propertyIds.length,
          successfulProperties: successfulResults.length,
          failedProperties: failedResults.length,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          averagePricePerProperty: Math.round(averagePricePerProperty * 100) / 100
        }
      };
    } catch (error) {
      console.error('Batch pricing processing error:', error);
      return {
        success: false,
        message: 'Failed to process batch pricing request',
        results: [],
        summary: {
          totalProperties: propertyIds.length,
          successfulProperties: 0,
          failedProperties: propertyIds.length,
          totalRevenue: 0,
          averagePricePerProperty: 0
        }
      };
    }
  }

  /**
   * Validate date format and range
   */
  validateDateRange(arrivalDate: string, departureDate: string): { isValid: boolean; error?: string } {
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    const today = new Date();

    if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }

    if (arrival < today) {
      return { isValid: false, error: 'Arrival date cannot be in the past' };
    }

    if (departure <= arrival) {
      return { isValid: false, error: 'Departure date must be after arrival date' };
    }

    // Check if the date range is reasonable (e.g., not more than 1 year)
    const maxDateRange = new Date();
    maxDateRange.setFullYear(maxDateRange.getFullYear() + 1);
    
    if (departure > maxDateRange) {
      return { isValid: false, error: 'Date range cannot exceed 1 year' };
    }

    return { isValid: true };
  }
}

