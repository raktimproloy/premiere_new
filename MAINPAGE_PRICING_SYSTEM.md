# MainPage Two-Step Pricing Loading System

## Overview
The MainPage component now implements the same two-step loading system as the MainSection: first show property details, then fetch and display pricing information with skeleton loading states.

## Architecture

### 1. Two-Step Loading Process

#### Step 1: Property Loading
1. **Component mounts** → Shows loading spinner
2. **Properties API called** → `/api/properties/search`
3. **Property data received** → Property cards displayed immediately
4. **Pricing skeleton shown** → Gray placeholder for pricing

#### Step 2: Pricing Loading
1. **Pricing skeleton visible** → User sees animated placeholder
2. **Pricing API called** → `/api/properties/[id]/pricing` for each property
3. **Pricing data received** → Skeleton replaced with real pricing
4. **Price updates** → Property cards show actual rates

### 2. State Management

#### Property State
```typescript
const [properties, setProperties] = useState<Property[]>([]);
const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isInitialLoad, setIsInitialLoad] = useState(true);
```

#### Individual Property Pricing State
```typescript
interface Property {
  // ... other properties
  pricing?: any;
  pricingLoading?: boolean;
  pricingError?: string | null;
}
```

## Implementation Details

### 1. Property Fetching
```typescript
// Step 1: Fetch properties
const response = await fetch(`/api/properties/search?${searchParams.toString()}`);
const transformedProperties = data.data.properties.map(prop => ({
  // ... property data
  price: 0, // Will be updated with real pricing
  pricing: null,
  pricingLoading: false,
  pricingError: null
}));
```

### 2. Pricing Fetching
```typescript
// Step 2: Fetch pricing for each property
if (session.checkInDate && session.checkOutDate) {
  transformedProperties.forEach((property, index) => {
    setTimeout(() => {
      fetchPropertyPricing(property.id, session.checkInDate!, session.checkOutDate!);
    }, index * 200); // Stagger pricing requests
  });
}
```

### 3. Pricing State Updates
```typescript
const fetchPropertyPricing = async (propertyId: number, checkInDate: string, checkOutDate: string) => {
  // Show loading state
  setProperties(prev => prev.map(prop => 
    prop.id === propertyId 
      ? { ...prop, pricingLoading: true, pricingError: null }
      : prop
  ));

  // Fetch pricing
  const response = await fetch(`/api/properties/${propertyId}/pricing?start=${checkInDate}&end=${checkOutDate}`);
  
  // Update with pricing data
  setProperties(prev => prev.map(prop => 
    prop.id === propertyId 
      ? { 
          ...prop, 
          pricing: data.pricing, 
          pricingLoading: false, 
          pricingError: null,
          price: data.pricing.summary.totalAmount || prop.price
        }
      : prop
  ));
};
```

## User Experience Flow

### 1. **Page Load**
- Loading spinner shows
- Properties API called

### 2. **Properties Display**
- Property cards appear immediately
- Pricing shows skeleton/placeholder
- User can browse properties

### 3. **Pricing Loading**
- Skeleton animates for each property
- Pricing API calls happen in background
- Staggered loading (200ms delay between each)

### 4. **Pricing Complete**
- Real pricing replaces skeleton
- Price updates in property cards
- Total amounts calculated

## Visual States

### Pricing Loading States
1. **Skeleton**: Gray animated placeholder
2. **Loading**: Spinner or loading indicator
3. **Error**: "Pricing unavailable" message
4. **Complete**: Real pricing amount

### Property Card Updates
```typescript
{property.pricingLoading ? (
  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
) : property.pricingError ? (
  <div className="text-sm text-red-500">Pricing unavailable</div>
) : property.pricing ? (
  <div className="text-lg sm:text-xl font-bold text-gray-900">
    ${property.pricing.summary?.totalAmount?.toFixed(2)}
  </div>
) : (
  <div className="text-sm text-gray-400">Price on request</div>
)}
```

## Performance Optimizations

### 1. **Staggered Loading**
- Pricing requests spaced 200ms apart
- Prevents API rate limiting
- Better user experience

### 2. **State Preservation**
- Filtered properties maintain pricing states
- No duplicate API calls
- Efficient state management

### 3. **Error Handling**
- Individual property pricing errors
- Graceful fallbacks
- User-friendly error messages

## Benefits

1. **Fast Perceived Performance**: Properties show immediately
2. **Better UX**: Users can browse while pricing loads
3. **Clear Loading States**: Skeleton shows what's loading
4. **Efficient API Usage**: Staggered requests prevent overload
5. **Consistent Experience**: Same pattern as MainSection

## Console Logging

The system includes comprehensive logging for debugging:

```
🔄 Step 1: Fetching properties cache...
🔄 Step 1: Fetching properties from search API...
✅ Step 1 Complete: Successfully loaded X properties
🔄 Step 2: Fetching pricing for all properties...
🔄 Fetching pricing for property X...
✅ Pricing loaded for property X
❌ Pricing failed for property Y: error message
```

## Future Enhancements

1. **Pricing Caching**: Store pricing results locally
2. **Batch Pricing API**: Single call for multiple properties
3. **Real-time Updates**: WebSocket for dynamic pricing
4. **Offline Support**: Local storage for pricing data
5. **Smart Loading**: Prioritize visible properties first
