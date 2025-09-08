// components/HeroSection.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaArrowRight, FaMapMarkerAlt, FaUserFriends, FaChevronDown } from 'react-icons/fa';
import { CalendarIcon, LocationIcon, ProfileIcon } from '../../../public/images/svg';
import { saveSearchSession } from '@/utils/cookies';

interface SearchData {
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  propertyIds?: number[];
  id?: string;
  createdAt?: string;
}

interface Location {
  city: string;
  country: string;
  propertyIds: number[];
}

function formatLocalDate(date: Date) {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
}


export default function SearchForm({ searchData }: { searchData?: SearchData }) {
    const HeroImage = "/images/hero_section.png"
  // State for form fields
  const [location, setLocation] = useState(searchData?.location || '');
  const [checkInDate, setCheckInDate] = useState<Date | null>(
    searchData?.checkInDate ? new Date(searchData.checkInDate) : null
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(
    searchData?.checkOutDate ? new Date(searchData.checkOutDate) : null
  );
  const [guests, setGuests] = useState(searchData?.guests || 1);
  
  // State for UI interactions
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for which dropdown is open
  const [activeDropdown, setActiveDropdown] = useState<null | 'location' | 'guests' | 'checkin' | 'checkout'>(null);
  // Suppress onClickOutside for a short time after programmatic open
  const [suppressClose, setSuppressClose] = useState(false);
  
  // Refs for focusing next inputs
  const checkInRef = useRef<any>(null);
  const checkOutRef = useRef<any>(null);
  const guestsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoadingLocations(true);
      try {
        // First, ensure properties are cached
        console.log('Fetching properties cache...');
        const cacheResponse = await fetch('/api/properties/cache');
        if (!cacheResponse.ok) {
          console.error('Failed to cache properties:', cacheResponse.status, cacheResponse.statusText);
          // Continue anyway - the locations API might still work
        } else {
          const cacheData = await cacheResponse.json();
          console.log('Cache response:', cacheData);
        }

        // Then fetch locations
        console.log('Fetching locations...');
        const response = await fetch('/api/properties/locations');
        if (response.ok) {
          const data = await response.json();
          console.log('Locations response:', data);
          if (data.success && data.locations) {
            setAllLocations(data.locations);
            setFilteredLocations(data.locations);
            console.log(`Loaded ${data.locations.length} locations`);
          } else {
            console.error('Locations response not successful:', data);
          }
        } else {
          console.error('Failed to fetch locations:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  // Filter locations based on search input
  useEffect(() => {
    if (location.trim() === '') {
      setFilteredLocations(allLocations);
    } else {
      setFilteredLocations(
        allLocations.filter(loc => 
          loc.city.toLowerCase().includes(location.toLowerCase()) ||
          loc.country.toLowerCase().includes(location.toLowerCase())
        )
      );
    }
  }, [location, allLocations]);

  // Update dropdown open/close logic
  const handleDropdown = (dropdown: typeof activeDropdown) => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  // Update location select to close other dropdowns
  const handleLocationSelect = (loc: string) => {
    setLocation(loc);
    setSuppressClose(true);
    setActiveDropdown('checkin');
  };

  // Update check-in select to close other dropdowns
  const handleCheckInSelect = (date: Date | null) => {
    setCheckInDate(date);
    setSuppressClose(true);
    setActiveDropdown('checkout');
  };

  // Update check-out select to close other dropdowns
  const handleCheckOutSelect = (date: Date | null) => {
    setCheckOutDate(date);
    setSuppressClose(true);
    setActiveDropdown('guests');
  };

  // Handle form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Find the selected location and get its property IDs
      let propertyIds: number[] = [];
      if (location) {
        const selectedLocation = allLocations.find(loc => 
          `${loc.city}, ${loc.country}` === location
        );
        if (selectedLocation) {
          propertyIds = selectedLocation.propertyIds;
        }
      }

      // Save search session to cookie
      const searchData = {
        location: location || 'Any Location',
        checkInDate: checkInDate ? formatLocalDate(checkInDate) : '',
        checkOutDate: checkOutDate ? formatLocalDate(checkOutDate) : '',
        guests,
        propertyIds
      };

      const uniqueId = saveSearchSession(searchData);

      // Navigate to search results page with unique ID
      window.location.href = `/book-now?id=${uniqueId}`;

    } catch (error) {
      console.error('Error saving search session:', error);
      alert('An error occurred while processing your search. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
                  {/* Search Form */}
                  <form 
            ref={formRef}
            onSubmit={handleSearch}
            className="bg-white mt-4 mb-20 rounded-xl shadow-2xl p-3 sm:p-4 md:p-6 max-w-6xl mx-auto animate-fade-in delay-300"
          >
            <div className="flex flex-col lg:flex-row gap-2 md:gap-2 items-stretch rounded-xl">
              {/* Location Search */}
              <div className="relative w-full lg:w-48 xl:w-62 min-w-[120px]">
                <div className="flex px-3 sm:px-4 items-center border rounded-lg border-gray-300 bg-white h-full">
                  <LocationIcon  />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={() => handleDropdown('location')}
                    placeholder={isLoadingLocations ? "Loading locations..." : "Search by location"}
                    className="w-full px-2 py-2 sm:py-3 bg-transparent focus:outline-none text-sm sm:text-base"
                    disabled={isLoadingLocations || isSubmitting}
                  />
                </div>
                {activeDropdown === 'location' && (
                  <div className="absolute z-20 mt-1 w-full lg:w-[140%] bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                    {isLoadingLocations ? (
                      <div className="px-3 sm:px-4 py-2 sm:py-3 text-gray-500 text-sm sm:text-base">
                        Loading locations...
                      </div>
                    ) : filteredLocations.length > 0 ? (
                      filteredLocations.map((loc, index) => (
                        <div
                          key={`${loc.city}-${loc.country}-${index}`}
                          onClick={() => handleLocationSelect(`${loc.city}, ${loc.country}`)}
                          className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 cursor-pointer flex justify-between text-sm sm:text-base"
                        >
                          <span>{loc.city}, {loc.country}</span>
                          <span className="text-gray-500 text-xs sm:text-sm">{loc.propertyIds.length} properties</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 sm:px-4 py-2 sm:py-3 text-gray-500 text-sm sm:text-base">
                        No locations found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Date Range Picker */}
              <div className="flex flex-row flex-[2] min-w-[280px] sm:min-w-[320px] lg:min-w-[280px] xl:min-w-[320px] border rounded-lg border-gray-300">
                <div className="flex-1 relative flex items-center px-2 sm:px-4">
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
                    className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-transparent focus:outline-none text-sm sm:text-base"
                    onFocus={() => handleDropdown('checkin')}
                    popperPlacement="bottom"
                    popperClassName="z-30"
                    open={activeDropdown === 'checkin'}
                    onClickOutside={() => { if (!suppressClose) setActiveDropdown(null); }}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-center px-1 sm:px-2 text-gray-300 select-none">|</div>
                <div className="flex-1 relative flex items-center px-2 sm:px-4">
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
                    className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-transparent focus:outline-none text-sm sm:text-base"
                    onFocus={() => handleDropdown('checkout')}
                    popperPlacement="bottom"
                    popperClassName="z-30"
                    open={activeDropdown === 'checkout'}
                    onClickOutside={() => { if (!suppressClose) setActiveDropdown(null); }}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              {/* Guests */}
              <div className="relative w-full lg:w-48 xl:w-64 min-w-[90px]">
                <div
                  className="flex px-3 sm:px-4 items-center border-1 border-gray-300 rounded-lg bg-white h-full cursor-pointer"
                  onClick={() => !isSubmitting && handleDropdown('guests')}
                  tabIndex={0}
                  ref={guestsRef}
                >
                  <ProfileIcon />
                  <span className="w-full px-2 py-2 sm:py-3 text-left select-none text-sm sm:text-base">
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
                        className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 cursor-pointer text-sm sm:text-base ${guests === num ? 'bg-blue-50' : ''}`}
                      >
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Search Button */}
              <div className="flex items-stretch">
                <button
                  type="submit"
                  className="h-full w-full bg-gradient-to-r from-[#F7B730] to-[#F7B730] hover:from-[#F7B730] hover:to-[#F7B730] text-black font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-full transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center cursor-pointer"
                >
                  <span className="hidden lg:inline text-sm sm:text-base">Search Properties</span>
                  <FaArrowRight className='ml-1 sm:ml-2 text-sm sm:text-base' />
                </button>
              </div>
            </div>
          </form>
    </>
  )
}
