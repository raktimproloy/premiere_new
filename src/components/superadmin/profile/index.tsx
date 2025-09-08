'use client';
import React, { useEffect, useState } from 'react';
import { Edit2 } from 'lucide-react';
import { EditIcon } from '../../../../public/images/svg';
import Link from 'next/link';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState<{ fullName: string; email: string; phone: string; profileImage?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const defaultImage = '/images/default_profile.png';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/superadmin/profile');
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load profile');
        }
        setProfileData({
          fullName: data.user.fullName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          profileImage: data.user.profileImage || ''
        });
      } catch (e: any) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-gray-50 flex items-start py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg p-8 gap-10">
            <div className="flex items-center gap-2 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Profile Details</h1>
                <Link href="/superadmin/settings">
                  <EditIcon />
                </Link>
            </div>
            {error && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
            )}
            {loading ? (
              <div className="flex items-center gap-2 text-gray-600"><span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Loading...</div>
            ) : (
            <>
            {/* Profile Image Section */}
            <div className=" flex-shrink-0">
              <div className="w-28 h-28 relative bg-gray-200 rounded-full flex items-center justify-center ">
                <img 
                  src={profileData?.profileImage || defaultImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            {/* Details Table Section */}
            <div className="flex-1 mt-6">
              <table className="w-full text-left border-separate [border-spacing:0.5rem]">
                <tbody>
                  <tr>
                    <th colSpan={2} className="text-xl font-semibold text-gray-900 pb-2 pt-0">Personal Info</th>
                  </tr>
                  <tr>
                    <td className=" text-gray-400 w-36">Full Name</td>
                    <td className="font-semibold text-gray-900">{profileData?.fullName || '-'}</td>
                  </tr>
                  <tr>
                    <td className=" text-gray-400">Email Address</td>
                    <td className="ont-semibold text-gray-900">{profileData?.email || '-'}</td>
                  </tr>
                  <tr>
                    <td className=" text-gray-400">Phone Number</td>
                    <td className="font-semibold text-gray-900">{profileData?.phone || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            </>) }
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;