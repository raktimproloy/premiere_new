# OwnerRez API Integration

This document explains how to use the OwnerRez API integration for updating properties in the OwnerRez platform.

## Overview

The OwnerRez integration allows super admin and admin users to update properties directly in the OwnerRez platform using their API. This integration maintains the same structure as the original PHP code but is implemented in TypeScript/JavaScript for the Next.js application.

## Files Created

1. **`src/lib/ownerRezConfig.ts`** - Configuration file with environment variables and TypeScript interfaces
2. **`src/lib/ownerRezService.ts`** - Service layer for OwnerRez API calls
3. **`src/app/api/properties/ownerrez/update/route.ts`** - API endpoint for updating properties
4. **`src/lib/ownerRezExamples.ts`** - Usage examples and documentation

## Environment Variables

Add these variables to your `.env.local` file:

```env
# OwnerRez OAuth Configuration
OWNERREZ_CLIENT_ID=c_1rd5xrs60zwwwxxt8mzh4lbpzenog0c7
OWNERREZ_CLIENT_SECRET=s_bx9rc54ibj35s2vaaa0jbzlf58083lxe
OWNERREZ_REDIRECT_URI=https://websitesdaddy.com/ownerRez/auth.php
OWNERREZ_AUTH_URL=https://websitesdaddy.com/ownerRez/auth.php
OWNERREZ_TOKEN_URL=https://api.ownerrez.com/oauth/access_token
OWNERREZ_ACCESS_TOKEN=at_nc8b37b53r62z8x2dwwfizk1akc3ze82
OWNERREZ_USER_ID=347476883
OWNERREZ_USER_DISPLAY_NAME=PremiereStaysMiami
```

## API Endpoints

### Update Property
- **URL**: `PATCH /api/properties/ownerrez/update`
- **Description**: Updates a property in OwnerRez
- **Body**:
```json
{
  "propertyId": 464914,
  "updateData": {
    "Name": "Updated Property Name",
    "Active": true,
    "MaxGuests": 6,
    "MinNights": 2,
    "MaxNights": 7
  },
  "useMinimalUpdate": false
}
```

### Get Property
- **URL**: `GET /api/properties/ownerrez/update?propertyId=464914`
- **Description**: Retrieves property details from OwnerRez

## Usage Examples

### 1. Using the Service Layer (Server-side)

```typescript
import { updateProperty, getProperty } from '@/lib/ownerRezService';

// Update a property
const result = await updateProperty(464914, {
  Name: 'Updated Property Name',
  Active: true,
  MaxGuests: 6
});

// Get property details
const property = await getProperty(464914);
```

### 2. Using the API Endpoint (Client-side)

```typescript
// Update property
const response = await fetch('/api/properties/ownerrez/update', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    propertyId: 464914,
    updateData: {
      Name: 'Updated Property Name',
      Active: true,
      MaxGuests: 6
    },
    useMinimalUpdate: true
  })
});

const result = await response.json();
```

### 3. Get Property Details

```typescript
const response = await fetch('/api/properties/ownerrez/update?propertyId=464914');
const result = await response.json();
```

## Property Update Fields

The integration supports all OwnerRez property fields. Here are the most commonly used ones:

### Basic Fields
- `Name` - Property name
- `Active` - Whether the property is active
- `EntityType` - Always "Property"
- `DefaultDescriptionLocale` - Language code (e.g., "en")
- `TimeZoneId` - IANA timezone (e.g., "America/New_York")

### Guest Limits
- `MaxGuests` - Maximum total guests
- `MaxAdults` - Maximum adult guests
- `MaxChildren` - Maximum child guests
- `MaxPets` - Maximum pets allowed

### Stay Rules
- `MinNights` - Minimum nights stay
- `MaxNights` - Maximum nights stay
- `MinWeekendNights` - Minimum weekend nights
- `MinHolidayNights` - Minimum holiday nights

### Check-in/Check-out
- `CheckIn` - Check-in time (HH:MM:SS format)
- `CheckOut` - Check-out time (HH:MM:SS format)
- `CheckInEnd` - Latest check-in time

### Weekend Configuration
- `WeekendType` - Weekend definition ("saturday_sunday", "friday_saturday", "sunday_monday")
- `ArrivalDays` - Allowed arrival days
- `DepartureDays` - Allowed departure days

### Financial
- `SecurityDepositAmount` - Security deposit amount
- `FirstPaymentAmount` - First payment amount
- `FirstPaymentRule` - First payment rule ("All", "First", "Last")

## Error Handling

All API calls return a standardized response format:

```typescript
interface OwnerRezApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode?: number;
}
```

## Security Notes

1. **Access Tokens**: Store access tokens securely. In production, consider using a database instead of environment variables.
2. **Client Credentials**: Keep client ID and secret secure and never expose them in client-side code.
3. **Validation**: Always validate input data before sending to OwnerRez API.
4. **Rate Limiting**: Be aware of OwnerRez API rate limits.

## Testing

Use the examples in `src/lib/ownerRezExamples.ts` to test the integration:

```typescript
import { exampleMinimalUpdate, exampleCustomUpdate } from '@/lib/ownerRezExamples';

// Test minimal update
await exampleMinimalUpdate(464914);

// Test custom update
await exampleCustomUpdate(464914);
```

## Troubleshooting

### Common Issues

1. **Invalid Access Token**: Ensure `OWNERREZ_ACCESS_TOKEN` is correct and not expired
2. **Property Not Found**: Verify the property ID exists in OwnerRez
3. **Invalid Field Values**: Check that enum values match OwnerRez requirements
4. **Missing Required Fields**: Some fields may be required for updates

### Debug Mode

Enable debug logging by checking the console for detailed error messages and API responses.

## Migration from PHP

This JavaScript implementation maintains the same structure as the original PHP code:

- Configuration is loaded from environment variables
- API calls use the same endpoints and headers
- Response handling follows the same pattern
- Error handling is consistent

The main differences are:
- TypeScript interfaces for type safety
- Modern async/await syntax
- Next.js API route structure
- Environment variable management
