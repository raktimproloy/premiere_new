'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Edit2, Loader2 } from 'lucide-react';
import { CameraIcon } from '../../../../public/images/svg';

const Setting: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DefaultImage = '/images/default_profile.png';

  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    profileImage: ''
  });

  const [passwordInfo, setPasswordInfo] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/superadmin/profile');
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load profile');
        setPersonalInfo({
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

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      setError(null);
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/user/upload-image', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload image');
      setPersonalInfo(prev => ({ ...prev, profileImage: data.imageUrl || data.profileImage || '' }));
      setSuccess('Profile image updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePersonalInfoSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload = {
        fullName: personalInfo.fullName,
        phone: personalInfo.phone,
        dob: '',
        profileImage: personalInfo.profileImage
      };
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save');
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }
    if (passwordInfo.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    try {
      setSavingPassword(true);
      setError(null);
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordInfo)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to change password');
      setSuccess('Password updated successfully');
      setPasswordInfo({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-xl font-medium text-gray-800">Profile Settings</h1>
          <Edit2 className="w-5 h-5 text-gray-400" />
        </div>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded bg-green-50 text-green-700 border border-green-200">{success}</div>
        )}
        {loading ? (
          <div className="flex items-center gap-2 text-gray-600"><span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Loading...</div>
        ) : (
        <>
        {/* Profile Picture */}
        <div className=" flex-shrink-0 mb-6">
            <div className="w-28 h-28 relative bg-gray-200 rounded-full flex items-center justify-center ">
              <img 
                src={personalInfo.profileImage || DefaultImage} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
              />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="absolute bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center border-2 border-gray-100 hover:bg-gray-50 disabled:opacity-50">
              {uploadingImage ? (<Loader2 className="animate-spin" size={14} />) : (<CameraIcon />)}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Personal Information Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-800">Personal Information</h2>
              <button onClick={handlePersonalInfoSubmit} disabled={saving} className="px-4 py-2 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors disabled:opacity-50">
                {saving ? (<span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Saving...</span>) : 'Save Changes'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Full Name"
                  value={personalInfo.fullName}
                  onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  value={personalInfo.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50 cursor-not-allowed placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter Phone Number"
                  value={personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-800">Change Password</h2>
              <button onClick={handlePasswordSubmit} disabled={savingPassword} className="px-4 py-2 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors disabled:opacity-50">
                {savingPassword ? (<span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Changing...</span>) : 'Change Password'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Old Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={passwordInfo.oldPassword}
                  onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={passwordInfo.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={passwordInfo.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
        </>) }
      </div>
    </div>
  );
};

export default Setting;