import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/about', '/services', '/faqs', '/contact'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/'));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get JWT token from cookie
  const token = request.cookies.get('authToken')?.value;
  setTimeout(() => {
    // Admin routes - allow admin and superadmin
    if (pathname.startsWith('/admin/')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
  
      try {
        const decoded = verifyToken(token);
        if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  
    // Superadmin routes - only allow superadmin
    if (pathname.startsWith('/superadmin/')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
  
      try {
        const decoded = verifyToken(token);
        if (decoded.role !== 'superadmin') {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  
    // User routes (like profile, bookings, etc.) - allow all authenticated users
    if (pathname.startsWith('/profile/') || pathname.startsWith('/bookings/')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
  
      try {
        const decoded = verifyToken(token);
        // Allow all authenticated users (user, admin, superadmin) to access profile and bookings
      } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }, 1000);

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 