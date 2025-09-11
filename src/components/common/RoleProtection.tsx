import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

interface RoleProtectionProps {
  requiredRole: 'admin' | 'superadmin';
  children: ReactNode;
}

const RoleProtection: React.FC<RoleProtectionProps> = ({ requiredRole, children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect if we're not loading and not already redirecting
    if (!loading && !redirecting) {
      if (!isAuthenticated || role !== requiredRole) {
        console.log(`RoleProtection: Redirecting to login. isAuthenticated: ${isAuthenticated}, role: ${role}, requiredRole: ${requiredRole}`);
        setRedirecting(true);
        router.replace('/login');
      }
    }
  }, [isAuthenticated, role, loading, requiredRole, router, redirecting]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F7B730]"></div>
      </div>
    );
  }

  // Show loading spinner while redirecting
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F7B730]"></div>
      </div>
    );
  }

  // If not authenticated or wrong role, don't render children
  if (!isAuthenticated || role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default RoleProtection; 