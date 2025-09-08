'use client'
import React, { useRef, useState, useEffect } from 'react'
import { BathroomIcon, BedIcon, CalendarIcon, GuestIcon, HeartIcon, LocationFillIcon, ProfileIcon, PropertyIcon, PropertyIcon2, ShareIcon } from '../../../public/images/svg';
import DatePicker from 'react-datepicker';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSearchSession, saveBookingPath } from '@/utils/cookies';
import { useAuth } from '@/components/common/AuthContext';
import PricingSkeleton from './PricingSkeleton';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const images = [
  '/images/booknow/image1.png',
  '/images/booknow/image2.png',
  '/images/booknow/image3.png',
  '/images/booknow/image4.png',
  '/images/booknow/image5.png',
];

interface MainSectionProps {
  id?: string;
  searchId?: string;
}

export default function MainSection(props: MainSectionProps) {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = props.id || (params?.id as string);
    const searchId = props.searchId || (searchParams.get('id') || undefined);
    const { isAuthenticated, user } = useAuth();
    const [email, setEmail] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [services, setServices] = useState({
      breakfast: false,
      lunch: false,
      driver: false
    });
    
    // Property data state
    const [property, setProperty] = useState<any>(null);
    const [propertyLoading, setPropertyLoading] = useState(true);
    const [propertyError, setPropertyError] = useState<string | null>(null);
    
    // Pricing state
    const [pricing, setPricing] = useState<any>(null);
    const [pricingLoading, setPricingLoading] = useState(false);
    const [pricingError, setPricingError] = useState<string | null>(null);
    const [showPricingSkeleton, setShowPricingSkeleton] = useState(false);
    
    // Get search session if searchId is provided
    const [searchSession, setSearchSession] = useState<any>(null);
    
    useEffect(() => {
      if (searchId) {
        const session = getSearchSession(searchId);
        setSearchSession(session);
        
        // Pre-fill form fields with search session data
        if (session) {
          if (session.checkInDate) {
            const checkInDate = new Date(session.checkInDate);
            setCheckInDate(checkInDate);
            setCheckIn(session.checkInDate);
          }
          if (session.checkOutDate) {
            const checkOutDate = new Date(session.checkOutDate);
            setCheckOutDate(checkOutDate);
            setCheckOut(session.checkOutDate);
          }
          if (session.guests) {
            setGuests(session.guests);
          }
        }
      }
    }, [searchId]);

    // Fetch property data (without pricing)
    useEffect(() => {
      let isMounted = true;
      setPropertyLoading(true);
      setPropertyError(null);
      
      console.log('🔄 Step 1: Fetching property data...');
      
      fetch(`/api/properties/${id}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to fetch property');
          const data = await res.json();
          if (isMounted) {
            if (data.success && data.property) {
              console.log('✅ Step 1 Complete: Property data loaded');
              setProperty(data.property);
              
              // After property loads successfully, show pricing skeleton and fetch pricing
              if (searchSession?.checkInDate && searchSession?.checkOutDate) {
                console.log('🔄 Step 2: Showing pricing skeleton and fetching pricing...');
                // Show skeleton immediately after property loads
                setShowPricingSkeleton(true);
                
                // Then fetch pricing data
                setTimeout(() => {
                  fetchPricing(searchSession.checkInDate, searchSession.checkOutDate);
                }, 100); // Small delay to ensure skeleton shows first
              }
            } else {
              setProperty(null);
              setPropertyError('Property not found');
            }
          }
        })
        .catch(() => {
          if (isMounted) {
            setProperty(null);
            setPropertyError('Failed to fetch property');
          }
        })
        .finally(() => {
          if (isMounted) setPropertyLoading(false);
        });
      return () => { isMounted = false; };
    }, [id, searchSession]);

    // If user is logged in, set email to user.email
    useEffect(() => {
      if (isAuthenticated && user?.email) {
        setEmail(user.email);
      }
    }, [isAuthenticated, user]);

    // Use property medium thumbnail if available, otherwise fallback
    const mainImage = property?.thumbnail_url_medium || images[0];
    const [checkInDate, setCheckInDate] = useState<Date | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [suppressClose, setSuppressClose] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'error' | 'warning' | 'info'>('info');
    const checkInRef = useRef<DatePicker>(null);
    const checkOutRef = useRef<DatePicker>(null);
    const guestsRef = useRef<HTMLDivElement>(null);

    const showToastFunction = (message: string, type: 'error' | 'warning' | 'info' = 'info') => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
      
      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    };

    const handleServiceChange = (service: keyof typeof services) => {
      setServices(prev => ({ ...prev, [service]: !prev[service] }));
    };
  
    const fetchPricing = async (startDate: string, endDate: string) => {
      if (!startDate || !endDate || !id) return;
      
      console.log('🔄 Step 2: Fetching pricing data...');
      
      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
        setPricingError('Invalid date range');
        setPricing(null);
        setShowPricingSkeleton(false);
        return;
      }
      
      // Show skeleton first, then start loading
      setShowPricingSkeleton(true);
      setPricingLoading(true);
      setPricingError(null);
      
      try {
        // Fetch pricing from the separate pricing API
        const response = await fetch(`/api/properties/${id}/pricing?start=${startDate}&end=${endDate}`);
        const data = await response.json();
        
        if (data.success) {
          console.log('✅ Step 2 Complete: Pricing data loaded');
          setPricing(data.pricing);
          setPricingError(null);
        } else {
          setPricingError(data.error || 'Failed to fetch pricing');
          setPricing(null);
        }
      } catch (error) {
        setPricingError('Failed to fetch pricing');
        setPricing(null);
      } finally {
        setPricingLoading(false);
        setShowPricingSkeleton(false);
      }
    };

    const calculateTotal = () => {
      let total = 0;
      
      // Add property pricing if available
      if (pricing?.summary?.totalAmount) {
        total += pricing.summary.totalAmount;
      }
      
      // Add service costs
      if (services.breakfast) total += 9.00;
      if (services.lunch) total += 12.00;
      if (services.driver) total += 12.00;
      
      return total.toFixed(2);
    };

    const handleCheckInSelect = (date: Date | null) => {
      setCheckInDate(date);
      const dateStr = date?.toISOString().split('T')[0] || '';
      setCheckIn(dateStr);
      
      // Clear pricing if check-in is cleared
      if (!dateStr) {
        setPricing(null);
        setPricingError(null);
        setShowPricingSkeleton(false);
        return;
      }
      
      // Show skeleton first, then fetch pricing if both dates are selected
      if (dateStr && checkOut) {
        console.log('🔄 User selected dates - showing pricing skeleton...');
        setShowPricingSkeleton(true);
        setTimeout(() => {
          fetchPricing(dateStr, checkOut);
        }, 100);
      }
    };
    
    const handleCheckOutSelect = (date: Date | null) => {
      setCheckOutDate(date);
      const dateStr = date?.toISOString().split('T')[0] || '';
      setCheckOut(dateStr);
      
      // Clear pricing if check-out is cleared
      if (!dateStr) {
        setPricing(null);
        setPricingError(null);
        setShowPricingSkeleton(false);
        return;
      }
      
      // Show skeleton first, then fetch pricing if both dates are selected
      if (checkIn && dateStr) {
        console.log('🔄 User selected dates - showing pricing skeleton...');
        setShowPricingSkeleton(true);
        setTimeout(() => {
          fetchPricing(checkIn, dateStr);
        }, 100);
      }
    };

    const handleDropdown = (dropdown: typeof activeDropdown) => {
      setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
      setSuppressClose(true);
    };

    const handleBookNow = async () => {
      if (!isAuthenticated) {
        // Save booking path in cookies and redirect to login
        saveBookingPath({
          path: `/book-now/checkout/${id}` + (searchId ? `?id=${searchId}` : ''),
          propertyId: id,
          searchId: searchId,
          checkIn: checkIn,
          checkOut: checkOut,
          guests: guests,
          email: email
        });
        router.push('/login');
        return;
      }

      // Check if user has completed their settings
      try {
        const response = await fetch('/api/user/settings');
        const data = await response.json();
        
        if (data.success && data.settings) {
          const { billingAddress, propertyPreferences, socialMedia } = data.settings;
          
          // Check if billing address is complete
          const hasBillingAddress = billingAddress && 
            billingAddress.street && 
            billingAddress.city && 
            billingAddress.state && 
            billingAddress.zipCode && 
            billingAddress.country;
          
          // Check if property preferences are set
          const hasPropertyPreferences = propertyPreferences && 
            propertyPreferences.preferredLocation && 
            propertyPreferences.propertyType && 
            propertyPreferences.maxPrice > 0 && 
            propertyPreferences.minBedrooms > 0;
          
          // Check if at least one social media profile is set
          const hasSocialMedia = socialMedia && (
            socialMedia.facebook || 
            socialMedia.twitter || 
            socialMedia.instagram || 
            socialMedia.linkedin
          );
          
          if (!hasBillingAddress || !hasPropertyPreferences || !hasSocialMedia) {
            // Show toast message and redirect to settings
            const missingFields = [];
            if (!hasBillingAddress) missingFields.push('billing address');
            if (!hasPropertyPreferences) missingFields.push('property preferences');
            if (!hasSocialMedia) missingFields.push('social media profiles');
            
            // Show toast message and redirect to settings
            showToastFunction(`Please complete your ${missingFields.join(', ')} in your account settings before proceeding.`, 'warning');
            
            // Redirect to settings page after a short delay
            // setTimeout(() => {
            //   router.push('/settings');
            // }, 2000);
            return;
          }
        }
        
        // All settings are complete, proceed to checkout
        if (searchId) {
          router.push(`/book-now/checkout/${id}?id=${searchId}`);
        } else {
          router.push(`/book-now/checkout/${id}`);
        }
        
      } catch (error) {
        console.error('Error checking user settings:', error);
        // If there's an error checking settings, show a message and redirect to settings
        showToastFunction('Unable to verify your account settings. Please complete your profile in settings before proceeding.', 'error');
        setTimeout(() => {
          router.push('/settings');
        }, 2000);
      }
    };

    if (propertyLoading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="xl" color="yellow" text="Loading property details..." />
        </div>
      );
    }

    if (propertyError) {
      return (
        <div className="flex justify-center items-center min-h-[400px] text-red-500 font-semibold">{propertyError}</div>
      );
    }
    
    return (
      <>
        {/* Toast Notification */}
        {showToast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 ${
            toastType === 'error' ? 'bg-red-500 text-white' :
            toastType === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{toastMessage}</p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="ml-4 text-white hover:text-gray-200 text-lg font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        <section className="max-w-7xl mx-auto p-2 md:p-6 lg:p-8">
        {/* Breadcrumb and Print Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            <span className="mx-2 text-gray-400">&gt;</span>
            <span className="text-gray-600">Property Details</span>
          </div>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print this page
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Images */}
          <div className="w-full lg:w-3/5 flex flex-col items-center">
            <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
              <img src={mainImage} alt="Property" className="object-cover w-full h-full" />
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="w-full lg:w-2/5 flex flex-col">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property?.name || 'Property Details'}</h1>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <span className='mr-2 bg-[#586DF71A] p-2 rounded-full'><LocationFillIcon /></span>
                {property?.address ? `${property.address.city}, ${property.address.state}, ${property.address.country}` : 'Location not available'}
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!(isAuthenticated && user?.email)}
              />
              <div className="flex flex-row flex-[2] min-w-[320px] border rounded-lg border-gray-300 mb-3">
                <div className="flex-1 relative flex items-center px-4">
                  <CalendarIcon />
                  <DatePicker
                    ref={checkInRef}
                    selected={checkInDate}
                    onChange={handleCheckInSelect}
                    selectsStart
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={new Date()}
                    placeholderText="Check-in"
                    className="w-full px-4 py-3 bg-transparent focus:outline-none"
                    onFocus={() => handleDropdown('checkin')}
                    popperPlacement="bottom"
                    popperClassName="z-30"
                    open={activeDropdown === 'checkin'}
                    onClickOutside={() => { if (!suppressClose) setActiveDropdown(null); }}
                    disabled
                  />
                </div>
                <div className="flex items-center px-2 text-gray-300 select-none">|</div>
                <div className="flex-1 relative flex items-center px-4">
                  <CalendarIcon />
                  <DatePicker
                    ref={checkOutRef}
                    selected={checkOutDate}
                    onChange={handleCheckOutSelect}
                    selectsEnd
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    minDate={checkInDate || new Date()}
                    placeholderText="Check-out"
                    className="w-full px-4 py-3 bg-transparent focus:outline-none"
                    onFocus={() => handleDropdown('checkout')}
                    popperPlacement="bottom"
                    popperClassName="z-30"
                    open={activeDropdown === 'checkout'}
                    onClickOutside={() => { if (!suppressClose) setActiveDropdown(null); }}
                    disabled
                  />
                </div>
              </div>
              <div className="relative w-full">
                <div
                  className="flex px-4 items-center border-1 border-gray-300 rounded-lg bg-white h-full cursor-pointer "
                  onClick={() => handleDropdown('guests')}
                  tabIndex={0}
                  ref={guestsRef}
                >
                  <ProfileIcon />
                  <span className="w-full px-2 py-3 text-left select-none">
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
                        className={`px-4 py-3 hover:bg-gray-100 cursor-pointer ${guests === num ? 'bg-blue-50' : ''}`}
                      >
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4 mb-4 border-dashed">
                <div className="font-semibold mb-2">Extra Services</div>
                <div className="space-y-2">
                  {[{ id: 'breakfast', label: 'Breakfast', price: 9.00 }, { id: 'lunch', label: 'Lunch', price: 12.00 }, { id: 'driver', label: 'Dinner', price: 12.00 }].map((service) => (
                    <label key={service.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={services[service.id as keyof typeof services]}
                        onChange={() => handleServiceChange(service.id as keyof typeof services)}
                        className="form-checkbox h-4 w-4 text-yellow-400 border-gray-300 rounded mr-2"
                      />
                      <span className="flex-1 text-gray-700">{service.label}</span>
                      <span className="text-gray-500 text-sm">${service.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Pricing Information */}
              {!checkIn || !checkOut ? (
                <div className="text-center py-2 text-gray-400 text-sm">
                  Select check-in and check-out dates to see pricing
                </div>
              ) : showPricingSkeleton ? (
                <PricingSkeleton />
              ) : pricingLoading ? (
                <div className="text-center py-2">
                  <LoadingSpinner size="sm" color="blue" text="Loading pricing..." showText={true} />
                </div>
              ) : pricingError ? (
                <div className="text-center py-2 text-red-500 text-sm">
                  {pricingError}
                </div>
              ) : pricing ? (
                <div className="border-t border-gray-200 pt-4 mb-4">
                  {/* Daily Pricing Breakdown */}
                  <div className="mb-3">
                    <div className="font-semibold text-sm text-gray-700 mb-2">Daily Rates:</div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {pricing.pricing && pricing.pricing.map((day: any, index: number) => (
                        <div key={day.date} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              {new Date(day.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                            <span className="text-xs text-gray-500">{day.date}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-blue-600">${day.amount}</span>
                            {day.minNights > 1 && (
                              <span className="text-xs text-orange-600">Min {day.minNights} nights</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Summary Information */}
                  <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total ({pricing.summary.availableNights} night{pricing.summary.availableNights !== 1 ? 's' : ''}):</span>
                      <span className="font-semibold text-blue-700">${pricing.summary.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Average per night:</span>
                      <span>${pricing.summary.averagePricePerNight.toFixed(2)}</span>
                    </div>
                    {pricing.summary.blockedNights > 0 && (
                      <div className="text-xs text-red-500 text-center">
                        ⚠️ {pricing.summary.blockedNights} blocked night(s)
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-blue-700">${calculateTotal()}</span>
                <span className="text-gray-400 text-xs">(You won't be charged yet!)</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <button className="w-3/5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-full transition-colors duration-300 flex items-center justify-center mb-2" onClick={handleBookNow}>
                  Book Now
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-100">
                    <HeartIcon/>
                  </button>
                  <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-100">
                    <ShareIcon/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom: Property Details */}
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-4 mt-8">
          <div className="flex-1 flex items-center justify-start bg-white rounded-xl shadow p-4 gap-2">
            <div className="flex items-center">
              <span className='bg-[#586DF7] p-2 rounded-lg'><PropertyIcon2 /></span>
              <div className='flex flex-col ml-2'>
                <span className="text-xs text-gray-500 mb-1">Type</span>
                <span className="rounded-lg py-1 text-sm font-semibold">
                  {property?.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-start bg-white rounded-xl shadow p-4 gap-2">
            <div className="flex items-center">
              <span className='bg-[#F86E04] p-2 rounded-lg'><GuestIcon /></span>
              <div className='flex flex-col ml-2'>
                <span className="text-xs text-gray-500 mb-1">Accommodation</span>
                <span className="text-orange-700 rounded-lg py-1 text-sm font-semibold">
                  {property?.max_guests ? `${property.max_guests}+ Guests` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-start bg-white rounded-xl shadow p-4 gap-2">
            <div className="flex items-center">
              <span className='bg-[#38C6F9] p-2 rounded-lg'><BedIcon /></span>
              <div className='flex flex-col ml-2'>
                <span className="text-xs text-gray-500 mb-1">Bedrooms</span>
                <span className="text-blue-700 rounded-lg py-1 text-sm font-semibold">
                  {property?.bedrooms ? `${property.bedrooms} Bedroom${property.bedrooms > 1 ? 's' : ''}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-start bg-white rounded-xl shadow p-4 gap-2">
            <div className="flex items-center">
              <span className='bg-[#586DF7] p-2 rounded-lg'><BathroomIcon /></span>
              <div className='flex flex-col ml-2'>
                <span className="text-xs text-gray-500 mb-1">Bathrooms</span>
                <span className="text-purple-700 rounded-lg py-1 text-sm font-semibold">
                  {property?.bathrooms_full && property?.bathrooms_half 
                    ? `${property.bathrooms_full} Full ${property.bathrooms_half} Half Bath${(property.bathrooms_full + property.bathrooms_half) > 1 ? 's' : ''}`
                    : property?.bathrooms 
                      ? `${property.bathrooms} Bathroom${property.bathrooms > 1 ? 's' : ''}`
                      : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </>
    );
}
