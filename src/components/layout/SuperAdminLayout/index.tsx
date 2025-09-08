// app/superadmin/layout.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/common/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from "./Header";
import RoleProtection from '@/components/common/RoleProtection';

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  profileImage?: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: Date;
  emailVerified: boolean;
  lastLogin?: Date;
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, role, loading } = useAuth();
  const router = useRouter();
  const currentPath = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check authentication and role
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      // Check if user has superadmin role
      if (role !== 'superadmin') {
        router.replace('/');
        return;
      }
    }
  }, [isAuthenticated, role, loading, router]);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Close sidebar by default on mobile
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show loading while checking authentication
  if (loading || !isAuthenticated || role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F7B730]"></div>
      </div>
    );
  }

  // Convert auth user to UserData format for Header
  const userData: UserData = user ? {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    dob: user.dob,
    profileImage: user.profileImage,
    role: user.role,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified,
    lastLogin: user.lastLogin
  } : {
    _id: '',
    fullName: 'Super Admin User',
    email: 'superadmin@example.com',
    phone: '',
    dob: '',
    role: 'superadmin',
    createdAt: new Date(),
    emailVerified: true
  };

  return (
    <RoleProtection requiredRole="superadmin">
      <div className="flex h-screen bg-gray-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar with currentPath passed */}
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          currentPath={currentPath}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header 
            setSidebarOpen={setSidebarOpen} 
            sidebarOpen={sidebarOpen} 
            userData={userData}
            currentPath={currentPath}
          />

          {/* Content area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </RoleProtection>
  );
}