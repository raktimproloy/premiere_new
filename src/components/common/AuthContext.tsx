'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { getBookingPath, clearBookingPath } from '@/utils/cookies';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  profileImage?: string;
  role: 'user' | 'admin' | 'superadmin';
  // Admin-specific fields
  contactPerson?: string;
  mailingAddress?: string;
  desiredService?: string;
  // Business fields
  proofOfOwnership?: string;
  businessLicenseNumber?: string;
  taxId?: string;
  bankAccountInfo?: string;
  taxForm?: string;
  createdAt: Date;
  emailVerified: boolean;
  lastLogin?: Date;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (userData: User, token: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  role: 'user' | 'admin' | 'superadmin' | null;
  testRedirect: () => void;
}

interface SignupData {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  password: string;
  profileImage?: string;
  role: string;
  contactPerson?: string;
  mailingAddress?: string;
  desiredService?: string;
  // Business fields
  proofOfOwnership?: string;
  businessLicenseNumber?: string;
  taxId?: string;
  bankAccountInfo?: string;
  taxForm?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy users for admin/superadmin (keeping existing functionality)
const DUMMY_USERS = [
  { email: 'admin@example.com', password: 'password123', role: 'admin' },
  { email: 'superadmin@example.com', password: 'password123', role: 'superadmin' },
];

// Add a type guard for role
function isValidRole(role: string | null): role is 'user' | 'admin' | 'superadmin' {
  return role === 'user' || role === 'admin' || role === 'superadmin';
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | 'superadmin' | null>(null);
  const router = useRouter();
  
  // Add refs to prevent multiple simultaneous calls
  const authCheckInProgress = useRef(false);
  const lastAuthCheck = useRef<number>(0);
  const signupInProgress = useRef(false);
  const AUTH_CHECK_INTERVAL = 30000; // 30 seconds

  // Check authentication status on mount
  useEffect(() => {
    // Add a small delay to allow any ongoing auth operations to complete
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const checkAuthStatus = async () => {
    console.log('checkAuthStatus called'); // Debug log
    
    // Prevent multiple simultaneous calls
    if (authCheckInProgress.current) {
      console.log('Auth check already in progress, skipping'); // Debug log
      return;
    }

    // Don't check auth if signup is in progress
    if (signupInProgress.current) {
      console.log('Signup in progress, skipping auth check'); // Debug log
      return;
    }

    // Check if we've recently checked auth status
    const now = Date.now();
    if (now - lastAuthCheck.current < AUTH_CHECK_INTERVAL) {
      console.log('Auth check too recent, skipping'); // Debug log
      setLoading(false);
      return;
    }

    try {
      authCheckInProgress.current = true;
      setLoading(true);
      lastAuthCheck.current = now;
      
      console.log('Checking server-side authentication...'); // Debug log
      
      // Check server-side authentication (for regular users with HTTP-only cookies)
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      console.log('Auth check response:', data); // Debug log

      if (data.success && data.user) {
        console.log('User authenticated via server'); // Debug log
        setUser(data.user);
        setIsAuthenticated(true);
        setRole(data.user.role);
        setLoading(false);
        return;
      }

      // If server-side auth fails, check localStorage for dummy admin/superadmin users only
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // Only allow dummy users (admin/superadmin) from localStorage
          if (userData.role === 'admin' || userData.role === 'superadmin') {
            console.log('User authenticated via localStorage (dummy user)'); // Debug log
            setUser(userData);
            setIsAuthenticated(true);
            setRole(userData.role);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('user');
        }
      }

      console.log('No authentication found'); // Debug log
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error('Auth status check error:', error);
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
      authCheckInProgress.current = false;
    }
  };

  const handleSuccessfulAuth = (userData: User) => {
    console.log('handleSuccessfulAuth called with:', userData); // Debug log
    
    setUser(userData);
    setIsAuthenticated(true);
    setRole(userData.role);
    setLoading(false);

    console.log('Auth state updated, redirecting in 500ms...'); // Debug log

    // Add a small delay to ensure state updates are processed
    setTimeout(() => {
      console.log('Executing redirect logic...'); // Debug log
      
      // Check for booking path redirect
      const bookingPath = getBookingPath();
      console.log('Booking path found:', bookingPath); // Debug log
      
      if (bookingPath && userData.role === 'user') {
        // Clear the booking path cookie
        clearBookingPath();
        // Redirect to the saved booking path with searchId if available
        const redirectPath = bookingPath.searchId 
          ? `${bookingPath.path}?id=${bookingPath.searchId}`
          : bookingPath.path;
        console.log('Redirecting to booking path:', redirectPath); // Debug log
        try {
          router.push(redirectPath);
        } catch (error) {
          window.location.href = redirectPath;
        }
      } else {
        console.log('No booking path found or user is not a regular user, using default redirect'); // Debug log
        // Default redirect based on role
        let redirectPath = '/';
        if (userData.role === 'admin') {
          redirectPath = '/admin/dashboard';
        } else if (userData.role === 'superadmin') {
          redirectPath = '/superadmin/dashboard';
        } else {
          redirectPath = '/';
        }
        console.log('Redirecting to default path:', redirectPath); // Debug log
        try {
          router.push(redirectPath);
        } catch (error) {
          window.location.href = redirectPath;
        }
      }
    }, 500); // Increased delay to ensure state updates
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if it's a dummy admin/superadmin user
      const dummyUser = DUMMY_USERS.find(u => u.email === email && u.password === password);
      
      if (dummyUser) {
        // Handle dummy admin/superadmin login
        const userData: User = {
          _id: 'dummy-' + Date.now(),
          fullName: email.split('@')[0],
          email: email,
          phone: '',
          dob: '',
          role: dummyUser.role as 'admin' | 'user' | 'superadmin',
          createdAt: new Date(),
          emailVerified: true
        };
        
        handleSuccessfulAuth(userData);
        // Store dummy user in localStorage (no token needed for dummy users)
        localStorage.setItem('user', JSON.stringify(userData));
        
        return true;
      }

      // Handle regular user login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        handleSuccessfulAuth(data.user);
        return true;
      } else {
        setError(data.message || 'Login failed');
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
      setLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async (userData: User, token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      
      // For Google users, we don't need to store token in localStorage
      // The token is handled by NextAuth and stored in cookies
      handleSuccessfulAuth(userData);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google authentication failed');
      setLoading(false);
      return false;
    }
  };

  const signup = async (userData: SignupData) => {
    setLoading(true);
    setError(null);
    signupInProgress.current = true; // Set signup in progress flag
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('Signup response:', data); // Debug log

      if (response.ok && data.success) {
        // Ensure the user data has the required fields for AuthContext
        const userForAuth: User = {
          _id: data.user._id,
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone,
          dob: data.user.dob,
          profileImage: data.user.profileImage,
          role: data.user.role,
          createdAt: data.user.createdAt,
          emailVerified: data.user.emailVerified,
          lastLogin: data.user.lastLogin
        };
        
        console.log('User data for auth:', userForAuth); // Debug log
        
        // Add a small delay to ensure the cookie is properly set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        handleSuccessfulAuth(userForAuth);
        signupInProgress.current = false; // Clear signup in progress flag
        return true;
      } else {
        setError(data.message || 'Signup failed');
        setLoading(false);
        signupInProgress.current = false; // Clear signup in progress flag
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please try again.');
      setLoading(false);
      signupInProgress.current = false; // Clear signup in progress flag
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    // Clear NextAuth session (Google session) - using the direct function as requested
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error('NextAuth signOut error:', error);
    }
    
    // Clear local state and localStorage
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
    localStorage.removeItem('user');
    
    // Reset auth check timestamp to allow immediate re-check if needed
    lastAuthCheck.current = 0;
    
    // Redirect to home page
    router.push('/');
  };

  // Test function for debugging redirect
  const testRedirect = () => {
    router.push('/');
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isAuthenticated, 
    user,
    login, 
    loginWithGoogle,
    signup,
    logout, 
    loading, 
    error, 
    role,
    testRedirect
  }), [isAuthenticated, user, loading, error, role]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 