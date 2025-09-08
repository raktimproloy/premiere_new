'use client'
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { LocationFillIcon } from '../../../public/images/svg';
import { CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ProfileIcon } from '../../../public/images/svg';
import { useRef } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getSearchSession } from '@/utils/cookies';
import { useAuth } from '@/components/common/AuthContext';

// Add GuestEntry type
interface GuestEntry {
  id?: number;
  name: string;
  email: string;
  phone: string;
  guestObj?: any; // full guest object from API
  isSelf?: boolean;
}

function formatLocalDate(date: Date) {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
}

const propertyImage1 = '/images/property.png';
const MainSection = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const searchId = searchParams.get('id') || undefined;
  const { user, isAuthenticated } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState('zahidul');
  const [newAddress, setNewAddress] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [email, setEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [suppressClose, setSuppressClose] = useState(false);
  const checkInRef = useRef<DatePicker>(null);
  const checkOutRef = useRef<DatePicker>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  // Property state
  const [property, setProperty] = useState<any>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [propertyError, setPropertyError] = useState<string | null>(null);

  // Pricing state
  const [pricing, setPricing] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingError, setPricingError] = useState<string | null>(null);

  // Guest search/create state
  const [guest, setGuest] = useState<any>(null);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  // Dynamic guest list state
  const [addedGuests, setAddedGuests] = useState<GuestEntry[]>([]);

  // Booking state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResults, setBookingResults] = useState<any[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch property data (without pricing)
  useEffect(() => {
    if (!id) {
      console.log('No property ID provided, redirecting to home'); // Debug log
      router.push('/');
      return;
    }
    setPropertyLoading(true);
    setPropertyError(null);
    
    // Fetch property data only (pricing will be fetched separately when dates are selected)
    fetch(`/api/properties/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch property');
        const data = await res.json();
        if (data.success && data.property) {
          setProperty(data.property);
        } else {
          setProperty(null);
          setPropertyError('Property not found');
          console.log('Property not found, redirecting to home'); // Debug log
          router.push('/');
        }
      })
      .catch(() => {
        setProperty(null);
        setPropertyError('Failed to fetch property');
        console.log('Failed to fetch property, redirecting to home'); // Debug log
        router.push('/');
      })
      .finally(() => setPropertyLoading(false));
  }, [id, router]);

  // Prefill right side from search session
  useEffect(() => {
    console.log('Checkout component mounted with searchId:', searchId); // Debug log
    if (searchId) {
      const session = getSearchSession(searchId);
      console.log('Search session found:', session); // Debug log
      if (session) {
        if (session.checkInDate) setCheckInDate(new Date(session.checkInDate));
        if (session.checkOutDate) setCheckOutDate(new Date(session.checkOutDate));
        if (session.guests) setGuests(session.guests);
      } else {
        // If no search session but user is authenticated and has property ID, 
        // allow them to continue with checkout (session might have expired)
        console.log('Search session not found, but allowing checkout to continue');
      }
    } else {
      console.log('No searchId provided, proceeding with checkout'); // Debug log
    }
  }, [searchId, router]);

  // Auto-fetch pricing when dates are available from search session
  useEffect(() => {
    if (checkInDate && checkOutDate && property) {
      console.log('🔄 Auto-fetching pricing for pre-filled dates:', checkInDate, checkOutDate);
      fetchPricing(checkInDate, checkOutDate);
    }
  }, [checkInDate, checkOutDate, property]);

  // Optionally, prefill email with logged-in user
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setEmail(user.email);
    }
  }, [isAuthenticated, user]);

  // Guest form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper: check if user is already added
  const isUserAdded = isAuthenticated && user && addedGuests.some(g => g.email === user.email);
  // Helper: check if max guests reached
  const maxGuestsReached = addedGuests.length >= guests;

  // Add Myself handler
  const handleAddMyself = async () => {
    if (!user || isUserAdded || maxGuestsReached) return;
    // Search for guest by user.email
    setGuestLoading(true);
    setGuestError(null);
    try {
      const searchRes = await fetch(`/api/guests?email=${encodeURIComponent(user.email)}`);
      const searchData = await searchRes.json();
      let guestObj = null;
      if (searchRes.ok && searchData.found && searchData.guest) {
        guestObj = searchData.guest;
      } else {
        // Create guest if not found
        const createRes = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone
          })
        });
        const createData = await createRes.json();
        if (createRes.ok && createData.guest) {
          guestObj = createData.guest;
        } else {
          setGuestError(createData.message || 'Failed to create guest');
          setGuestLoading(false);
          return;
        }
      }
      setAddedGuests(prev => [...prev, {
        id: guestObj?.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        guestObj,
        isSelf: true
      }]);
    } catch (err: any) {
      setGuestError('Error searching or creating guest');
    } finally {
      setGuestLoading(false);
    }
  };

  // Add New Guest handler (form)
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (maxGuestsReached) return;
    setGuestError(null);
    setGuestLoading(true);
    try {
      // 1. Search guest by email
      const searchRes = await fetch(`/api/guests?email=${encodeURIComponent(formData.email)}`);
      const searchData = await searchRes.json();
      let guestObj = null;
      if (searchRes.ok && searchData.found && searchData.guest) {
        guestObj = searchData.guest;
      } else {
        // 2. If not found, create guest
        const createRes = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone
          })
        });
        const createData = await createRes.json();
        if (createRes.ok && createData.guest) {
          guestObj = createData.guest;
        } else {
          setGuestError(createData.message || 'Failed to create guest');
          setGuestLoading(false);
          return;
        }
      }
      setAddedGuests(prev => [...prev, {
        id: guestObj?.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        guestObj,
        isSelf: false
      }]);
      // Reset form
      setFormData({ name: '', email: '', phone: '' });
    } catch (err: any) {
      setGuestError('Error searching or creating guest');
    } finally {
      setGuestLoading(false);
    }
  };

  // Remove guest handler
  const handleRemoveGuest = (email: string) => {
    setAddedGuests(prev => prev.filter(g => g.email !== email));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAddress(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Address saved successfully!');
    setNewAddress(false);
  };

  const fetchPricing = async (startDate: Date, endDate: Date) => {
    if (!startDate || !endDate || !id) return;
    
    console.log('🔄 Fetching pricing for dates:', startDate, endDate, 'Property ID:', id);
    
    setPricingLoading(true);
    setPricingError(null);
    
    try {
      const start = formatLocalDate(startDate);
      const end = formatLocalDate(endDate);
      
      console.log('📅 Formatted dates:', start, end);
      console.log('🌐 API URL:', `/api/properties/${id}/pricing?start=${start}&end=${end}`);
      
      // Fetch pricing from the dedicated pricing API
      const response = await fetch(`/api/properties/${id}/pricing?start=${start}&end=${end}`);
      const data = await response.json();
      
      console.log('📊 Pricing API response:', data);
      
      if (data.success) {
        setPricing(data.pricing);
        setPricingError(null);
        console.log('✅ Pricing loaded successfully:', data.pricing);
      } else {
        setPricingError(data.error || 'Failed to fetch pricing');
        setPricing(null);
        console.log('❌ Pricing failed:', data.error);
      }
    } catch (error) {
      console.error('💥 Pricing fetch error:', error);
      setPricingError('Failed to fetch pricing');
      setPricing(null);
    } finally {
      setPricingLoading(false);
    }
  };

  const handleCheckInSelect = (date: Date | null) => {
    console.log('📅 Check-in date selected:', date);
    setCheckInDate(date);
    
    // Clear pricing if check-in is cleared
    if (!date) {
      setPricing(null);
      setPricingError(null);
      return;
    }
    
    // Fetch pricing if both dates are selected
    if (date && checkOutDate) {
      console.log('🔄 Both dates selected, fetching pricing...');
      fetchPricing(date, checkOutDate);
    }
  };

  const handleCheckOutSelect = (date: Date | null) => {
    console.log('📅 Check-out date selected:', date);
    setCheckOutDate(date);
    
    // Clear pricing if check-out is cleared
    if (!date) {
      setPricing(null);
      setPricingError(null);
      return;
    }
    
    // Fetch pricing if both dates are selected
    if (checkInDate && date) {
      console.log('🔄 Both dates selected, fetching pricing...');
      fetchPricing(checkInDate, date);
    }
  };

  const handleDropdown = (dropdown: string) => {
    setActiveDropdown(dropdown);
  };

  type PaymentMethod = 'card' | 'paypal' | 'googlepay';
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods = [
    { id: 'card', label: 'Debit/Credit Card', image: '/images/mastercard.png' },
    { id: 'paypal', label: 'PayPal', image: '/images/paypal.png' },
    { id: 'googlepay', label: 'Google Pay', image: '/images/gpay.png' },
  ];

  // Booking handler
  const handleCheckout = async () => {
    setBookingLoading(true);
    setBookingResults([]);
    setBookingError(null);
    if (!property || !checkInDate || !checkOutDate || addedGuests.length !== guests) {
      setBookingError('Please add all guests and select dates.');
      setBookingLoading(false);
      return;
    }
    
    const arrival = formatLocalDate(checkInDate);
    const departure = formatLocalDate(checkOutDate);
    const property_id = property.id;
    const is_block = false;
    
    try {
      const results: any[] = [];
      let successfulBooking = null;
      
      for (const g of addedGuests) {
        const guest_id = g.guestObj?.id;
        if (!guest_id) {
          results.push({ success: false, guest: g, error: 'Missing guest ID' });
          continue;
        }
        
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            arrival, 
            departure, 
            property_id, 
            is_block, 
            guest_id,
            check_in: "15:00", // Default check-in time 3:00 PM
            check_out: "11:00", // Default check-out time 11:00 AM
            title: `Booking for ${g.name} from ${arrival} to ${departure}`,
            notes: `Guest: ${g.name} (${g.email}) - Phone: ${g.phone}`
          })
        });
        
        const data = await res.json();
        results.push({ ...data, guest: g });
        
        // Save booking ID to user if booking was successful
        if (data.success && data.booking && data.booking.id) {
          successfulBooking = data.booking;
          await fetch('/api/user/add-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: data.booking.id })
          });
        }
      }
      
      // If we have at least one successful booking, redirect to confirmation page
      if (successfulBooking) {
        // Prepare confirmation data
        const confirmationData = {
          bookingId: successfulBooking.id,
          propertyName: property.name || 'Property',
          propertyImage: property.thumbnail_url_medium || '/images/property.png',
          checkInDate: arrival,
          checkOutDate: departure,
          totalAmount: pricing?.summary?.totalAmount || 0,
          guestName: addedGuests[0]?.name || 'Guest',
          guestEmail: addedGuests[0]?.email || 'guest@example.com',
          guests: guests,
          propertyAddress: property.address ? `${property.address.city}, ${property.address.state}, ${property.address.country}` : 'Address not available',
          propertyType: property.property_type || 'Property',
          bedrooms: property.bedrooms || 1,
          bathrooms: property.bathrooms || 1
        };
        
        // Build confirmation URL with parameters
        const params = new URLSearchParams();
        Object.entries(confirmationData).forEach(([key, value]) => {
          params.append(key, value.toString());
        });
        
        // Redirect to confirmation page
        router.push(`/book-now/checkout/confirmation?${params.toString()}`);
        return;
      }
      
      // If no successful bookings, show results
      setBookingResults(results);
    } catch (err: any) {
      setBookingError('Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 sm:mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <div className="flex items-center">
                  <a href="#" className="text-xs sm:text-sm font-medium text-[#586DF7] hover:text-gray-700">Home</a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <a href="#" className="ml-2 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700">Confirm and pay</a>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Guest Information</h2>
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Your Profile</h3>
                <div className="space-y-1 mb-6 sm:mb-8 pl-1">
                  {isAuthenticated && user ? (
                    <>
                      <p className="flex items-center font-medium text-gray-700 text-sm sm:text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {user.fullName}
                      </p>
                      <p className="flex items-center text-gray-600 text-sm sm:text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {user.email}
                      </p>
                      <p className="flex items-center text-gray-600 text-sm sm:text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {user.phone}
                      </p>
                      {!isUserAdded && !maxGuestsReached && (
                        <button
                          type="button"
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          onClick={handleAddMyself}
                          disabled={guestLoading}
                        >
                          {guestLoading ? 'Adding...' : 'Add Myself as Guest'}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">You are not logged in.</p>
                  )}
                </div>
                {/* Dynamic Guest List */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Guests ({addedGuests.length}/{guests})</h3>
                <ul className="mb-4">
                  {addedGuests.map(g => (
                    <li key={g.email} className="flex items-center justify-between border-b py-2">
                      <span>
                        <b>{g.name}</b> ({g.email}) {g.isSelf && <span className="text-xs text-blue-500">(You)</span>}
                      </span>
                      <button
                        type="button"
                        className="text-red-500 text-xs ml-2"
                        onClick={() => handleRemoveGuest(g.email)}
                        disabled={guestLoading}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                {/* Add New Guest Form (only if not at max) */}
                {!maxGuestsReached && (
                  <form onSubmit={handleGuestSubmit} className="border-t border-gray-200 pt-4 sm:pt-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="block w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="block w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          placeholder="Enter email"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="block w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                          placeholder="Enter phone"
                          required
                        />
                      </div>
                      <div className='flex justify-end'>
                        <button
                          type="submit"
                          className="bg-[#586DF7] text-white py-2 sm:py-3 px-6 sm:px-10 rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-end gap-2 text-sm sm:text-base"
                          disabled={guestLoading}
                        >
                          {guestLoading ? 'Saving...' : 'Add Guest'}
                          <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4"/>
                        </button>
                      </div>
                      {guestError && <p className="text-red-500 text-sm mt-2">{guestError}</p>}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
              {/* Property Info */}
              {propertyLoading ? (
                <div className="text-gray-500">Loading property...</div>
              ) : propertyError ? (
                <div className="text-red-500">{propertyError}</div>
              ) : property ? (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <span className='mr-2 bg-[#586DF71A] p-2 rounded-full'><LocationFillIcon /></span>
                    {property.address ? `${property.address.city}, ${property.address.state}, ${property.address.country}` : ''}
                  </div>
                </>
              ) : null}
              {/* Booking Details */}
              <div className="border-t border-gray-200 pt-4 sm:pt-6 mb-4 sm:mb-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-sm sm:text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="flex flex-row flex-[2] min-w-[280px] sm:min-w-[320px] border rounded-lg border-gray-300 mb-3">
                    <div className="flex-1 relative flex items-center px-3 sm:px-4">
                      <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <DatePicker
                        ref={checkInRef}
                        selected={checkInDate}
                        onChange={handleCheckInSelect}
                        selectsStart
                        startDate={checkInDate}
                        endDate={checkOutDate}
                        minDate={new Date()}
                        placeholderText="Check-in"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-transparent focus:outline-none text-sm sm:text-base"
                        onFocus={() => handleDropdown('checkin')}
                        popperPlacement="bottom"
                        popperClassName="z-30"
                        open={activeDropdown === 'checkin'}
                        onClickOutside={() => { if (!suppressClose) setActiveDropdown(null); }}
                      />
                    </div>
                    <div className="flex items-center px-2 text-gray-300 select-none">|</div>
                    <div className="flex-1 relative flex items-center px-3 sm:px-4">
                      <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <DatePicker
                        ref={checkOutRef}
                        selected={checkOutDate}
                        onChange={handleCheckOutSelect}
                        selectsEnd
                        startDate={checkInDate}
                        endDate={checkOutDate}
                        minDate={checkInDate || new Date()}
                        placeholderText="Check-out"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-transparent focus:outline-none text-sm sm:text-base"
                        onFocus={() => handleDropdown('checkout')}
                        popperPlacement="bottom"
                        popperClassName="z-30"
                        open={activeDropdown === 'checkout'}
                        onClickOutside={() => { if (!suppressClose) setActiveDropdown(null); }}
                      />
                    </div>
                  </div>
                  <div className="relative w-full">
                    <div
                      className="flex px-3 sm:px-4 items-center border-1 border-gray-300 rounded-lg bg-white h-full cursor-pointer"
                      onClick={() => handleDropdown('guests')}
                      tabIndex={0}
                      ref={guestsRef}
                    >
                      <ProfileIcon />
                      <span className="w-full px-2 py-2 sm:py-3 text-left select-none text-sm sm:text-base">
                        {guests} {guests === 1 ? 'Guest' : 'Guests'}
                      </span>
                    </div>
                    {activeDropdown === 'guests' && (
                      <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <div
                            key={num}
                            onClick={() => {
                              setGuests(num);
                              setActiveDropdown(null);
                            }}
                            className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 cursor-pointer text-sm sm:text-base ${guests === num ? 'bg-blue-50' : ''}`}
                          >
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Date Selection */}
              {/* <div className="border-t border-gray-200 pt-4 sm:pt-6 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Select Dates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                    <DatePicker
                      selected={checkInDate}
                      onChange={handleCheckInSelect}
                      selectsStart
                      startDate={checkInDate}
                      endDate={checkOutDate}
                      minDate={new Date()}
                      placeholderText="Select check-in"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                    <DatePicker
                      selected={checkOutDate}
                      onChange={handleCheckOutSelect}
                      selectsEnd
                      startDate={checkInDate}
                      endDate={checkOutDate}
                      minDate={checkInDate || new Date()}
                      placeholderText="Select check-out"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div> */}
              
              {/* Booking Summary */}
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Booking Summary</h3>
                
                {!checkInDate || !checkOutDate ? (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    Select check-in and check-out dates to see pricing
                  </div>
                ) : pricingLoading ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Loading pricing...
                  </div>
                ) : pricingError ? (
                  <div className="text-center py-4 text-red-500 text-sm">
                    {pricingError}
                  </div>
                ) : pricing ? (
                  <>
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">
                          ${pricing.summary.averagePricePerNight.toFixed(2)} × {pricing.summary.availableNights} night{pricing.summary.availableNights !== 1 ? 's' : ''}
                        </span>
                        <span className="font-medium">${pricing.summary.totalAmount.toFixed(2)}</span>
                      </div>
                      {pricing.summary.blockedNights > 0 && (
                        <div className="flex justify-between text-sm sm:text-base text-red-500">
                          <span>Blocked nights ({pricing.summary.blockedNights})</span>
                          <span>-${(pricing.summary.blockedNights * pricing.summary.averagePricePerNight).toFixed(2)}</span>
                        </div>
                      )}
                      {/* <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Taxes (4.5%)</span>
                        <span className="font-medium">${(pricing.summary.totalAmount).toFixed(2)}</span>
                      </div> */}
                    </div>
                    <div className="border-t border-gray-200 pt-3 sm:pt-4 mb-4 sm:mb-6">
                      <div className="flex justify-between text-base sm:text-lg font-bold">
                        <span>Total</span>
                        <span>${(pricing.summary.totalAmount ).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="font-medium text-blue-800">Payment due</span>
                        <span className="font-bold text-blue-800">${(pricing.summary.totalAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No pricing available for selected dates
                    {checkInDate && checkOutDate && (
                      <div className="mt-2 text-xs text-gray-500">
                        Debug: Dates selected but no pricing loaded. Check console for errors.
                      </div>
                    )}
                  </div>
                )}
                <button
                  className="w-full bg-[#F7B730] text-black py-2 sm:py-3 px-4 rounded-full shadow-sm hover:bg-[#e4c278] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm sm:text-base"
                  onClick={handleCheckout}
                  disabled={bookingLoading || addedGuests.length !== guests || !checkInDate || !checkOutDate || !property}
                >
                  {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                </button>
                {/* Booking feedback */}
                {bookingError && <div className="text-red-500 text-sm mt-2">{bookingError}</div>}
                {bookingResults.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Booking Results:</h4>
                    <ul>
                      {bookingResults.map((r, i) => (
                        <li key={i} className={r.success ? 'text-green-600' : 'text-red-600'}>
                          {r.success
                            ? `Success: Booking for ${r.guest.name} (${r.guest.email}) - Booking ID: ${r.booking?.id}`
                            : `Failed: ${r.guest.name} (${r.guest.email}) - ${r.message || r.error}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-3 sm:mt-4 text-center">
                  <a href="#" className="text-xs sm:text-sm font-medium text-black hover:text-blue-800">
                    Back to Listing Detail
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="max-w-md mx-auto lg:mx-0 p-4 sm:p-6 bg-white rounded-lg shadow-sm mt-6 sm:mt-8 mb-14">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Payment Method</h2>
      
      <div className="space-y-3 sm:space-y-4">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            className={`w-full flex items-center p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedMethod(method.id as PaymentMethod)}
          >
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center mr-3 sm:mr-4 ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-400'
            }`}>
              {selectedMethod === method.id && (
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
              )}
            </div>
            <Image src={method.image} alt={method.label} width={500} height={500} className='w-12 h-4 sm:w-14 sm:h-5 mr-2' />
            <span className="text-gray-700 font-medium text-sm sm:text-base">{method.label}</span>
          </button>
        ))}
      </div>
    </div>
      </div>
    </div>
  );
};

export default MainSection;