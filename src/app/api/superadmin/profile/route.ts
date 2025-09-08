import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // Only allow superadmin (and optionally admin) to access this endpoint
    if (result.user.role !== 'superadmin') {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    const { password, ...userWithoutPassword } = result.user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Superadmin profile GET error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


