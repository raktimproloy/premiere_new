import Link from 'next/link';
import React from 'react';
import { FaCog, FaQuestionCircle } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';

export default function SettingsHeader() {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
      {/* Settings Header */}
      <div className="md:col-span-6 bg-white rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage your account preferences and settings</p>
          </div>
          <Link href="/profile" className="flex items-center gap-2 text-blue-600">
            <FiUser className="text-gray-500" />
            <span className="font-medium text-sm sm:text-base">Profile</span>
          </Link>
        </div>
      </div>

      {/* Help Section */}
      <div className="md:col-span-3 flex flex-row sm:flex-col gap-3 sm:gap-4 justify-center bg-white rounded-xl p-4 sm:p-6 shadow-sm">
        <Link href="/contact" className="flex items-center gap-2 text-gray-700 hover:text-blue-700 font-medium text-sm sm:text-base">
          <FaQuestionCircle className="text-lg sm:text-xl" /> Help
        </Link>
      </div>
    </div>
  );
}
