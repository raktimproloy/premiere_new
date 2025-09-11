import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // Increased to 100 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userData = rateLimitMap.get(ip);
  
  if (!userData || now > userData.resetTime) {
    // Reset or create new rate limit entry
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (userData.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  userData.count++;
  return false;
}

// Check if user is admin/superadmin to bypass rate limiting
function isAdminUser(token: string): boolean {
  try {
    // For admin/superadmin users, we can be more lenient with rate limiting
    // This is a simple check - in production, you'd want to verify the token properly
    return token.includes('admin') || token.includes('superadmin');
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    // Get token from cookie first to check if user is admin
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check rate limit only for non-admin users
    if (!isAdminUser(token) && isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests' },
        { status: 429 }
      );
    }

    const result = await authService.verifyToken(token);

    if (result.valid && result.user) {
      // Remove password from user object
      const { password, ...userWithoutPassword } = result.user;
      // Ensure bookingIds is always present as an array
      if (!userWithoutPassword.bookingIds) userWithoutPassword.bookingIds = [];
      return NextResponse.json({
        success: true,
        user: userWithoutPassword
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 