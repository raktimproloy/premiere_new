'use client'

// components/SignUpForm.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/datepicker.css";
import AuthLayout from '../layout/AuthLayout';
import { useAuth } from '@/components/common/AuthContext';

// import Logo from "/images/logo.png"
const Logo = "/images/logo.png"
const SideImage = "/images/signup.png"

// Type definitions for form data
type FormData = {
  fullName: string;
  email: string;
  role: string;
  phone: string;
  dob: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
  // Admin-specific fields
  contactPerson: string;
  mailingAddress: string;
  desiredService: string;
  // New business fields
  proofOfOwnership: string;
  businessLicenseNumber: string;
  taxId: string;
  bankAccountInfo: string;
  taxForm: string;
};

// Type definitions for form errors
type FormErrors = {
  fullName?: string;
  role?: string;
  email?: string;
  phone?: string;
  dob?: string;
  password?: string;  
  confirmPassword?: string;
  // Admin-specific field errors
  contactPerson?: string;
  mailingAddress?: string;
  desiredService?: string;
};

const SignUpForm = () => {
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    role: 'user',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    // Admin-specific fields
    contactPerson: '',
    mailingAddress: '',
    desiredService: '',
    // New business fields
    proofOfOwnership: '',
    businessLicenseNumber: '',
    taxId: '',
    bankAccountInfo: '',
    taxForm: '',
  });

  // State for form errors
  const [errors, setErrors] = useState<FormErrors>({});

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auth context
  const { signup, loading, error } = useAuth();

  // Debug initial state
  React.useEffect(() => {
    console.log('Initial formData.role:', formData.role);
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle date changes
  const handleDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      dob: date ? date.toISOString().split('T')[0] : '',
    });

    // Clear error if any
    if (errors.dob) {
      setErrors({
        ...errors,
        dob: undefined,
      });
    }
  };

  // Validate form function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Role validation
    if (!formData.role || formData.role === '') {
      newErrors.role = 'Please select your role';
    }

    // Admin-specific validations
    if (formData.role === 'admin') {
      // Mailing address validation (required for admin)
      if (!formData.mailingAddress.trim()) {
        newErrors.mailingAddress = 'Mailing address is required for property management';
      }
      
      // Desired service validation (required for admin)
      if (!formData.desiredService) {
        newErrors.desiredService = 'Please select a desired service';
      }
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }
    
    // Date of birth validation
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      const minAgeDate = new Date(
        today.getFullYear() - 13,
        today.getMonth(),
        today.getDate()
      );
      
      if (dobDate > minAgeDate) {
        newErrors.dob = 'You must be at least 13 years old';
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Form data before signup:', formData);
      console.log('Role being sent:', formData.role);
      
      const success = await signup({
        fullName: formData.fullName,
        role: formData.role,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        password: formData.password,
        // Admin-specific fields
        contactPerson: formData.contactPerson,
        mailingAddress: formData.mailingAddress,
        desiredService: formData.desiredService,
        // New business fields
        proofOfOwnership: formData.proofOfOwnership,
        businessLicenseNumber: formData.businessLicenseNumber,
        taxId: formData.taxId,
        bankAccountInfo: formData.bankAccountInfo,
        taxForm: formData.taxForm
      });
      
      console.log('Signup result:', success); // Debug log
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <AuthLayout headingName='signup' title='Create an account'>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            I want to... *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2C11.1 2 12 2.9 12 4C12 5.1 11.1 6 10 6C8.9 6 8 5.1 8 4C8 2.9 8.9 2 10 2ZM10 18C11.1 18 12 17.1 12 16C12 14.9 11.1 14 10 14C8.9 14 8 14.9 8 16C8 17.1 8.9 18 10 18ZM10 10C11.1 10 12 9.1 12 8C12 6.9 11.1 6 10 6C8.9 6 8 6.9 8 8C8 9.1 8.9 10 10 10Z" fill="#4E5258"/>
              </svg>
            </div>
            <select
              key="role-select"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition appearance-none bg-white ${
                errors.role 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              }`}
              required
            >
              <option value="admin">Manage My Property (Admin)</option>
              <option value="user">Book A Property (User)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Choose whether you want to manage properties or book them as a guest
          </p>
        </div>

        <div className='grid md:grid-cols-2 grid-cols-1 gap-2 md:gap-4 mb-4'>
          {/* Full Name */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5007 10C12.8018 10 14.6673 8.13454 14.6673 5.83335C14.6673 3.53217 12.8018 1.66669 10.5007 1.66669C8.19946 1.66669 6.33398 3.53217 6.33398 5.83335C6.33398 8.13454 8.19946 10 10.5007 10Z" stroke="#4E5258" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.6585 18.3333C17.6585 15.1083 14.4501 12.5 10.5001 12.5C6.55013 12.5 3.34180 15.1083 3.34180 18.3333" stroke="#4E5258" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                  errors.fullName 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
                placeholder="Full name"
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>
          
          {/* Email */}
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
        </div>

        <div className='grid md:grid-cols-2 grid-cols-1 gap-2 md:gap-4 mb-4'>
          {/* Phone Number */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg width="13" height="20" viewBox="0 0 13 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 1H2.75C2.15326 1 1.58097 1.20319 1.15901 1.56487C0.737053 1.92654 0.5 2.41708 0.5 2.92857V17.0714C0.5 17.5829 0.737053 18.0735 1.15901 18.4351C1.58097 18.7968 2.15326 19 2.75 19H10.25C10.8467 19 11.419 18.7968 11.841 18.4351C12.2629 18.0735 12.5 17.5829 12.5 17.0714V2.92857C12.5 2.41708 12.2629 1.92654 11.841 1.56487C11.419 1.20319 10.8467 1 10.25 1H8M5 1V2.28571H8V1M5 1H8M5 17.0714H8" stroke="#4E5258" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                  errors.phone 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
                placeholder="Phone number"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
          
          {/* Date of Birth */}
          <div>
            <div className="relative">
              <DatePicker
                selected={formData.dob ? new Date(formData.dob) : null}
                onChange={handleDateChange}
                placeholderText="Select your date of birth"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                  errors.dob 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
                dateFormat="MMMM dd, yyyy"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                allowSameDay={false}
                maxDate={new Date()}
                minDate={new Date('1900-01-01')}
                isClearable={false}
                showPopperArrow={false}
                popperPlacement="bottom-start"
                autoComplete="off"
                readOnly={false}
                openToDate={formData.dob ? new Date(formData.dob) : new Date('1990-01-01')}
                dayClassName={date => {
                  const today = new Date();
                  const selectedDate = new Date(date);
                  if (selectedDate.toDateString() === today.toDateString()) {
                    return 'react-datepicker__day--today';
                  }
                  return '';
                }}
              />
            </div>
            {errors.dob && (
              <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
            )}
          </div>
        </div>
        
        {/* Password */}
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
        
        {/* Confirm Password */}
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
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                errors.confirmPassword 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
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
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
                {/* Admin-specific fields */}
                {formData.role === 'admin' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Management Details</h3>
            
            {/* Contact Person */}
            <div>
              {/* <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person <span className="text-gray-500">(Optional)</span>
              </label> */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5007 10C12.8018 10 14.6673 8.13454 14.6673 5.83335C14.6673 3.53217 12.8018 1.66669 10.5007 1.66669C8.19946 1.66669 6.33398 3.53217 6.33398 5.83335C6.33398 8.13454 8.19946 10 10.5007 10Z" stroke="#4E5258" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17.6585 18.3333C17.6585 15.1083 14.4501 12.5 10.5001 12.5C6.55013 12.5 3.34180 15.1083 3.34180 18.3333" stroke="#4E5258" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
                    errors.contactPerson 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                  placeholder="Contact person name (Optional)"
                />
              </div>
              {errors.contactPerson && (
                <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>
              )}
            </div>

            {/* Mailing Address */}
            <div>
              {/* <label htmlFor="mailingAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Mailing Address
              </label> */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2C11.1 2 12 2.9 12 4C12 5.1 11.1 6 10 6C8.9 6 8 5.1 8 4C8 2.9 8.9 2 10 2ZM10 18C11.1 18 12 17.1 12 16C12 14.9 11.1 14 10 14C8.9 14 8 14.9 8 16C8 17.1 8.9 18 10 18ZM10 10C11.1 10 12 9.1 12 8C12 6.9 11.1 6 10 6C8.9 6 8 6.9 8 8C8 9.1 8.9 10 10 10Z" fill="#4E5258"/>
                  </svg>
                </div>
                <input
                type="email"
                  id="mailingAddress"
                  name="mailingAddress"
                  value={formData.mailingAddress}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition resize-none ${
                    errors.mailingAddress 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                  placeholder="Enter your complete mailing address"
                  required
                />
              </div>
              {errors.mailingAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.mailingAddress}</p>
              )}
            </div>

            {/* Desired Service */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desired Service
              </label>
              <div className="space-y-3">
                {/* Full Management */}
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="full-management"
                    name="desiredService"
                    value="full-management"
                    checked={formData.desiredService === 'full-management'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    required
                  />
                  <label htmlFor="full-management" className="ml-3 flex items-center gap-2 text-sm text-gray-700">
                    <span>Full Management</span>
                    <div className="relative group">
                      <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                        Complete property management including marketing, bookings, maintenance, and guest communication
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Stage and Manage */}
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="stage-and-manage"
                    name="desiredService"
                    value="stage-and-manage"
                    checked={formData.desiredService === 'stage-and-manage'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    required
                  />
                  <label htmlFor="stage-and-manage" className="ml-3 flex items-center gap-2 text-sm text-gray-700">
                    <span>Stage and Manage</span>
                    <div className="relative group">
                      <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                        Property staging for optimal presentation and ongoing management services
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Custom Manage */}
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="custom-manage"
                    name="desiredService"
                    value="custom-manage"
                    checked={formData.desiredService === 'custom-manage'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    required
                  />
                  <label htmlFor="custom-manage" className="ml-3 flex items-center gap-2 text-sm text-gray-700">
                    <span>Custom Manage</span>
                    <div className="relative group">
                      <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                        Tailored management services based on your specific needs and requirements
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              {errors.desiredService && (
                <p className="mt-1 text-sm text-red-600">{errors.desiredService}</p>
              )}
            </div>
          </div>
        )}
        {/* Remember Me */}
        <div className="flex items-center">
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
        
        {/* Sign Up Button */}
        <button
          type="submit"
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-black bg-[#F7B730] hover:bg-[#e6a820] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
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



        {/* Error Message */}
        {error && (
          <p className="mt-2 text-center text-sm text-red-600">{error}</p>
        )}
      </form>
    </AuthLayout>
  );
};

export default SignUpForm;