/**
 * OwnerRez API Service
 * Handles all API calls to OwnerRez platform
 */

import { ownerRezConfig, OwnerRezPropertyUpdate } from './ownerRezConfig';

export interface OwnerRezApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode?: number;
}

export interface OwnerRezTokens {
  access_token: string;
  scope: string;
  token_type: string;
  user_display_name: string;
  user_id: number;
}

/**
 * Load tokens from tokens.json file
 * In production, this should be stored in database
 */
export const loadTokens = async (): Promise<OwnerRezTokens | null> => {
  try {
    // In a real application, load from database or secure storage
    // For now, we'll use environment variables
    if (!ownerRezConfig.accessToken) {
      throw new Error('No access token found. Please configure OWNERREZ_ACCESS_TOKEN in environment variables.');
    }

    return {
      access_token: ownerRezConfig.accessToken,
      scope: 'all',
      token_type: 'bearer',
      user_display_name: ownerRezConfig.userDisplayName,
      user_id: parseInt(ownerRezConfig.userId)
    };
  } catch (error) {
    console.error('Error loading tokens:', error);
    return null;
  }
};

/**
 * Update a property in OwnerRez
 * @param propertyId - The ID of the property to update
 * @param updateData - The property data to update
 * @returns Promise<OwnerRezApiResponse>
 */
export const updateProperty = async (
  propertyId: number,
  updateData: Partial<OwnerRezPropertyUpdate>
): Promise<OwnerRezApiResponse> => {
  try {
    console.log('updateProperty called with propertyId:', propertyId, 'type:', typeof propertyId);
    
    // Validate propertyId is a number
    if (typeof propertyId !== 'number' || isNaN(propertyId)) {
      console.error('Invalid propertyId:', propertyId, 'type:', typeof propertyId);
      return {
        success: false,
        error: 'Property ID is required and must be a number'
      };
    }

    // Load access token
    const tokens = await loadTokens();
    if (!tokens) {
      return {
        success: false,
        error: 'Failed to load access token'
      };
    }

    const accessToken = tokens.access_token;
    const apiBaseV1 = ownerRezConfig.apiBaseV1;
    const clientId = ownerRezConfig.clientId;

    // Construct the API URL
    const url = `${apiBaseV1}/properties/${propertyId}`;

    // Convert data to JSON (equivalent to PHP's json_encode with JSON_UNESCAPED_SLASHES)
    const jsonData = JSON.stringify(updateData);

    // Make the PATCH request
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': `Website Integration (${clientId})`
      },
      body: jsonData
    });

    const responseData = await response.json();
    const statusCode = response.status;

    // Debug output (equivalent to PHP echo statements)
    console.log('HTTP Status:', statusCode);
    console.log('Request JSON:', jsonData);
    console.log('Response:', responseData);

    // Check if request was successful
    if (response.ok) {
      return {
        success: true,
        data: responseData,
        statusCode
      };
    } else {
      return {
        success: false,
        error: responseData.message || `HTTP ${statusCode}: ${response.statusText}`,
        statusCode,
        data: responseData
      };
    }

  } catch (error) {
    console.error('Error updating property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get property details from OwnerRez
 * @param propertyId - The ID of the property to retrieve
 * @returns Promise<OwnerRezApiResponse>
 */
export const getProperty = async (propertyId: number): Promise<OwnerRezApiResponse> => {
  try {
    // Load access token
    const tokens = await loadTokens();
    if (!tokens) {
      return {
        success: false,
        error: 'Failed to load access token'
      };
    }

    const accessToken = tokens.access_token;
    const apiBaseV1 = ownerRezConfig.apiBaseV1;
    const clientId = ownerRezConfig.clientId;

    // Construct the API URL
    const url = `${apiBaseV1}/properties/${propertyId}`;

    // Make the GET request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': `Website Integration (${clientId})`
      }
    });

    const responseData = await response.json();
    const statusCode = response.status;

    // Check if request was successful
    if (response.ok) {
      return {
        success: true,
        data: responseData,
        statusCode
      };
    } else {
      return {
        success: false,
        error: responseData.message || `HTTP ${statusCode}: ${response.statusText}`,
        statusCode,
        data: responseData
      };
    }

  } catch (error) {
    console.error('Error getting property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Create a new property in OwnerRez
 * @param propertyData - The property data to create
 * @returns Promise<OwnerRezApiResponse>
 */
export const createProperty = async (
  propertyData: OwnerRezPropertyUpdate
): Promise<OwnerRezApiResponse> => {
  try {
    // Load access token
    const tokens = await loadTokens();
    if (!tokens) {
      return {
        success: false,
        error: 'Failed to load access token'
      };
    }

    const accessToken = tokens.access_token;
    const apiBaseV1 = ownerRezConfig.apiBaseV1;
    const clientId = ownerRezConfig.clientId;

    // Construct the API URL
    const url = `${apiBaseV1}/properties`;

    // Convert data to JSON
    const jsonData = JSON.stringify(propertyData);

    // Make the POST request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': `Website Integration (${clientId})`
      },
      body: jsonData
    });

    const responseData = await response.json();
    const statusCode = response.status;

    // Check if request was successful
    if (response.ok) {
      return {
        success: true,
        data: responseData,
        statusCode
      };
    } else {
      return {
        success: false,
        error: responseData.message || `HTTP ${statusCode}: ${response.statusText}`,
        statusCode,
        data: responseData
      };
    }

  } catch (error) {
    console.error('Error creating property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Delete a property from OwnerRez
 * @param propertyId - The ID of the property to delete
 * @returns Promise<OwnerRezApiResponse>
 */
export const deleteProperty = async (propertyId: number): Promise<OwnerRezApiResponse> => {
  try {
    // Load access token
    const tokens = await loadTokens();
    if (!tokens) {
      return {
        success: false,
        error: 'Failed to load access token'
      };
    }

    const accessToken = tokens.access_token;
    const apiBaseV1 = ownerRezConfig.apiBaseV1;
    const clientId = ownerRezConfig.clientId;

    // Construct the API URL
    const url = `${apiBaseV1}/properties/${propertyId}`;

    // Make the DELETE request
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': `Website Integration (${clientId})`
      }
    });

    const responseData = await response.json();
    const statusCode = response.status;

    // Check if request was successful
    if (response.ok) {
      return {
        success: true,
        data: responseData,
        statusCode
      };
    } else {
      return {
        success: false,
        error: responseData.message || `HTTP ${statusCode}: ${response.statusText}`,
        statusCode,
        data: responseData
      };
    }

  } catch (error) {
    console.error('Error deleting property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
