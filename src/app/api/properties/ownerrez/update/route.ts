/**
 * API Route: Update Property in OwnerRez
 * PATCH /api/properties/ownerrez/update
 * 
 * This endpoint allows super admin and admin users to update properties
 * in the OwnerRez platform using the OwnerRez API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateProperty, getProperty } from '@/lib/ownerRezService';
import { OwnerRezPropertyUpdate } from '@/lib/ownerRezConfig';

// Define the request body interface
interface UpdatePropertyRequest {
  propertyId: number;
  updateData: Partial<OwnerRezPropertyUpdate>;
  useMinimalUpdate?: boolean; // If true, only update basic fields
}

export async function PATCH(request: NextRequest) {
  try {
    // Parse the request body
    const body: UpdatePropertyRequest = await request.json();
    const { propertyId, updateData, useMinimalUpdate = false } = body;

    // Validate required fields
    if (!propertyId || typeof propertyId !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Property ID is required and must be a number'
        },
        { status: 400 }
      );
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Update data is required and cannot be empty'
        },
        { status: 400 }
      );
    }

    // If useMinimalUpdate is true, only allow basic fields
    let finalUpdateData = updateData;
    if (useMinimalUpdate) {
      const allowedFields = ['Name', 'Active', 'EntityType', 'DefaultDescriptionLocale', 'TimeZoneId', 'WeekendType'];
      finalUpdateData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          if (key in updateData) {
            (obj as any)[key] = (updateData as any)[key];
          }
          return obj;
        }, {} as Partial<OwnerRezPropertyUpdate>);
    }

    // First, get the current property to verify it exists
    const getPropertyResponse = await getProperty(propertyId);
    if (!getPropertyResponse.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Property not found or error retrieving property: ${getPropertyResponse.error}`,
          statusCode: getPropertyResponse.statusCode
        },
        { status: getPropertyResponse.statusCode || 404 }
      );
    }

    // Update the property in OwnerRez
    const updateResponse = await updateProperty(propertyId, finalUpdateData);

    if (updateResponse.success) {
      return NextResponse.json(
        {
          success: true,
          message: 'Property updated successfully in OwnerRez',
          data: updateResponse.data,
          propertyId,
          updatedFields: Object.keys(finalUpdateData)
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update property in OwnerRez: ${updateResponse.error}`,
          statusCode: updateResponse.statusCode,
          data: updateResponse.data
        },
        { status: updateResponse.statusCode || 500 }
      );
    }

  } catch (error) {
    console.error('Error in update property API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while updating property',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve property details from OwnerRez
 * GET /api/properties/ownerrez/update?propertyId=123
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property ID is required as query parameter'
        },
        { status: 400 }
      );
    }

    const propertyIdNum = parseInt(propertyId);
    if (isNaN(propertyIdNum)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property ID must be a valid number'
        },
        { status: 400 }
      );
    }

    // Get property details from OwnerRez
    const getPropertyResponse = await getProperty(propertyIdNum);

    if (getPropertyResponse.success) {
      return NextResponse.json(
        {
          success: true,
          message: 'Property retrieved successfully from OwnerRez',
          data: getPropertyResponse.data,
          propertyId: propertyIdNum
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to retrieve property from OwnerRez: ${getPropertyResponse.error}`,
          statusCode: getPropertyResponse.statusCode,
          data: getPropertyResponse.data
        },
        { status: getPropertyResponse.statusCode || 500 }
      );
    }

  } catch (error) {
    console.error('Error in get property API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while retrieving property',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
