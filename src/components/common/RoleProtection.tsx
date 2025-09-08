import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

interface RoleProtectionProps {
  requiredRole: 'admin' | 'superadmin';
  children: ReactNode;
}

const RoleProtection: React.FC<RoleProtectionProps> = ({ requiredRole, children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || role !== requiredRole) {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, role, loading, requiredRole, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || role !== requiredRole) {
    return null; // Or a spinner, or a Not Authorized message
  }

  return <>{children}</>;
};

export default RoleProtection; 