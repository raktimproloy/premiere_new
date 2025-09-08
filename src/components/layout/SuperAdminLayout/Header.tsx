'use client'
import { useAuth } from '@/components/common/AuthContext';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import { FiMenu, FiX, FiMessageCircle, FiBell, FiChevronDown, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const profileImage = "/images/profile.jpg"; // Default profile image
const defaultImage = '/images/default_profile.png';
const searchIcon = "/images/icons/search.svg";
const notificationIcon = "/images/icons/notification.svg";
const chatIcon = "/images/icons/chat.svg";

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

// Copy of nav items from Sidebar for title lookup
const navItems = [
  { title: 'Dashboard', link: '/superadmin/dashboard' },
  { title: 'Manage Property', link: '/superadmin/properties' },
  { title: 'Bookings', link: '/superadmin/bookings' },
  { title: 'Calendar', link: '/superadmin/calendar' },
  { title: 'Reviews', link: '/superadmin/reviews' },
  { title: 'Users', link: '/superadmin/users' },
  { title: 'Profile', link: '/superadmin/profile' },
  { title: 'Settings', link: '/superadmin/settings' },
  { title: 'Help', link: '/superadmin/help' },
];

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userData: UserData;
  currentPath: string;
}

export default function Header({ sidebarOpen, setSidebarOpen, userData, currentPath }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Format the user's full name safely
  const formatFullName = () => {
    if (!userData) return 'User';
    return userData.fullName || 'User';
  };

  // Format the email address safely
  const formatEmail = () => {
    if (!userData) return '';
    return userData.email || '';
  };

  // Find active nav title
  const activeNav = navItems.find(item => currentPath.startsWith(item.link));
  const activeTitle = activeNav ? activeNav.title : '';

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSearchDropdownOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="bg-white shadow-sm z-10 w-full">
        <div className="flex items-center justify-between p-4 gap-2 w-full">
          {/* Sidebar toggle buttons for mobile */}
          {!sidebarOpen && (
            <button
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <FiMenu size={24} />
            </button>
          )}
          {sidebarOpen && (
            <button
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <FiX size={24} />
            </button>
          )}

          {/* Left: Active nav title */}
          <div className="flex items-center min-w-[150px] max-w-xs font-semibold text-gray-900 text-base md:text-lg whitespace-nowrap">
            <button
              onClick={() => router.push('/superadmin/dashboard')}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {/* <FiX className="h-5 w-5 text-gray-500" /> */}
              <img src="/images/icons/back.svg" alt="close" className="h-5 w-5" />
            </button>
            {activeTitle}
          </div>

          {/* Center: Search input or icon */}
          {!isMobile ? (
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-md relative">
                <Image 
                  src={searchIcon} 
                  alt="Search" 
                  width={20} 
                  height={20} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
                <input
                  type="text"
                  placeholder="Search here..."
                  className="w-full pl-10 pr-4 py-2 bg-[#F6F6F6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#F7B730] focus:border-transparent"
                />
              </div>
            </div>
          ) : null}

          {/* Right: Profile */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setSearchDropdownOpen(!searchDropdownOpen)}
                aria-label="Toggle search input"
                className="text-gray-600 hover:text-gray-900"
              >
                <Image src={searchIcon} alt="Search" width={24} height={24} />
              </button>
            )}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center cursor-pointer gap-3 focus:outline-none"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <Image
                  src={userData.profileImage || defaultImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  width={40}
                  height={40}
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-gray-900 font-semibold truncate max-w-[160px]">
                    {formatFullName()}
                  </span>
                  <span className="text-gray-500 text-sm truncate max-w-[160px]">
                    {formatEmail()}
                  </span>
                </div>
                <FiChevronDown 
                  className={`text-gray-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} 
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formatFullName()}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {formatEmail()}
                    </p>
                  </div>
                  <nav className="flex flex-col py-1">
                    <Link
                      href="/superadmin/profile"
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiUser className="text-gray-500" /> 
                      Profile
                    </Link>
                    <Link
                      href="/superadmin/settings"
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiSettings className="text-gray-500" /> 
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <FiLogOut className="text-red-500" /> 
                      Logout
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Search input dropdown for mobile */}
      {isMobile && searchDropdownOpen && (
        <div className="bg-white shadow-sm p-4 border-t border-gray-200 z-10">
          <div className="max-w-md mx-auto relative">
            <Image 
              src={searchIcon} 
              alt="Search" 
              width={20} 
              height={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              placeholder="Search here..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F7B730] focus:border-transparent"
              autoFocus
            />
          </div>
        </div>
      )}
    </>
  );
}