import { NextRequest, NextResponse } from 'next/server';

async function callOwnerRezAPI(method: string, guestId: string, data?: any) {
  const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
  const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
  const v2Url = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";

  if (!username || !password || !v2Url) {
    throw new Error('API credentials not configured');
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  };

  if (data && (method === 'PUT' || method === 'POST')) {
    requestOptions.body = JSON.stringify(data);
  }

  const response = await fetch(`${v2Url}/guests/${guestId}`, requestOptions);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OwnerRez API error: ${response.status} - ${error.message || 'Unknown error'}`);
  }

  return await response.json();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Guest ID is required' },
        { status: 400 }
      );
    }

    const guest = await callOwnerRezAPI('GET', id);

    return NextResponse.json({
      success: true,
      guest: guest
    });

  } catch (error) {
    console.error('Get guest API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch guest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Guest ID is required' },
        { status: 400 }
      );
    }

    const updatedGuest = await callOwnerRezAPI('PUT', id, updateData);

    return NextResponse.json({
      success: true,
      message: 'Guest updated successfully',
      guest: updatedGuest
    });

  } catch (error) {
    console.error('Update guest API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update guest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Guest ID is required' },
        { status: 400 }
      );
    }

    await callOwnerRezAPI('DELETE', id);

    return NextResponse.json({
      success: true,
      message: 'Guest deleted successfully'
    });

  } catch (error) {
    console.error('Delete guest API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete guest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}