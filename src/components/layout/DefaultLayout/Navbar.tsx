// components/Navbar.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FaArrowRight, FaCog } from "react-icons/fa";
import { useAuth } from '@/components/common/AuthContext';
import { signOut } from 'next-auth/react';
import { FiChevronDown, FiUser, FiSettings, FiLogOut, FiGrid } from 'react-icons/fi';
import { useRef, useEffect } from 'react';

const profileImage = "/images/profile.jpg";

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const Logo = '/images/logo.png';
  const defaultImage = '/images/default_profile.png';
  
  // Single useAuth call to get all needed values
  const { isAuthenticated, logout, loading, user: authUser, role } = useAuth();
  console.log(authUser)
  // Use auth user data if available, otherwise use dummy data
  const user = authUser ? {
    first_name: authUser.fullName.split(' ')[0] || 'User',
    last_name: authUser.fullName.split(' ').slice(1).join(' ') || '',
    email_address: authUser.email,
  } : {
    first_name: 'Zahidul',
    last_name: 'Islam',
    email_address: 'zahidulislam@gmail.com',
  };
  
  const formatFullName = () => `${user.first_name} ${user.last_name}`;
  const formatEmail = () => user.email_address;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', activePath: ["/"] },
    { name: 'Book Now', path: '/book-now', activePath: ["/book-now", "/book-now/", "/book-now/index", "/book-now/checkout", "/book-now/checkout/", "/book-now/checkout/index"] },
    { name: 'About Us', path: '/about', activePath: ["/about"] },
    { name: 'Services', path: '/services', activePath: ["/services"] },
    { name: 'FAQS', path: '/faqs', activePath: ["/faqs"] },
    { name: 'Contact Us', path: '/contact', activePath: ["/contact"] },
  ];

  // Function to check if a nav item is active
  const isActive = (activePaths: string[]) => {
    return activePaths.some(path => {
      // Handle dynamic routes with IDs (e.g., /book-now/123)
      if (path.includes('/book-now/') && pathname.startsWith('/book-now/')) {
        return true;
      }
      // Handle exact matches
      return pathname === path;
    });
  };

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-22">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Image src={Logo} alt='logo' width={157} height={70} className="w-32 sm:w-36 md:w-40" />
            </div>

            {/* Loading indicator */}
            <div className="hidden lg:flex items-center">
              <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
            </div>

            {/* Mobile loading */}
            <div className="lg:hidden flex items-center">
              <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-22">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Image src={Logo} alt='logo' width={157} height={70} className="w-32 sm:w-36 md:w-40" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center px-1 py-2 text-xs xl:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                  isActive(item.activePath)
                    ? 'text-[#586DF7]'
                    : 'text-gray-700 hover:text-[#586DF7]'
                }`}
              >
                {isActive(item.activePath) && (
                  <span className="mr-2 h-2 w-2 bg-[#586DF7] rounded-full inline-block"></span>
                )}
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth/Profile Dropdown */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center cursor-pointer gap-2 xl:gap-3 focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  <Image
                    src={authUser?.profileImage || defaultImage}
                    alt="Profile"
                    className="w-8 h-8 xl:w-10 xl:h-10 rounded-full object-cover border-2 border-gray-200"
                    width={40}
                    height={40}
                  />
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-gray-900 font-semibold truncate max-w-[140px] xl:max-w-[160px] text-xs xl:text-sm">
                      {formatFullName()}
                    </span>
                    <span className="text-gray-500 text-xs truncate max-w-[140px] xl:max-w-[160px]">
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
                      {/* Dashboard link for admin and superadmin users */}
                      {(role === 'admin' || role === 'superadmin') && (
                        <Link
                          href={role === 'admin' ? '/admin/dashboard' : '/superadmin/dashboard'}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FiGrid className="text-gray-500" />
                          Dashboard
                        </Link>
                      )}
                      <Link href="/settings" className="px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <FaCog className="text-lg sm:text-xl" /> Settings
                      </Link>
                      <Link
                        href="/profile"
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FiUser className="text-gray-500" />
                        Profile
                      </Link>
                      <button
                        onClick={async () => {
                          // Use NextAuth signOut function directly as requested
                          await signOut({ redirect: false });
                          // Then call our custom logout for cleanup
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
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs xl:text-sm font-medium text-gray-700 hover:text-orange-500 whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center text-xs xl:text-sm font-medium text-[#586DF7] border border-[#586DF7] px-3 xl:px-4 py-2 rounded-full transition-colors duration-200 whitespace-nowrap"
                >
                  Register <span className="ml-1"><FaArrowRight /></span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.activePath)
                    ? 'text-[#586DF7]'
                    : 'text-gray-700 hover:text-[#586DF7]'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {isActive(item.activePath) && (
                  <span className="mr-2 h-2 w-2 bg-[#586DF7] rounded-full inline-block"></span>
                )}
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="px-3 py-2">
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={profileImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      width={40}
                      height={40}
                    />
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-semibold text-sm truncate max-w-[200px]">
                        {formatFullName()}
                      </span>
                      <span className="text-gray-500 text-xs truncate max-w-[200px]">
                        {formatEmail()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {/* Dashboard link for admin and superadmin users */}
                    {(role === 'admin' || role === 'superadmin') && (
                      <Link
                        href={role === 'admin' ? '/admin/dashboard' : '/superadmin/dashboard'}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:text-[#586DF7] hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FiGrid className="text-gray-500" />
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:text-[#586DF7] hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiUser className="text-gray-500" />
                      Profile
                    </Link>
                    <button
                      onClick={async () => {
                        // Use NextAuth signOut function directly as requested
                        await signOut({ redirect: false });
                        // Then call our custom logout for cleanup
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut className="text-red-500" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="mt-2 block flex items-center w-full text-center px-3 py-2 rounded-full border border-[#586DF7] text-base font-medium text-[#586DF7] "
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register <span className="ml-1"><FaArrowRight /></span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;