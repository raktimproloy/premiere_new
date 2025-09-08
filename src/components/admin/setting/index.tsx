'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Edit2, Save, Loader2, Lock } from 'lucide-react';
import { CameraIcon, EditIcon } from '../../../../public/images/svg';
import { useNotificationHelpers } from '@/components/common/NotificationContext';

interface FileMetadata {
  url: string;
  publicId: string;
  originalFileName: string;
  fileExtension: string;
  fileNameWithoutExtension: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  profileImage?: string;
  guestId?: string;
  role: string;
  registerType?: 'manual' | 'google';
  // Admin-specific fields
  contactPerson?: string;
  mailingAddress?: string;
  desiredService?: string;
  // Business fields
  taxId?: string;
  bankAccountInfo?: string;
  taxForm?: string | FileMetadata;
}

const Setting: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { showSuccess, showError } = useNotificationHelpers();
  
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    phone: '',
    dob: ''
  });

  const [adminInfo, setAdminInfo] = useState({
    contactPerson: '',
    mailingAddress: '',
    desiredService: '',
    taxId: '',
    bankAccountInfo: '',
    taxForm: '' as string | FileMetadata
  });

  const [uploadingFiles, setUploadingFiles] = useState({
    taxForm: false
  });

  const [passwordInfo, setPasswordInfo] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setPersonalInfo({
          fullName: data.user.fullName || '',
          phone: data.user.phone || '',
          dob: data.user.dob || ''
        });
        
        // Set admin-specific fields if user is admin
        if (data.user.role === 'admin') {
          setAdminInfo({
            contactPerson: data.user.contactPerson || '',
            mailingAddress: data.user.mailingAddress || '',
            desiredService: data.user.desiredService || '',
            taxId: data.user.taxId || '',
            bankAccountInfo: data.user.bankAccountInfo || '',
            taxForm: data.user.taxForm || ''
          });
        }
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

      const response = await fetch('/api/user/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUser(prev => prev ? { ...prev, profileImage: data.imageUrl } : null);
        showSuccess('Profile Image Updated', 'Your profile image has been updated successfully!');
      } else {
        showError('Upload Failed', data.error || 'Failed to upload image');
      }
    } catch (error) {
      showError('Upload Failed', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'taxForm') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFiles(prev => ({ ...prev, [fileType]: true }));
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);

      const response = await fetch('/api/user/upload-file', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Store the file metadata object instead of just the URL
        setAdminInfo(prev => ({ ...prev, [fileType]: data.fileMetadata }));
        showSuccess(
          'File Uploaded', 
          `Tax form uploaded successfully!`
        );
      } else {
        showError(
          'Upload Failed', 
          data.message || 'Failed to upload tax form'
        );
      }
    } catch (error) {
      showError(
        'Upload Failed', 
        'Failed to upload tax form. Please try again.'
      );
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fileType]: false }));
    }
  };

  const handleFileDownload = async (fileType: 'taxForm') => {
    try {
      const response = await fetch(`/api/user/download-file?fileType=${fileType}`, {
        method: 'GET',
      });

      if (response.ok) {
        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${fileType}_${Date.now()}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to download file');
      }
    } catch (error) {
      setError('Failed to download file');
    }
  };

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // Prepare the data to send, handling file metadata
      const profileData = {
        ...personalInfo,
        ...(user?.role === 'admin' && {
          contactPerson: adminInfo.contactPerson,
          mailingAddress: adminInfo.mailingAddress,
          desiredService: adminInfo.desiredService,
          taxId: adminInfo.taxId,
          bankAccountInfo: adminInfo.bankAccountInfo,
          taxForm: typeof adminInfo.taxForm === 'string' 
            ? adminInfo.taxForm 
            : (adminInfo.taxForm as FileMetadata)?.url || ''
        })
      };

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(prev => prev ? { 
          ...prev, 
          ...personalInfo,
          ...(user?.role === 'admin' && adminInfo)
        } : null);
        showSuccess('Profile Updated', 'Your profile has been updated successfully!');
      } else {
        showError('Update Failed', data.error || 'Failed to update profile');
      }
    } catch (error) {
      showError('Update Failed', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
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

      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordInfo),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordInfo({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        showSuccess('Password Updated', 'Your password has been updated successfully!');
      } else {
        showError('Password Update Failed', data.error || 'Failed to update password');
      }
    } catch (error) {
      showError('Password Update Failed', 'Failed to update password. Please try again.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={20} />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  const isGoogleUser = user.registerType === 'google';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-xl font-medium text-gray-800">Profile Settings</h1>
        </div>

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

        {/* Profile Picture */}
        <div className="flex-shrink-0 mb-6">
          <div className="w-28 h-28 relative bg-gray-200 rounded-full flex items-center justify-center">
            <img 
              src={user.profileImage || "/images/profile2.jpg"} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center border-2 border-gray-100 hover:bg-gray-50 disabled:opacity-50"
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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Personal Information Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-800">Personal Information</h2>
            </div>

            <form onSubmit={handlePersonalInfoSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Full Name"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    value={user.email}
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
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={personalInfo.dob}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, dob: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Admin-specific fields */}
                {user?.role === 'admin' && (
                  <>
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Property Management Details</h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person <span className="text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter contact person name"
                        value={adminInfo.contactPerson}
                        onChange={(e) => setAdminInfo(prev => ({ ...prev, contactPerson: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mailing Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Enter your complete mailing address"
                        value={adminInfo.mailingAddress}
                        onChange={(e) => setAdminInfo(prev => ({ ...prev, mailingAddress: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Desired Service <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="full-management"
                            name="desiredService"
                            value="full-management"
                            checked={adminInfo.desiredService === 'full-management'}
                            onChange={(e) => setAdminInfo(prev => ({ ...prev, desiredService: e.target.value }))}
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

                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="stage-and-manage"
                            name="desiredService"
                            value="stage-and-manage"
                            checked={adminInfo.desiredService === 'stage-and-manage'}
                            onChange={(e) => setAdminInfo(prev => ({ ...prev, desiredService: e.target.value }))}
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

                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="custom-manage"
                            name="desiredService"
                            value="custom-manage"
                            checked={adminInfo.desiredService === 'custom-manage'}
                            onChange={(e) => setAdminInfo(prev => ({ ...prev, desiredService: e.target.value }))}
                            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
                            required
                          />
                          <label htmlFor="custom-manage" className="ml-3 flex items-center gap-2 text-sm text-gray-700">
                            <span>Custom Manage</span>
                            <div className="relative group">
                              <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                                Tailored management services based on your specific needs and requirements
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Business Information */}
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                      </div>

                      {/* Proof of Ownership and Business License fields removed */}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax ID (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Enter tax ID"
                          value={adminInfo.taxId}
                          onChange={(e) => setAdminInfo(prev => ({ ...prev, taxId: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Account Info
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Enter bank name, account number, routing number, and account holder name"
                          value={adminInfo.bankAccountInfo}
                          onChange={(e) => setAdminInfo(prev => ({ ...prev, bankAccountInfo: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-none"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Include: Bank Name, Account Number, Routing Number, Account Holder Name
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax Form
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'taxForm')}
                          className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          disabled={uploadingFiles.taxForm}
                        />
                        {uploadingFiles.taxForm && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                            <Loader2 className="animate-spin" size={16} />
                            Uploading...
                          </div>
                        )}
                        {adminInfo.taxForm && !uploadingFiles.taxForm && (
                          <div className="mt-2">
                            {typeof adminInfo.taxForm === 'string' ? (
                              adminInfo.taxForm.startsWith('http') ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-green-600">✓ Uploaded successfully</span>
                                  
                                  <button
                                    onClick={() => handleFileDownload('taxForm')}
                                    className="text-xs text-green-600 hover:underline"
                                  >
                                    Download
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500">
                                  Selected: {adminInfo.taxForm}
                                </p>
                              )
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-green-600">✓ Uploaded successfully</span>
                                
                                <button
                                  onClick={() => handleFileDownload('taxForm')}
                                  className="text-xs text-green-600 hover:underline"
                                >
                                  Download
                                </button>
                                <span className="text-xs text-gray-500">
                                  ({adminInfo.taxForm.originalFileName})
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Upload W-9, 1099, or other relevant tax forms (max 10MB)
                        </p>
                      </div>
                      </div>
                    </>
                  )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-800">Change Password</h2>
            </div>

            {isGoogleUser ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Google Account</h3>
                <p className="text-gray-600 mb-4">
                  You registered with Google, so you cannot change your password here.
                </p>
                <p className="text-sm text-gray-500">
                  To change your password, please visit your Google Account settings.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Old Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••"
                      value={passwordInfo.oldPassword}
                      onChange={(e) => setPasswordInfo(prev => ({ ...prev, oldPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      required
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
                      onChange={(e) => setPasswordInfo(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      required
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
                      onChange={(e) => setPasswordInfo(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="w-full px-4 py-2 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Changing Password...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
