import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

interface UnifiedProperty {
  id: string | number;
  name: string;
  type?: string;
  property_type?: string;
  bathrooms: number;
  bedrooms: number;
  capacity?: string;
  max_guests?: number;
  images?: string[];
  price?: string;
  status?: 'Pending' | 'Occupied' | 'Active' | 'Rejected';
  active?: boolean;
  listingDate?: string | null;
  address?: any;
  owner?: { name?: string; email?: string, phone?: string } | null;
}

export async function GET(request: NextRequest) {
  try {
    // Auth
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    if (authResult.user.role !== 'superadmin') {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    // Query params
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '8'), 1), 100);
    const statusFilter = (searchParams.get('status') || 'all').toLowerCase(); // 'all' | 'pending' | 'active'

    // Fetch local properties
    const client = await clientPromise;
    const db = client.db('premiere-stays');
    const localProps = await db.collection('properties')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const localMapped: UnifiedProperty[] = localProps.map((property: any) => ({
      id: property._id.toString(),
      name: property.name,
      type: property.propertyType,
      property_type: property.propertyType,
      bathrooms: Number(property.bathrooms) || 0,
      bedrooms: Number(property.bedrooms) || 0,
      capacity: property.maxGuests?.toString(),
      max_guests: property.maxGuests,
      images: property.images,
      price: property.pricing?.baseRate?.toString() || '0',
      status: property.status === 'draft' ? 'Pending' : 
              property.status === 'active' ? 'Active' : 
              property.status === 'occupied' ? 'Occupied' : 'Pending',
      active: property.status === 'active',
      listingDate: property.createdAt ? new Date(property.createdAt).toISOString() : null,
      address: property.address,
      owner: property.owner ? { name: property.owner.name, email: property.owner.email, phone: property.owner.phone } : null,
    }));

    // Fetch OwnerRez properties (v2)
    const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
    const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
    const baseUrl = process.env.NEXT_PUBLIC_OWNERREZ_API_V2 || "https://api.ownerrez.com/v2";
    let ownerRezMapped: UnifiedProperty[] = [];
    if (username && password && baseUrl) {
      try {
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        // We will retrieve up to 1000 properties; adjust if needed
        const apiUrl = new URL(`${baseUrl}/properties`);
        apiUrl.searchParams.append('include_tags', 'True');
        apiUrl.searchParams.append('include_fields', 'True');
        apiUrl.searchParams.append('include_listing_numbers', 'True');
        apiUrl.searchParams.append('limit', '1000');
        apiUrl.searchParams.append('offset', '0');
        const res = await fetch(apiUrl.toString(), {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          }
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data.items) ? data.items : [];
          ownerRezMapped = items.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: p.property_type,
            property_type: p.property_type,
            bathrooms: Number(p.bathrooms || p.bathrooms_full || 0) || 0,
            bedrooms: Number(p.bedrooms || 0) || 0,
            capacity: (p.max_guests || 0).toString(),
            max_guests: p.max_guests || 0,
            price: '0',
            status: p.active ? 'Active' : 'Pending',
            active: !!p.active,
            listingDate: null,
            address: p.address || null,
            owner: null,
          }));
        } else {
          // Non-fatal; proceed with local only
          const errorText = await res.text();
          console.error('OwnerRez properties fetch failed:', res.status, errorText);
        }
      } catch (err) {
        console.error('OwnerRez properties fetch error:', err);
      }
    }

    // Merge both lists
    let merged: UnifiedProperty[] = [...localMapped, ...ownerRezMapped];

    // Apply status filter
    if (statusFilter === 'pending') {
      merged = merged.filter(p => (p.status || (p.active ? 'Active' : 'Pending')) === 'Pending');
    } else if (statusFilter === 'active') {
      merged = merged.filter(p => (p.status || (p.active ? 'Active' : 'Pending')) === 'Active');
    } // 'all' returns everything

    // Apply default sorting depending on filter
    if (statusFilter === 'pending') {
      merged.sort((a, b) => {
        const aDate = a.listingDate ? Date.parse(a.listingDate) : 0;
        const bDate = b.listingDate ? Date.parse(b.listingDate) : 0;
        if (bDate !== aDate) return bDate - aDate; // recent first
        return String(a.name || '').localeCompare(String(b.name || ''));
      });
    } else if (statusFilter === 'active') {
      merged.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    } else {
      // all: active first, then others; within group by recent listingDate then name
      const statusRank = (p: UnifiedProperty) => (p.active ? 0 : 1);
      merged.sort((a, b) => {
        const rankDiff = statusRank(a) - statusRank(b);
        if (rankDiff !== 0) return rankDiff;
        const aDate = a.listingDate ? Date.parse(a.listingDate) : 0;
        const bDate = b.listingDate ? Date.parse(b.listingDate) : 0;
        if (bDate !== aDate) return bDate - aDate;
        return String(a.name || '').localeCompare(String(b.name || ''));
      });
    }

    const total = merged.length;

    // Paginate
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageItems = merged.slice(startIdx, endIdx);

    return NextResponse.json({
      success: true,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      properties: pageItems,
      userRole: authResult.user.role,
      canManageAllProperties: true
    });
  } catch (error) {
    console.error('Superadmin properties API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Failed to fetch superadmin properties', details: errorMessage },
      { status: 500 }
    );
  }
}


