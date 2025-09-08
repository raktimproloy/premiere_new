'use client'
import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { saveBookingPath } from '@/utils/cookies';

interface ProtectedRouteProps {
  children: React.ReactNode;
  propertyId?: string;
  searchId?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, propertyId, searchId }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Save current path for redirect after login
      if (propertyId) {
        saveBookingPath({
          path: `/book-now/checkout/${propertyId}`,
          propertyId: propertyId,
          searchId: searchId
        });
      }
      router.push('/login');
    }
  }, [isAuthenticated, loading, router, propertyId, searchId]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;