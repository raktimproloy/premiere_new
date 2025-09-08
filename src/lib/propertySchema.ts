import { ObjectId } from 'mongodb';

export interface PropertyImage {
  url: string;
  publicId: string;
  alt?: string;
  isPrimary?: boolean;
  uploadedAt: Date;
}

export interface PropertyAmenity {
  id: string;
  name: string;
  category: string;
  icon?: string;
}

export interface PropertyRule {
  id: string;
  name: string;
  description?: string;
  isAllowed: boolean;
}

// New interfaces for the additional fields
export interface BusinessInformation {
  fullNameOrBusinessName: string;
  contactPerson?: string;
  emailAddress: string;
  phoneNumber: string;
  mailingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface PropertyDetails {
  propertyAddresses: string[];
  propertyType: string;
  numberOfUnits?: number;
  listingPlatformUrls: {
    airbnb?: string;
    vrbo?: string;
    booking?: string;
    other?: string[];
  };
}

export interface LegalCompliance {
  proofOfOwnership?: string; // File path or URL
  businessLicenseNumber?: string;
  taxId?: string;
  localRegistrationNumber?: string;
}

export interface FinancialSetup {
  bankAccountInfo?: {
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    accountType?: string;
  };
  taxForms?: {
    w9?: string; // File path or URL
    other?: string[];
  };
}

export interface ServicePreferences {
  desiredServices: string[];
  customRequirements?: string;
}

export interface LocalProperty {
  _id?: ObjectId;
  ownerRezId: number; // The ID from OwnerRez
  name: string;
  description?: string;
  propertyType: string;
  address: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
  };
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  maxPets: number;
  images: PropertyImage[];
  amenities: PropertyAmenity[];
  rules: PropertyRule[];
  pricing: {
    baseRate: number;
    currency: string;
    cleaningFee?: number;
    serviceFee?: number;
    taxes?: number;
  };
  availability: {
    checkInTime: string;
    checkOutTime: string;
    minStay: number;
    maxStay?: number;
  };
  policies: {
    cancellationPolicy: string;
    houseRules: string[];
    petPolicy?: string;
    smokingPolicy?: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'draft';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSyncedWithOwnerRez: Date;
  
  // New fields
  businessInformation?: BusinessInformation;
  propertyDetails?: PropertyDetails;
  legalCompliance?: LegalCompliance;
  financialSetup?: FinancialSetup;
  servicePreferences?: ServicePreferences;
}

export interface PropertyCreateRequest {
  ownerRezId: number;
  name: string;
  description?: string;
  propertyType: string;
  address: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
  };
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  maxPets: number;
  pricing: {
    baseRate: number;
    currency: string;
    cleaningFee?: number;
    serviceFee?: number;
    taxes?: number;
  };
  availability: {
    checkInTime: string;
    checkOutTime: string;
    minStay: number;
    maxStay?: number;
  };
  policies: {
    cancellationPolicy: string;
    houseRules: string[];
    petPolicy?: string;
    smokingPolicy?: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  
  // New fields
  businessInformation?: BusinessInformation;
  propertyDetails?: PropertyDetails;
  legalCompliance?: LegalCompliance;
  financialSetup?: FinancialSetup;
  servicePreferences?: ServicePreferences;
}

export interface PropertyUpdateRequest extends Partial<PropertyCreateRequest> {
  status?: 'active' | 'inactive' | 'maintenance' | 'draft';
  isVerified?: boolean;
  images?: PropertyImage[];
  amenities?: PropertyAmenity[];
  rules?: PropertyRule[];
}
