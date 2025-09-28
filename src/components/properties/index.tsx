'use client'
import React, { useState, useEffect, useRef } from 'react'
import { BathroomIcon, BedIcon, GuestIcon, LocationFillIcon, PropertyIcon2, CalendarIcon, ProfileIcon } from '../../../public/images/svg';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaArrowRight, FaChevronDown } from 'react-icons/fa';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { saveSearchSession } from '@/utils/cookies';
import { useAuth } from '@/components/common/AuthContext';
import AboutSection from '../booknow/AboutSection';
import MapSection from '../booknow/MapSection';
import ReviewsSection from '../booknow/ReviewsSection';
import PropertiesList from '../booknow/Properties_list';

const images = [
  '/images/booknow/image1.png',
  '/images/booknow/image2.png',
  '/images/booknow/image3.png',
  '/images/booknow/image4.png',
  '/images/booknow/image5.png',
];

interface MainSectionProps {
  id?: string;
}

export default function MainSection(props: MainSectionProps) {
    const params = useParams();
    const router = useRouter();
    const id = props.id || (params?.id as string);
    const { isAuthenticated, user } = useAuth();
    
    // Property data state
    const [property, setProperty] = useState<any>(null);
    const [propertyLoading, setPropertyLoading] = useState(true);
    const [propertyError, setPropertyError] = useState<string | null>(null);
    
    // Booking form state
    const [email, setEmail] = useState('');
    const [checkInDate, setCheckInDate] = useState<Date | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
    const [guests, setGuests] = useState(1);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [suppressClose, setSuppressClose] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedServices, setSelectedServices] = useState<{[key: string]: boolean}>({});
    
    // Refs for form elements
    const checkInRef = useRef<DatePicker>(null);
    const checkOutRef = useRef<DatePicker>(null);
    const guestsRef = useRef<HTMLDivElement>(null);

    // Auto-fill email if user is authenticated
    useEffect(() => {
      if (isAuthenticated && user?.email) {
        setEmail(user.email);
      }
    }, [isAuthenticated, user]);

    // Auto-check free services when property loads
    useEffect(() => {
      if (property) {
        const propertyServices = (property as any)?.localData?.services || (property as any)?.services || [];
        const freeServices: {[key: string]: boolean} = {};
        
        propertyServices.forEach((service: any) => {
          if (parseFloat(service.price) === 0) {
            freeServices[service.name] = true;
          }
        });
        
        if (Object.keys(freeServices).length > 0) {
          setSelectedServices(prev => ({ ...prev, ...freeServices }));
        }
      }
    }, [property]);

    // Fetch property data
    useEffect(() => {
      let isMounted = true;
      setPropertyLoading(true);
      setPropertyError(null);
      
      fetch(`/api/properties/${id}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to fetch property');
          const data = await res.json();
          if (isMounted) {
            if (data.success && data.property) {
              setProperty(data.property);
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
    }, [id]);

    // Helper function to format dates
    const formatLocalDate = (date: Date) => {
      return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
    };

    // Handle dropdown interactions
    const handleDropdown = (dropdown: string) => {
      setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
      setSuppressClose(true);
    };

    // Handle check-in date selection
    const handleCheckInSelect = (date: Date | null) => {
      setCheckInDate(date);
      setSuppressClose(true);
      setActiveDropdown('checkout');
    };

    // Handle check-out date selection
    const handleCheckOutSelect = (date: Date | null) => {
      setCheckOutDate(date);
      setSuppressClose(true);
      setActiveDropdown('guests');
    };

    // Handle service selection
    const handleServiceChange = (serviceName: string) => {
      setSelectedServices(prev => ({ ...prev, [serviceName]: !prev[serviceName] }));
    };

    // Handle form submission
    const handleBookNow = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        // Create search session data
        const searchData = {
          location: property?.address ? `${property.address.city}, ${property.address.country}` : 'Property Location',
          checkInDate: checkInDate ? formatLocalDate(checkInDate) : '',
          checkOutDate: checkOutDate ? formatLocalDate(checkOutDate) : '',
          guests,
          propertyIds: [parseInt(id)]
        };

        // Save search session and get unique ID
        const uniqueId = saveSearchSession(searchData);

        // Create services parameter for URL
        const servicesParam = Object.keys(selectedServices).filter(serviceName => selectedServices[serviceName]).join(',');
        const url = servicesParam ? 
          `/book-now/checkout/${id}?id=${uniqueId}&services=${encodeURIComponent(servicesParam)}` :
          `/book-now/checkout/${id}?id=${uniqueId}`;

        // Redirect to checkout page with the unique ID and services
        router.push(url);

      } catch (error) {
        console.error('Error creating booking session:', error);
        alert('An error occurred while processing your booking. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    // Use property medium thumbnail if available, otherwise fallback
    const mainImage = property?.thumbnail_url_medium || images[0];

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
      <section className="max-w-7xl mx-auto p-2 md:p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            <span className="mx-2 text-gray-400">&gt;</span>
            <span className="text-gray-600">Property Details</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Images */}
          <div className="w-full lg:w-3/5 flex flex-col items-center">
            <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
              <img src={mainImage} alt="Property" className="object-cover w-full h-full" />
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="w-full lg:w-2/5 flex flex-col">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property?.name || 'Property Details'}</h1>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <span className='mr-2 bg-[#586DF71A] p-2 rounded-full'><LocationFillIcon /></span>
                {property?.address ? `${property.address.city}, ${property.address.state}, ${property.address.country}` : 'Location not available'}
              </div>
              
              {/* Booking Form */}
              <form onSubmit={handleBookNow} className="space-y-4">
                {/* Email Input */}
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!(isAuthenticated && user?.email)}
                    required
                  />
                </div>

                {/* Date Range Picker */}
                <div className="flex flex-row border rounded-lg border-gray-300">
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
                      className="w-full px-4 py-3 bg-transparent focus:outline-none text-sm"
                      onFocus={() => handleDropdown('checkin')}
                      popperPlacement="bottom"
                      popperClassName="z-30"
                      open={activeDropdown === 'checkin'}
                      onClickOutside={() => { if (!suppressClose) setActiveDropdown(null); }}
                      disabled={isSubmitting}
                      required
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
                      className="w-full px-4 py-3 bg-transparent focus:outline-none text-sm"
                      onFocus={() => handleDropdown('checkout')}
                      popperPlacement="bottom"
                      popperClassName="z-30"
                      open={activeDropdown === 'checkout'}
                      onClickOutside={() => { if (!suppressClose) setActiveDropdown(null); }}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Guests Selection */}
                <div className="relative">
                  <div
                    className="flex px-4 items-center border border-gray-300 rounded-lg bg-white cursor-pointer"
                    onClick={() => !isSubmitting && handleDropdown('guests')}
                    tabIndex={0}
                    ref={guestsRef}
                  >
                    <ProfileIcon />
                    <span className="w-full px-2 py-3 text-left select-none text-sm">
                      {guests} {guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                    <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${activeDropdown === 'guests' ? 'rotate-180' : ''}`} />
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
                          className={`px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm ${guests === num ? 'bg-blue-50' : ''}`}
                        >
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Services Section */}
                {((property as any)?.localData?.services || (property as any)?.services || []).length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mt-4 mb-4 border-dashed">
                    <div className="font-semibold mb-2 text-sm">Additional Services</div>
                    <div className="space-y-2">
                      {((property as any)?.localData?.services || (property as any)?.services || []).map((service: any, index: number) => (
                        <label key={`${service.name}-${index}`} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedServices[service.name] || false}
                            onChange={() => handleServiceChange(service.name)}
                            className="form-checkbox h-4 w-4 text-yellow-400 border-gray-300 rounded mr-2"
                          />
                          <span className="flex-1 text-gray-700 text-sm">{service.name}</span>
                          <span className={`text-sm ${parseFloat(service.price) === 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            {parseFloat(service.price) === 0 ? 'Free' : `$${parseFloat(service.price).toFixed(2)}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Now Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#F7B730] to-[#F7B730] hover:from-[#F7B730] hover:to-[#F7B730] text-black font-semibold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !email || !checkInDate || !checkOutDate}
                >
                  <span className="text-sm">Book Now</span>
                  <FaArrowRight className='ml-2 text-sm' />
                </button>
              </form>

              {/* Property Services */}
              {/*{(property?.services && property.services.length > 0) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Services & Amenities</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {property.services.map((service: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                          <span className="text-sm font-medium text-gray-700">{service.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          {service.price === '0' || service.price === 0 ? 'Free' : `$${service.price}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}

              {/* Property Amenities */}
              {(property?.localData?.amenities && property.localData.amenities.length > 0) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.localData.amenities.slice(0, 8).map((amenity: any, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {amenity.name || amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        
        {/* Bottom: Property Details */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {/* Property Type */}
          {property?.property_type && (
            <div className="flex items-center justify-start bg-white rounded-xl shadow p-4 gap-2">
              <div className="flex items-center">
                <span className='bg-[#586DF7] p-2 rounded-lg'><PropertyIcon2 /></span>
                <div className='flex flex-col ml-2'>
                  <span className="text-xs text-gray-500 mb-1">Type</span>
                  <span className="rounded-lg py-1 text-sm font-semibold">
                    {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Max Guests */}
          {property?.max_guests && property.max_guests > 0 && (
            <div className="flex items-center justify-start bg-white rounded-xl shadow p-4 gap-2">
              <div className="flex items-center">
                <span className='bg-[#F86E04] p-2 rounded-lg'><GuestIcon /></span>
                <div className='flex flex-col ml-2'>
                  <span className="text-xs text-gray-500 mb-1">Accommodation</span>
                  <span className="text-orange-700 rounded-lg py-1 text-sm font-semibold">
                    {property.max_guests} Guest{property.max_guests > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bedrooms */}
          {property?.bedrooms && property.bedrooms > 0 && (
            <div className="flex items-center justify-start bg-white rounded-xl shadow p-4 gap-2">
              <div className="flex items-center">
                <span className='bg-[#38C6F9] p-2 rounded-lg'><BedIcon /></span>
                <div className='flex flex-col ml-2'>
                  <span className="text-xs text-gray-500 mb-1">Bedrooms</span>
                  <span className="text-blue-700 rounded-lg py-1 text-sm font-semibold">
                    {property.bedrooms} Bedroom{property.bedrooms > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bathrooms */}
          {property?.bathrooms && property.bathrooms > 0 && (
            <div className="flex items-center justify-start bg-white rounded-xl shadow p-4 gap-2">
              <div className="flex items-center">
                <span className='bg-[#586DF7] p-2 rounded-lg'><BathroomIcon /></span>
                <div className='flex flex-col ml-2'>
                  <span className="text-xs text-gray-500 mb-1">Bathrooms</span>
                  <span className="text-purple-700 rounded-lg py-1 text-sm font-semibold">
                    {property.bathrooms_full && property.bathrooms_half 
                      ? `${property.bathrooms_full} Full ${property.bathrooms_half} Half Bath${(property.bathrooms_full + property.bathrooms_half) > 1 ? 's' : ''}`
                      : `${property.bathrooms} Bathroom${property.bathrooms > 1 ? 's' : ''}`
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          {property?.status && (
            <div className="flex items-center justify-start bg-white rounded-xl shadow p-4 gap-2">
              <div className="flex items-center">
                <span className={`p-2 rounded-lg ${property.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <div className={`w-3 h-3 rounded-full ${property.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </span>
                <div className='flex flex-col ml-2'>
                  <span className="text-xs text-gray-500 mb-1">Status</span>
                  <span className={`rounded-lg py-1 text-sm font-semibold ${property.status === 'active' ? 'text-green-700' : 'text-gray-700'}`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          {property?.localData?.pricing && (property.localData.pricing.baseRate > 0 || property.localData.pricing.cleaningFee > 0) && (
            <div className="flex items-center justify-start bg-white rounded-xl shadow p-4 gap-2">
              <div className="flex items-center">
                <span className='bg-[#10B981] p-2 rounded-lg'>💰</span>
                <div className='flex flex-col ml-2'>
                  <span className="text-xs text-gray-500 mb-1">Starting from</span>
                  <span className="text-green-700 rounded-lg py-1 text-sm font-semibold">
                    ${property.localData.pricing.baseRate || 0}
                    {property.localData.pricing.cleaningFee > 0 && ` + $${property.localData.pricing.cleaningFee} cleaning`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <AboutSection property={property}/>
      {/* <AvailabilitySection/> */}
      <MapSection property={property}/>
      <ReviewsSection id={id}/>
      <PropertiesList/>
      </>
    );
}
