'use client'
import { useAuth } from '@/components/common/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FiX } from 'react-icons/fi';
import { DashboardIcon, PropertyIcon, BookingIcon, CalendarIcon, ReviewsIcon, ProfileIcon, SettingsIcon } from '../../../../public/images/svg';
import { FiHelpCircle } from 'react-icons/fi';
import type { IconProps } from '../../../../public/images/svg';
import { useRouter } from 'next/navigation';

const Logo = "/images/logo.png"
const Dashboard = "/images/icons/dashboard.svg"
const Property = "/images/icons/property.svg"
const Booking = "/images/icons/booking.svg"
const Calendar = "/images/icons/calendar.svg"
const Analytics = "/images/icons/analytics.svg"
const Reviews = "/images/icons/reviews.svg"
const Profile = '/images/icons/user.svg'
const Settings = '/images/icons/setting.svg'
const Help = '/images/icons/help.svg'

// Define type for navigation items
interface NavItem {
  title: string;
  link: string;
  icon: React.ReactElement<IconProps>;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentPath: string;  // Current path passed from parent
}

export default function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen,
  currentPath 
}: SidebarProps) {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  // Main navigation items
  const mainNavItems: NavItem[] = [
    { title: 'Dashboard', link: '/admin/dashboard', icon: <DashboardIcon /> },
    { title: 'Manage Property', link: '/admin/properties', icon: <PropertyIcon /> },
    { title: 'Bookings', link: '/admin/bookings', icon: <BookingIcon /> },
    { title: 'Calendar', link: '/admin/calendar', icon: <CalendarIcon /> },
    { title: 'Reviews', link: '/admin/reviews', icon: <ReviewsIcon /> },
    // { title: 'Users', link: '/admin/users', icon: <ProfileIcon /> },
  ];

  // Admin navigation items
  const adminNavItems: NavItem[] = [
    { title: 'Profile', link: '/admin/profile', icon: <ProfileIcon /> },
    { title: 'Settings', link: '/admin/settings', icon: <SettingsIcon /> },
    { title: 'Help', link: '/admin/help', icon: <FiHelpCircle size={22} /> },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white text-black transition-transform duration-300 ease-in-out transform shadow-md ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto`}
    >
      <div className="flex flex-col h-screen overflow-y-auto">
        <div className="p-4 flex items-center justify-between">
          <Image src={Logo} alt='logo' width={157} height={70} objectFit="contain" onClick={() => router.push('/')} />
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Close sidebar"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 pb-0">
          <ul className="space-y-2">
            {mainNavItems.map((item) => (
              <NavItem 
                key={item.title}
                title={item.title}
                link={item.link}
                icon={item.icon}
                active={currentPath === item.link}
              />
            ))}
          </ul>
        </nav>

        <p className='m-4 pb-2 text-sm text-[#969FB7] border-b-2 font-medium border-[#CDD7F1]'>
          ADMIN PORTAL
        </p>
        
        <nav className="flex-1 p-4 pt-0">
          <ul className="space-y-2">
            {adminNavItems.map((item) => (
              <NavItem 
                key={item.title}
                title={item.title}
                link={item.link}
                icon={item.icon}
                active={currentPath === item.link}
              />
            ))}
          </ul>
        </nav>
        
        <p className='m-4 mt-0 pt-2 text-sm text-center text-[#4E5258] border-t-2 font-medium border-[#CDD7F1]'>
          Copyright ©2025. <br/> PremierestaysMiami. All Rights <br/>Reserved.
        </p>
      </div>
    </aside>
  )
}

// NavItem component props
interface NavItemProps {
  title: string;
  link: string;
  icon: React.ReactElement<IconProps>;
  active?: boolean;
}

// Updated NavItem component
function NavItem({ title, link, icon, active = false }: NavItemProps) {
  return (
    <li>
      <Link href={link} className={`flex items-center gap-3 p-3 rounded-lg transition-colors nav-item-after-bar ${
            active 
               ? 'bg-[#EBA83A] text-[#ffffff] active' 
              : 'hover:bg-[#EBA83A] hover:text-[#ffffff]'
          }`}>
          {React.cloneElement(icon, { color: active ? '#fff' : '#4E5258' })}
          <span>{title}</span>
      </Link>
    </li>
  );
}