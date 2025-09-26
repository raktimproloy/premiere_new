/**
 * OwnerRez API Configuration
 * Contains all the necessary configuration for OwnerRez API integration
 */

export const ownerRezConfig = {
  // OAuth Client Credentials from OwnerRez
  clientId: process.env.OWNERREZ_CLIENT_ID || 'c_1rd5xrs60zwwwxxt8mzh4lbpzenog0c7',
  clientSecret: process.env.OWNERREZ_CLIENT_SECRET || 's_bx9rc54ibj35s2vaaa0jbzlf58083lxe',

  // Redirect URI registered with OwnerRez
  redirectUri: process.env.OWNERREZ_REDIRECT_URI || 'https://websitesdaddy.com/ownerRez/auth.php',

  // OwnerRez OAuth endpoints
  authUrl: process.env.OWNERREZ_AUTH_URL || 'https://websitesdaddy.com/ownerRez/auth.php',
  tokenUrl: process.env.OWNERREZ_TOKEN_URL || 'https://api.ownerrez.com/oauth/access_token',

  // API base endpoints
  apiBaseV1: process.env.OWNERREZ_API_V1 || 'https://api.ownerrez.com/v1',
  apiBaseV2: process.env.OWNERREZ_API_V2 || 'https://api.ownerrez.com/v2',

  // Access token (should be loaded from tokens.json or database)
  accessToken: process.env.OWNERREZ_ACCESS_TOKEN || 'at_nc8b37b53r62z8x2dwwfizk1akc3ze82',
  
  // User information
  userId: process.env.OWNERREZ_USER_ID || '347476883',
  userDisplayName: process.env.OWNERREZ_USER_DISPLAY_NAME || 'PremiereStaysMiami',
};

/**
 * Default property update payload structure
 * This matches the PHP structure but in TypeScript format
 */
export interface OwnerRezPropertyUpdate {
  Active?: boolean;
  AddressId?: number;
  AllowedPaymentMode?: 'Offline' | 'Online' | 'Both';
  ArrivalDays?: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  CalendarColor?: string;
  CanOptOutDamageProtection?: boolean;
  CancellationPolicyId?: number;
  CheckIn?: string;
  CheckInEnd?: string;
  CheckOut?: string;
  DamageProtectionProductId?: number;
  DaysBeforeArrivalForCheck?: number;
  DaysBeforeArrivalForCustom?: number;
  DefaultDescriptionLocale?: string;
  DepartureDays?: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  DisplayCulture?: string;
  DisplayOrder?: number;
  EntityType?: 'Property';
  ExternalDisplayOrder?: number;
  ExternalName?: string;
  FirstPaymentAmount?: number;
  FirstPaymentRule?: 'All' | 'First' | 'Last';
  HasLinkedAvailabilityProperties?: boolean;
  InternalCode?: string;
  IsSnoozed?: boolean;
  Key?: string;
  Latitude?: number;
  LatitudeApproximate?: number;
  Longitude?: number;
  LongitudeApproximate?: number;
  MaxAdults?: number;
  MaxChildren?: number;
  MaxDaysBeforeArrival?: number;
  MaxDaysBeforeArrivalIsDepartureBlocked?: boolean;
  MaxDisallowGapNights?: number;
  MaxGuests?: number;
  MaxNights?: number;
  MaxPets?: number;
  MinDisallowGapNights?: number;
  MinGapNights?: number;
  MinGapNightsIsOverride?: boolean;
  MinHolidayNights?: number;
  MinHoursBeforeArrival?: number;
  MinNights?: number;
  MinWeekendNights?: number;
  Name?: string;
  NoAgreement?: boolean;
  PendingAction?: 'Cancel' | 'Hold' | 'Release';
  PendingEmailTemplateId?: number;
  PendingFor?: 'Payment' | 'Confirmation' | 'Check';
  PendingHoursForCheck?: number;
  PendingHoursForCreditCard?: number;
  PendingHoursForCustom?: number;
  PhoneId?: number;
  PreferredAirbnbLinkedAccountId?: number;
  PublicUrl?: string;
  QuickBooksClass?: string;
  QuickBooksCurrency?: string;
  QuickBooksDepartment?: string;
  QuickBooksId?: number;
  QuickBooksRentItem?: string;
  QuoteExpirationDays?: number;
  RedirectAfterBookingUrl?: string;
  RequireConfirmationForOnlineBookings?: boolean;
  RequireGapNights?: number;
  SecondPaymentDays?: number;
  SecondPaymentRule?: 'schedule_never' | 'schedule_always' | 'schedule_conditional';
  SecurityDepositAmount?: number;
  SecurityDepositDays?: number;
  SecurityDepositReleaseDays?: number;
  SecurityDepositReleaseRemindMe?: boolean;
  SecurityDepositRule?: 'takeif' | 'always' | 'never';
  SecurityDepositType?: 'hold' | 'charge' | 'refund';
  SendPaymentReminder?: boolean;
  SendSecurityDepositReminder?: boolean;
  ThemeOverrideId?: number;
  TimeZoneId?: string;
  TravelInsuranceRule?: 'disabled' | 'optional' | 'required';
  UserId?: number;
  WThumbnailFileId?: number;
  WThumbnailThumbUrl?: string;
  WeekendType?: 'saturday_sunday' | 'friday_saturday' | 'sunday_monday';
}

/**
 * Minimal property update payload - only Active field
 */
export const getMinimalPropertyUpdate = (active: boolean): Partial<OwnerRezPropertyUpdate> => ({
  Active: active
});

/**
 * Simple property update payload - only Active field
 */
export const getSimplePropertyUpdate = (active: boolean): Partial<OwnerRezPropertyUpdate> => ({
  Active: active
});

/**
 * Complete property update payload - matches PHP structure exactly
 * This is the full payload structure from the PHP code
 */
export const getCompletePropertyUpdate = (propertyName: string, active: boolean = true): Partial<OwnerRezPropertyUpdate> => ({
  Active: active,
  AddressId: 1,                          // must exist in your account
  AllowedPaymentMode: "Offline",         // enum (lowercase)
  ArrivalDays: "Sunday",                 // enum (lowercase day name)
  CalendarColor: "#FF9900",              // should be a hex color
  CanOptOutDamageProtection: true,
  CancellationPolicyId: 1,               // must exist
  CheckIn: "15:00:00",
  CheckInEnd: "20:00:00",
  CheckOut: "11:00:00",
  DamageProtectionProductId: 1,          // must exist
  DaysBeforeArrivalForCheck: 20,
  DaysBeforeArrivalForCustom: 64,
  DefaultDescriptionLocale: "en",        // enum, ISO two-letter
  DepartureDays: "Sunday",               // enum
  DisplayCulture: "en-US",
  DisplayOrder: 1,
  EntityType: "Property",                // enum
  ExternalDisplayOrder: 1,
  ExternalName: "Test Property External",
  FirstPaymentAmount: 1.0,
  FirstPaymentRule: "All",               // enum (lowercase)
  HasLinkedAvailabilityProperties: true,
  InternalCode: "PROP123",
  IsSnoozed: false,
  Key: "eedc49ba-3deb-4cc8-aa3d-82079711c844",
  Latitude: 40.7128,
  LatitudeApproximate: 40.7128,
  Longitude: -74.0060,
  LongitudeApproximate: -74.0060,
  MaxAdults: 4,
  MaxChildren: 2,
  MaxDaysBeforeArrival: 365,
  MaxDaysBeforeArrivalIsDepartureBlocked: false,
  MaxDisallowGapNights: 0,
  MaxGuests: 6,
  MaxNights: 30,
  MaxPets: 1,
  MinDisallowGapNights: 0,
  MinGapNights: 0,
  MinGapNightsIsOverride: false,
  MinHolidayNights: 2,
  MinHoursBeforeArrival: 24,
  MinNights: 2,
  MinWeekendNights: 2,
  Name: propertyName,
  NoAgreement: false,
  PendingAction: "Cancel",               // enum (lowercase)
  PendingEmailTemplateId: 1,
  PendingFor: "Payment",                 // enum (lowercase)
  PendingHoursForCheck: 18,
  PendingHoursForCreditCard: 17,
  PendingHoursForCustom: 19,
  PhoneId: 1,                            // must exist
  PreferredAirbnbLinkedAccountId: 1,     // must exist
  PublicUrl: "https://myproperty.com",
  QuickBooksClass: "QB-Class",
  QuickBooksCurrency: "USD",
  QuickBooksDepartment: "Dept1",
  QuickBooksId: 1,
  QuickBooksRentItem: "RentItem1",
  QuoteExpirationDays: 8,
  RedirectAfterBookingUrl: "https://myproperty.com/thank-you",
  RequireConfirmationForOnlineBookings: true,
  RequireGapNights: 0,
  SecondPaymentDays: 1,
  SecondPaymentRule: "schedule_never",     // enum (lowercase)
  SecurityDepositAmount: 200.0,
  SecurityDepositDays: 1,
  SecurityDepositReleaseDays: 3,
  SecurityDepositReleaseRemindMe: true,
  SecurityDepositRule: "takeif",          // enum (lowercase)
  SecurityDepositType: "hold",            // enum (lowercase)
  SendPaymentReminder: true,
  SendSecurityDepositReminder: true,
  ThemeOverrideId: 1,
  TimeZoneId: "America/New_York",         // IANA timezone
  TravelInsuranceRule: "disabled",        // enum (lowercase)
  UserId: 37,                             // must exist
  WThumbnailFileId: 1,                    // must exist
  WThumbnailThumbUrl: "https://myproperty.com/thumb.jpg",
  WeekendType: "saturday_sunday"          // enum (lowercase)
});

/**
 * Minimal property update payload - matches PHP minimal structure
 */
export const getMinimalPropertyUpdatePayload = (propertyName: string, active: boolean = true): Partial<OwnerRezPropertyUpdate> => ({
  Active: active,
  Name: propertyName,
  EntityType: "Property",
  DefaultDescriptionLocale: "en",
  TimeZoneId: "America/New_York",
  WeekendType: "saturday_sunday"
});
