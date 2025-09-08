'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Camera, User, Mail, Phone, MapPin, MessageCircle, Loader2 } from 'lucide-react';
import { CameraIcon, EditIcon } from '../../../../public/images/svg';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  profileImage?: string;
  guestId?: string;
  role: string;
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
}

const ProfilePage = ({role}: {role: string}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const defaultImage = '/images/default_profile.png';
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(role === "superadmin" ? '/api/superadmin/profile' : '/api/user/profile');
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      } else {
        setError(data.error || 'Failed to fetch user data');
      }
    } catch (error) {
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(role === "superadmin" ? '/api/superadmin/upload-image' : '/api/user/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUser(prev => prev ? { ...prev, profileImage: data.profileImage } : null);
        setSuccess('Profile image updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch (error) {
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditProfile = () => {
    router.push(role === "superadmin" ? '/superadmin/settings' : '/admin/settings');
  };

  const renderDocument = (value: any) => {
    if (!value) return 'N/A';
    if (typeof value === 'string') {
      return value.startsWith('http') ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Document</a>
      ) : (
        value
      );
    }
    if (Array.isArray(value)) {
      return (
        <div className="space-y-1">
          {value.map((v, i) => (
            <div key={i}>{renderDocument(v)}</div>
          ))}
        </div>
      );
    }
    if (typeof value === 'object') {
      const url = (value as any).url || (value as any).link || (value as any).href;
      if (typeof url === 'string') {
        return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Document</a>;
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-12 min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={20} />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-12 min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No user data found</p>
          <button 
            onClick={fetchUserData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex items-start py-12">
      <div className="w-full max-w-2xl">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fadeIn">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-fadeIn">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg p-8 gap-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Profile Details</h1>
            <button
              onClick={handleEditProfile}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 size={16} />
              Edit Profile
            </button>
          </div>

          {/* Profile Image Section */}
          <div className="flex-shrink-0">
            <div className="w-28 h-28 relative bg-gray-200 rounded-full flex items-center justify-center">
              <img 
                src={user.profileImage || defaultImage} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center border-2 border-gray-100 hover:bg-gray-50 disabled:opacity-50"
              >
                {uploadingImage ? (
                  <Loader2 className="animate-spin" size={12} />
                ) : (
                  <CameraIcon />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
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
                  <td className="text-gray-400 w-36">Full Name</td>
                  <td className="font-semibold text-gray-900">{user.fullName || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="text-gray-400">Email Address</td>
                  <td className="font-semibold text-gray-900">{user.email}</td>
                </tr>
                <tr>
                  <td className="text-gray-400">Phone Number</td>
                  <td className="font-semibold text-gray-900">{user.phone || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="text-gray-400">Date of Birth</td>
                  <td className="font-semibold text-gray-900">
                    {user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
                <tr><td colSpan={2} className="h-4"></td></tr>
                <tr>
                  <th colSpan={2} className="text-xl font-semibold text-gray-900 pb-2 pt-0">Property Management Details</th>
                </tr>
                <tr>
                  <td className="text-gray-400">Contact Person</td>
                  <td className="font-semibold text-gray-900">{user.contactPerson || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="text-gray-400">Mailing Address</td>
                  <td className="font-semibold text-gray-900">{user.mailingAddress || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="text-gray-400">Desired Service</td>
                  <td className="font-semibold text-gray-900">{user.desiredService || 'N/A'}</td>
                </tr>
                <tr><td colSpan={2} className="h-4"></td></tr>
                <tr>
                  <th colSpan={2} className="text-xl font-semibold text-gray-900 pb-2 pt-0">Business Information</th>
                </tr>
                <tr>
                  <td className="text-gray-400">Tax ID</td>
                  <td className="font-semibold text-gray-900">{user.taxId || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="text-gray-400">Bank Account Info</td>
                  <td className="font-semibold text-gray-900">
                    <div className="max-w-xs truncate" title={user.bankAccountInfo}>
                      {user.bankAccountInfo || 'N/A'}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="text-gray-400">Tax Form</td>
                  <td className="font-semibold text-gray-900">
                    {renderDocument(user.taxForm)}
                  </td>
                </tr>
                {/* <tr><td colSpan={2} className="h-4"></td></tr>
                <tr>
                  <th colSpan={2} className="text-xl font-semibold text-gray-900 pb-2 pt-0">Support</th>
                </tr>
                <tr>
                  <td className="text-gray-400">Support Email</td>
                  <td className="font-semibold text-gray-900">support@premiere-stays.com</td>
                </tr>
                <tr>
                  <td className="text-gray-400">Support Number</td>
                  <td className="font-semibold text-gray-900">+1 (404) 123-4567</td>
                </tr>
                <tr>
                  <td className="text-gray-400">Address</td>
                  <td className="font-semibold text-gray-900">2345 Peachtree St, Atlanta</td>
                </tr> */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;