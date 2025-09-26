/**
 * OwnerRez API Usage Examples
 * This file contains examples of how to use the OwnerRez API endpoints
 */

import { updateProperty, getProperty, createProperty, deleteProperty } from './ownerRezService';
import { OwnerRezPropertyUpdate, getMinimalPropertyUpdate, getSimplePropertyUpdate } from './ownerRezConfig';

/**
 * Example 1: Update a property with only Active field (simplified approach)
 */
export const exampleActiveUpdate = async (propertyId: number, active: boolean) => {
  try {
    // Create simple update data - only Active field
    const updateData = getMinimalPropertyUpdate(active);
    
    // Update the property
    const result = await updateProperty(propertyId, updateData);
    
    if (result.success) {
      console.log(`Property ${active ? 'activated' : 'deactivated'} successfully:`, result.data);
    } else {
      console.error('Failed to update property:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error in active update example:', error);
    return { success: false, error: 'Unknown error' };
  }
};

/**
 * Example 2: Update a property with custom data
 */
export const exampleCustomUpdate = async (propertyId: number) => {
  try {
    // Create custom update data
    const updateData: Partial<OwnerRezPropertyUpdate> = {
      Name: 'My Custom Property Name',
      Active: true,
      MaxGuests: 8,
      MaxAdults: 6,
      MaxChildren: 2,
      MinNights: 3,
      MaxNights: 14,
      CheckIn: '16:00:00',
      CheckOut: '10:00:00',
      TimeZoneId: 'America/New_York',
      WeekendType: 'saturday_sunday'
    };
    
    // Update the property
    const result = await updateProperty(propertyId, updateData);
    
    if (result.success) {
      console.log('Property updated successfully:', result.data);
    } else {
      console.error('Failed to update property:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error in custom update example:', error);
    return { success: false, error: 'Unknown error' };
  }
};

/**
 * Example 3: Get property details
 */
export const exampleGetProperty = async (propertyId: number) => {
  try {
    const result = await getProperty(propertyId);
    
    if (result.success) {
      console.log('Property details:', result.data);
    } else {
      console.error('Failed to get property:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error in get property example:', error);
    return { success: false, error: 'Unknown error' };
  }
};

/**
 * Example 4: Create a new property
 */
export const exampleCreateProperty = async () => {
  try {
    // Create property data
    const propertyData: OwnerRezPropertyUpdate = {
      Name: 'New Test Property',
      Active: true,
      EntityType: 'Property',
      DefaultDescriptionLocale: 'en',
      TimeZoneId: 'America/New_York',
      WeekendType: 'saturday_sunday',
      MaxGuests: 4,
      MaxAdults: 2,
      MaxChildren: 2,
      MinNights: 2,
      MaxNights: 7,
      CheckIn: '15:00:00',
      CheckOut: '11:00:00'
    };
    
    const result = await createProperty(propertyData);
    
    if (result.success) {
      console.log('Property created successfully:', result.data);
    } else {
      console.error('Failed to create property:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error in create property example:', error);
    return { success: false, error: 'Unknown error' };
  }
};

/**
 * Example 5: Delete a property
 */
export const exampleDeleteProperty = async (propertyId: number) => {
  try {
    const result = await deleteProperty(propertyId);
    
    if (result.success) {
      console.log('Property deleted successfully:', result.data);
    } else {
      console.error('Failed to delete property:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error in delete property example:', error);
    return { success: false, error: 'Unknown error' };
  }
};

/**
 * Example 6: Using the API endpoint directly (for frontend usage) - Simplified
 */
export const exampleApiEndpointUsage = async (propertyId: number, active: boolean) => {
  try {
    // Example of calling the API endpoint from frontend - only Active field
    const response = await fetch('/api/properties/ownerrez/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId: propertyId,
        updateData: {
          Active: active
        }
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`Property ${active ? 'activated' : 'deactivated'} via API endpoint:`, result.data);
    } else {
      console.error('Failed to update property via API endpoint:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error in API endpoint example:', error);
    return { success: false, error: 'Unknown error' };
  }
};

/**
 * Example 7: Get property details via API endpoint
 */
export const exampleGetPropertyViaApi = async (propertyId: number) => {
  try {
    const response = await fetch(`/api/properties/ownerrez/update?propertyId=${propertyId}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('Property details via API endpoint:', result.data);
    } else {
      console.error('Failed to get property via API endpoint:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error in get property API example:', error);
    return { success: false, error: 'Unknown error' };
  }
};
