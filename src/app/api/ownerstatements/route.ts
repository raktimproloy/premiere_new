import { NextResponse } from 'next/server';

interface OwnerStatement {
  Key: string;
  IsPMv2: boolean;
  OwnerId: number;
  StatementDate: string;
  w_StatementFromDate: string;
  IncludedBookings: number;
  IncludedBookingsProrate: boolean;
  IncludedExpenses: number;
  IncludeZeroBookings: boolean;
  IncludeAllExpensesForBookings: boolean;
  PreferredView: number;
  PreferredViewShowGuestName: boolean;
  PreferredViewGroupByProperty: boolean;
  Bookings: number;
  Expenses: number;
  Total: number;
  Paid: number;
  Unpaid: number;
  Status: number;
  Note: string;
  FileId: number;
  UserId: number;
  UpdatedUtc: string;
  UpdatedUserId: number;
  CreatedUtc: string;
  CreatedUserId: number;
  Id: number;
}

function getLastDayOfCurrentMonth(): string {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const day = String(lastDay.getDate()).padStart(2, '0');
  return day;
}

function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '4');

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page number. Must be a positive integer' },
        { status: 400 }
      );
    }
    
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: 'Invalid page size. Must be between 1 and 100' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * pageSize;
    const username = process.env.NEXT_PUBLIC_OWNERREZ_USERNAME || "info@premierestaysmiami.com";
    const password = process.env.NEXT_PUBLIC_OWNERREZ_ACCESS_TOKEN || "pt_1xj6mw0db483n2arxln6rg2zd8xockw2";
    const baseUrl = process.env.NEXT_PUBLIC_OWNERREZ_API_BASE || "https://app.ownerrez.com/api";

    if (!username || !password || !baseUrl) {
      throw new Error('API credentials not configured');
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const headers = { 
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    };

    // First fetch only unpaid statements for payout calculation
    let upcomingPayout = 0;
    try {
      const unpaidUrl = new URL(`${baseUrl}/ownerstatements`);
      unpaidUrl.searchParams.append('UnpaidGreaterThan', '0');
      unpaidUrl.searchParams.append('limit', '1000'); // Fetch all unpaid in one request
      
      const unpaidRes = await fetch(unpaidUrl.toString(), { headers });
      
      if (unpaidRes.ok) {
        const unpaidStatements: OwnerStatement[] = await unpaidRes.json();
        upcomingPayout = unpaidStatements.reduce(
          (sum, statement) => sum + (statement.Unpaid || 0), 
          0
        );
      }
    } catch (error) {
      console.error('Error fetching unpaid statements:', error);
      // Continue with payout amount as 0 if there's an error
    }

    // Create current date object once for consistency
    const currentDate = new Date();
    const payoutDate = getLastDayOfCurrentMonth();
    const monthName = getMonthName(currentDate.getMonth());

    // Now fetch paginated owner statements
    const statementsUrl = new URL(`${baseUrl}/ownerstatements`);
    statementsUrl.searchParams.append('offset', offset.toString());
    statementsUrl.searchParams.append('limit', pageSize.toString());
    
    const res = await fetch(statementsUrl.toString(), { headers });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `OwnerRez API error: ${res.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage += ` - ${errorJson.message || 'Unknown error'}`;
      } catch {
        errorMessage += ` - ${errorText || 'Unknown error'}`;
      }
      
      throw new Error(errorMessage);
    }

    const statements: OwnerStatement[] = await res.json();
    const totalCount = parseInt(res.headers.get('X-Total-Count') || '0') || statements.length;
    
    // Add download URL to each statement
    const statementsWithDownload = statements.map(statement => ({
      ...statement,
      downloadUrl: `${baseUrl}/ownerstatements/download?key=${statement.Key}`
    }));



    return NextResponse.json({
      total: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      statements: statementsWithDownload,
      payout: {
        amount: upcomingPayout,
        date: payoutDate,
        monthName: monthName,
        year: currentDate.getFullYear()
      }
    });
  } catch (error) {
    console.error('Owner statements error:', error);
    
    const errorMessage = error instanceof Error ? 
      error.message : 
      'Unknown error occurred';
      
    return NextResponse.json(
      { 
        error: 'Failed to fetch owner statements',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}