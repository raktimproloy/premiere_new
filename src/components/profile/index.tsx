'use client'
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaEdit, FaCog, FaQuestionCircle, FaEye, FaUser, FaEnvelope, FaPhone, FaCalendar, FaTimes, FaLock, FaSpinner } from 'react-icons/fa';
import { CameraIcon, EditIcon } from '../../../public/images/svg';
import BookingDetailsModal from './BookingDetailsModal';
import { formatDateForDisplay, isValidDateFormat } from '@/utils/dateUtils';
import Link from 'next/link';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  profileImage?: string;
  guestId?: number;
  role: 'user' | 'admin' | 'superadmin';
  registerType?: 'manual' | 'google';
  // Admin-specific fields
  contactPerson?: string;
  mailingAddress?: string;
  desiredService?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Booking {
  id: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  bookingDate: string;
  guests: number;
  nights: number;
}



export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const defaultImage = '/images/default_profile.png';
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    old: '',
    new: '',
    confirm: '',
  });
  
  const modalRef = useRef<HTMLDivElement>(null);
  const passwordModalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch bookings when user data is loaded
  useEffect(() => {
    if (user?.guestId) {
      fetchUserBookings();
    }
  }, [user?.guestId]);

  const fetchUserBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await fetch('/api/user/bookings');
      const data = await response.json();

      if (data.success) {
        setUserBookings(data.bookings || []);
      } else {
        console.error('Failed to fetch bookings:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setForm({
          fullName: data.user.fullName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          dob: data.user.dob || '',
        });
      } else {
        setError('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  // Close modal on Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setShowPasswordModal(false);
        setShowBookingModal(false);
      }
    };
    if (showModal || showPasswordModal || showBookingModal) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showModal, showPasswordModal, showBookingModal]);

  // Close modal on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showModal && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
      if (showPasswordModal && passwordModalRef.current && !passwordModalRef.current.contains(event.target as Node)) {
        setShowPasswordModal(false);
      }
      if (showBookingModal && selectedBooking && !selectedBooking.contains(event.target as Node)) {
        setShowBookingModal(false);
      }
    }
    if (showModal || showPasswordModal || showBookingModal) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal, showPasswordModal, showBookingModal, selectedBooking]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

      if (data.success) {
        setSuccess('Profile image updated successfully');
        // Update local user state
        if (user) {
          setUser({ ...user, profileImage: data.imageUrl });
        }
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!form.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    // if (!form.phone.trim()) {
    //   setError('Phone number is required');
    //   return;
    // }

    // if (!isValidDateFormat(form.dob)) {
    //   setError('Please enter a valid date in MM-DD-YYYY format');
    //   return;
    // }
    
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          dob: form.dob,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile updated successfully');
        setUser(data.user);
        setShowModal(false);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!passwordForm.old.trim()) {
      setError('Current password is required');
      return;
    }

    if (!passwordForm.new.trim()) {
      setError('New password is required');
      return;
    }

    if (passwordForm.new.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      setError('New password and confirmation do not match');
      return;
    }

    if (passwordForm.old === passwordForm.new) {
      setError('New password must be different from current password');
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
        body: JSON.stringify({
          oldPassword: passwordForm.old,
          newPassword: passwordForm.new,
          confirmPassword: passwordForm.confirm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password updated successfully');
        setShowPasswordModal(false);
        setPasswordForm({ old: '', new: '', confirm: '' });
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  console.log(user)
  if (loading) {
    return (
      <div className="bg-[#F8F9FB] min-h-screen py-6 sm:py-8 px-2 sm:px-4 md:px-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <FaSpinner className="animate-spin text-blue-600 text-xl" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#F8F9FB] min-h-screen py-6 sm:py-8 px-2 sm:px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load user data'}</p>
          <button 
            onClick={fetchUserData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FB] min-h-screen py-6 sm:py-8 px-2 sm:px-4 md:px-8 relative">
      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
          {error}
        </div>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        property={selectedBooking}
      />

      {/* Edit Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-lg mx-auto relative animate-fadeIn">
            <button
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-gray-700 text-lg"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center border border-[#1C88FF1A] rounded-lg px-3 py-2 bg-gray-50">
                  <FaUser className="text-gray-400 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="bg-transparent outline-none w-full text-gray-700 text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="flex items-center border border-[#1C88FF1A] rounded-lg px-3 py-2 bg-gray-50">
                  <FaEnvelope className="text-gray-400 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    disabled
                    className="bg-transparent outline-none w-full text-gray-500 text-sm sm:text-base cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center border border-[#1C88FF1A] rounded-lg px-3 py-2 bg-gray-50">
                  <FaPhone className="text-gray-400 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="bg-transparent outline-none w-full text-gray-700 text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="flex items-center border border-[#1C88FF1A] rounded-lg px-3 py-2 bg-gray-50">
                  <FaCalendar className="text-gray-400 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    placeholder="MM-DD-YYYY"
                    className="bg-transparent outline-none w-full text-gray-700 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-3 sm:gap-0">
                {user?.registerType !== 'google' && (
                  <button
                    type="button"
                    className="text-[#586DF7] text-sm hover:underline"
                    onClick={() => { setShowModal(false); setShowPasswordModal(true); }}
                  >
                    Change Password?
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold px-6 sm:px-8 py-2 rounded-full shadow transition-colors text-sm sm:text-base flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal Overlay */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div ref={passwordModalRef} className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-md mx-auto relative animate-fadeIn">
            <button
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-gray-700 text-lg"
              onClick={() => setShowPasswordModal(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            
            {user?.registerType === 'google' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaLock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Google Account</h3>
                <p className="text-gray-600 mb-4">
                  You registered with Google, so you cannot change your password here.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  To change your password, please visit your Google Account settings.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center border border-[#1C88FF1A] rounded-lg px-3 py-2 bg-gray-50">
                  <FaLock className="text-gray-400 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="password"
                    name="old"
                    value={passwordForm.old}
                    onChange={handlePasswordChange}
                    placeholder="Current Password"
                    className="bg-transparent outline-none w-full text-gray-700 text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="flex items-center border border-[#1C88FF1A] rounded-lg px-3 py-2 bg-gray-50">
                  <FaLock className="text-gray-400 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="password"
                    name="new"
                    value={passwordForm.new}
                    onChange={handlePasswordChange}
                    placeholder="New Password"
                    className="bg-transparent outline-none w-full text-gray-700 text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="flex items-center border border-[#1C88FF1A] rounded-lg px-3 py-2 bg-gray-50">
                  <FaLock className="text-gray-400 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="password"
                    name="confirm"
                    value={passwordForm.confirm}
                    onChange={handlePasswordChange}
                    placeholder="Confirm New Password"
                    className="bg-transparent outline-none w-full text-gray-700 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-3 sm:gap-0">
                <button
                  type="button"
                  className="text-gray-500 text-sm hover:underline"
                  onClick={() => { setShowPasswordModal(false); setShowModal(true); }}
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold px-6 sm:px-8 py-2 rounded-full shadow transition-colors text-sm sm:text-base flex items-center gap-2"
                >
                  {savingPassword ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Top Profile Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
        {/* Photo and Upload */}
        <div className="md:col-span-3 flex flex-col items-center justify-center bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex lg:flex-row flex-col items-center gap-4">
            <div className="relative">
              <Image 
                src={user.profileImage || defaultImage} 
                alt="Profile" 
                width={100} 
                height={100} 
                className="rounded-full w-20 h-20 sm:w-24 sm:h-24 object-cover" 
              />
              {uploadingImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <FaSpinner className="animate-spin text-white text-xl" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center gap-2 text-black rounded-full p-2 border-1 border-[#1C88FF1A] hover:bg-[#1C88FF1A] transition-colors text-xs px-4 py-2 disabled:opacity-50"
              >
                {uploadingImage ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Upload Photo
                    <CameraIcon/>
                  </>
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
        </div>

        {/* Info */}
        <div className="md:col-span-6 bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full lg:w-auto">
              <div>
                <div className="flex items-center gap-2 text-gray-900 mb-1 font-semibold text-sm sm:text-base">Your Name</div>
                <div className="text-gray-600 text-sm sm:text-base">{user.fullName}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-900 mb-1 font-semibold text-sm sm:text-base">Email Address</div>
                <div className="text-gray-600 text-sm sm:text-base">{user.email}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-900 mb-1 font-semibold text-sm sm:text-base">Phone Number</div>
                <div className="text-gray-600 text-sm sm:text-base">{user.phone}</div>
              </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-900 mb-1 font-semibold text-sm sm:text-base">Date of Birth</div>
                  <div className="text-gray-600 text-sm sm:text-base">{formatDateForDisplay(user.dob)}</div>
                </div>
            </div>
            <span onClick={() => setShowModal(true)} className='cursor-pointer self-center lg:self-start'>
              <EditIcon />
            </span>
          </div>
        </div>

        {/* Settings/Help */}
        <div className="md:col-span-3 flex flex-row sm:flex-col gap-3 sm:gap-4 justify-center bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <Link href="/settings" className="flex items-center gap-2 text-gray-700 hover:text-blue-700 font-medium text-sm sm:text-base">
            <FaCog className="text-lg sm:text-xl" /> Settings
          </Link>
          {/* <button className="flex items-center gap-2 text-gray-700 hover:text-blue-700 font-medium text-sm sm:text-base">
            <FaQuestionCircle className="text-lg sm:text-xl" /> Help
          </button> */}
        </div>
      </div>

      {/* Booking List Section */}
      <div className="max-w-7xl mx-auto my-16 sm:my-8 md:my-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your all Booking List</h2>
          <div className="relative">
            <button className="flex items-center gap-1 text-gray-600 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 bg-white hover:bg-gray-50 text-sm sm:text-base">
              Sort By <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>
        {loadingBookings ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-2xl text-blue-600" />
            <span className="ml-2 text-gray-600">Loading bookings...</span>
          </div>
        ) : userBookings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {userBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start relative">
                <Image 
                  src="/images/property.png" 
                  alt={booking.propertyName} 
                  width={200} 
                  height={200} 
                  className="rounded-lg w-full sm:w-40 h-48 sm:h-full object-cover" 
                />
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg line-clamp-1">{booking.propertyName}</h3>
                    <button className="text-gray-400 hover:text-blue-600" onClick={() => {
                      setSelectedBooking(booking);
                      setShowBookingModal(true);
                    }}><FaEye /></button>
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-2 mb-1 text-xs">
                    <span>Check-in: <span className="font-semibold text-gray-700">{booking.checkIn}</span></span>
                    <span>Check-out: <span className="font-semibold text-gray-700">{booking.checkOut}</span></span>
                    <span>Guests: <span className="font-semibold text-gray-700">{booking.guests}</span></span>
                    <span>Nights: <span className="font-semibold text-gray-700">{booking.nights}</span></span>
                    <span>Booking Date: <span className="font-semibold text-gray-700">{booking.bookingDate}</span></span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 items-center mt-2">
                    <span className="text-gray-600 text-xs sm:text-sm">Booking Status:</span>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'Approved' ? 'bg-green-500 text-white' :
                      booking.status === 'Pending' ? 'bg-yellow-400 text-yellow-900' :
                      booking.status === 'Cancelled' ? 'bg-red-500 text-white' :
                      booking.status === 'Completed' ? 'bg-green-400 text-white' :
                      'bg-gray-500 text-white'
                    }`}>{booking.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 items-center mt-2">
                    <span className="text-[#586DF7] font-bold text-base sm:text-lg">${booking.totalAmount.toFixed(2)}<span className="text-xs font-normal text-gray-500 ml-1">Total</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg mb-2">No bookings found</div>
            <div className="text-gray-400 text-sm">You haven't made any bookings yet.</div>
          </div>
        )}
      </div>
    </div>
  );
}
