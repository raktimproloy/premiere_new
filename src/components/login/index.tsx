'use client'
import React, { useState } from 'react'
import AuthLayout from "@/components/layout/AuthLayout"
import Link from 'next/link';
import { useAuth } from "@/components/common/AuthContext";


type FormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [googleAccountError, setGoogleAccountError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, loading, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
    
    // Clear Google account error when user types
    if (googleAccountError) {
      setGoogleAccountError(null);
    }
    
    // Clear local error when user types
    if (localError) {
      setLocalError(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleAccountError(null); // Clear any previous Google account error
    setLocalError(null); // Clear any previous local error
    
    if (validateForm()) {
      try {
        // Use the AuthContext login function directly
        const success = await login(formData.email, formData.password);
        
        if (!success) {
          // Error is already set in the AuthContext
          console.log('Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        setLocalError('Network error. Please try again.');
      }
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <AuthLayout headingName='login' title={`Let's sign you in`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.166 17.0834H5.83268C3.33268 17.0834 1.66602 15.8334 1.66602 12.9167V7.08335C1.66602 4.16669 3.33268 2.91669 5.83268 2.91669H14.166C16.666 2.91669 18.3327 4.16669 18.3327 7.08335V12.9167C18.3327 15.8334 16.666 17.0834 14.166 17.0834Z" stroke="#4E5258" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.1673 7.5L11.559 9.58333C10.7006 10.2667 9.29231 10.2667 8.43398 9.58333L5.83398 7.5" stroke="#4E5258" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              }`}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        {/* Password Field */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 8.95866C15.1583 8.95866 14.875 8.67533 14.875 8.33366V6.66699C14.875 4.04199 14.1333 2.29199 10.5 2.29199C6.86667 2.29199 6.125 4.04199 6.125 6.66699V8.33366C6.125 8.67533 5.84167 8.95866 5.5 8.95866C5.15833 8.95866 4.875 8.67533 4.875 8.33366V6.66699C4.875 4.25033 5.45833 1.04199 10.5 1.04199C15.5417 1.04199 16.125 4.25033 16.125 6.66699V8.33366C16.125 8.67533 15.8417 8.95866 15.5 8.95866Z" fill="#4E5258"/>
                <path d="M10.5013 16.0417C9.00964 16.0417 7.79297 14.825 7.79297 13.3333C7.79297 11.8417 9.00964 10.625 10.5013 10.625C11.993 10.625 13.2096 11.8417 13.2096 13.3333C13.2096 14.825 11.993 16.0417 10.5013 16.0417ZM10.5013 11.875C9.7013 11.875 9.04297 12.5333 9.04297 13.3333C9.04297 14.1333 9.7013 14.7917 10.5013 14.7917C11.3013 14.7917 11.9596 14.1333 11.9596 13.3333C11.9596 12.5333 11.3013 11.875 10.5013 11.875Z" fill="#4E5258"/>
                <path d="M14.666 18.958H6.33268C2.65768 18.958 1.54102 17.8413 1.54102 14.1663V12.4997C1.54102 8.82467 2.65768 7.70801 6.33268 7.70801H14.666C18.341 7.70801 19.4577 8.82467 19.4577 12.4997V14.1663C19.4577 17.8413 18.341 18.958 14.666 18.958ZM6.33268 8.95801C3.34935 8.95801 2.79102 9.52467 2.79102 12.4997V14.1663C2.79102 17.1413 3.34935 17.708 6.33268 17.708H14.666C17.6493 17.708 18.2077 17.1413 18.2077 14.1663V12.4997C18.2077 9.52467 17.6493 8.95801 14.666 8.95801H6.33268Z" fill="#4E5258"/>
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                errors.password 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
        
        {/* Remember Me and Forgot Password */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
              Remember Me
            </label>
          </div>
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
            Forgot Password?
          </Link>
        </div>
        
        {/* Login Button */}
        <button
          type="submit"
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-black bg-[#F7B730] hover:bg-[#e6a820] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
          {!loading && (
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Divider */}
        {/* <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div> */}



        {/* Error Messages */}
        {googleAccountError && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">{googleAccountError}</p>
              </div>
            </div>
          </div>
        )}

        {(localError || error) && !googleAccountError && (
          <p className="mt-2 text-center text-sm text-red-600">{localError || error}</p>
        )}
      </form>
    </AuthLayout>
  )
}