'use client'
import Breadcrumb from '@/components/common/Breadcrumb'
import PropertyCard from '@/components/common/card/PropertyCard';
import DefaultLayout from '@/components/layout/DefaultLayout'
import React, { useState, useEffect, useRef } from 'react'
import { getSearchSession, SearchSession } from '@/utils/cookies';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SearchForm from './SearchForm'
import Properties_list from './Properties_list'

const propertyImage1 = '/images/property.png';

interface Property {
  id: number;
  title: string;
  location: string;
  image: string;
  beds: number;
  bathrooms: number;
  guestType: string;
  persons: number;
  roomType: string;
  facilities: string[];
  price: number;
  discountPrice: number;
  badge: string;
  rating: number;
  reviews: number;
  // Add pricing state
  pricing?: any;
  pricingLoading?: boolean;
  pricingError?: string | null;
}

const ROOM_TYPES = ['house', 'apartment', 'condo', 'villa', 'townhouse'];
const BEDROOM_RANGES = ['1-2', '3-4', '5+'];
const BATHROOM_RANGES = ['1-2', '3-4', '5+'];
const GUEST_RANGES = ['1-4', '5-8', '9+'];

const PROPERTIES_PER_PAGE = 9;

export default function MainPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchData, setSearchData] = useState<any>({});
    const searchId = searchParams.get('id');
    const [properties, setProperties] = useState<Property[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [searchSession, setSearchSession] = useState<SearchSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isPricingLoading, setIsPricingLoading] = useState(false);
    const [hasPricingLoaded, setHasPricingLoaded] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
    const [selectedBedrooms, setSelectedBedrooms] = useState<string[]>([]);
    const [selectedBathrooms, setSelectedBathrooms] = useState<string[]>([]);
    const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [isFiltering, setIsFiltering] = useState(false);
    console.log("searchData",searchData)
    // Ref to track if filters have been initialized to prevent unnecessary API calls
    const filtersInitializedRef = useRef(false);
    
    // Ref to track previous properties to prevent unnecessary API calls
    const previousPropertiesRef = useRef<Property[]>([]);
    
    // Ref to track previous search session to prevent unnecessary API calls
    const previousSearchSessionRef = useRef<SearchSession | null>(null);

    // Ref to track if bulk pricing API call is in progress
    const isBulkPricingInProgressRef = useRef(false);
    
    // Ref to track the last pricing request to prevent duplicates
    const lastPricingRequestRef = useRef<string>('');
    
    // Ref to track if we should skip the next pricing load
    const skipNextPricingLoadRef = useRef(false);
    
    // Ref to track the last time pricing was loaded
    const lastPricingLoadTimeRef = useRef<number>(0);
    
    // Ref to track filter debounce timer
    const filterDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    // Debounce delay for pricing API calls (2 seconds)
    const PRICING_DEBOUNCE_DELAY = 2000;
    
    // Debounce delay for filter API calls (500ms)
    const FILTER_DEBOUNCE_DELAY = 500;

    // Fetch bulk pricing for all properties
    const fetchBulkPricing = async (properties: Property[], checkInDate: string, checkOutDate: string) => {
        if (!checkInDate || !checkOutDate || properties.length === 0) return;

        // Create a unique request identifier
        const requestId = `${checkInDate}-${checkOutDate}-${properties.map(p => p.id).sort().join(',')}`;
        
        // Prevent duplicate API calls
        if (isBulkPricingInProgressRef.current) {
            console.log('⚠️ Bulk pricing already in progress, skipping duplicate request');
            return;
        }
        
        // Check if this exact request was already made
        if (lastPricingRequestRef.current === requestId) {
            console.log('⚠️ Same pricing request already made, skipping duplicate');
            return;
        }
        
        // Debounce rapid API calls
        const now = Date.now();
        if (now - lastPricingLoadTimeRef.current < PRICING_DEBOUNCE_DELAY) {
            console.log('⚠️ Pricing request debounced, too soon since last call');
            return;
        }

        try {
            console.log(`🔄 Fetching bulk pricing for ${properties.length} properties...`);
            isBulkPricingInProgressRef.current = true;
            lastPricingRequestRef.current = requestId;
            setIsPricingLoading(true);
            
            // Update all properties to show pricing loading state
            setProperties(prev => prev.map(prop => ({
                ...prop,
                pricingLoading: true,
                pricingError: null
            })));

            // Prepare bulk pricing request
            const bulkPricingRequest = {
                properties: properties.map(prop => ({
                    id: prop.id,
                    start: checkInDate,
                    end: checkOutDate
                }))
            };
            
            console.log('📤 Bulk pricing request:', bulkPricingRequest);

            const response = await fetch('/api/properties/bulk-pricing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bulkPricingRequest)
            });

            const data = await response.json();
            console.log('📥 Bulk pricing response:', data);

            if (data.success) {
                console.log(`✅ Bulk pricing loaded successfully for ${data.summary.successfulProperties} properties`);
                
                // Update properties with pricing data from bulk response
                const updatedProperties = properties.map(prop => {
                    // Try to find the pricing result with flexible ID matching
                    const pricingResult = data.results.find((result: any) => 
                        result.propertyId === prop.id || 
                        result.propertyId === prop.id.toString() || 
                        result.propertyId === Number(prop.id)
                    );
                    
                                         if (pricingResult && pricingResult.success) {
                         return {
                             ...prop, 
                             pricing: pricingResult.pricing,
                             pricingLoading: false, 
                             pricingError: null,
                             price: pricingResult.pricing.summary.totalAmount || 0
                         };
                     } else if (pricingResult && !pricingResult.success) {
                         return {
                             ...prop,
                             pricing: null,
                             pricingLoading: false,
                             pricingError: pricingResult.error || 'Failed to fetch pricing'
                         };
                     } else {
                         // No result found for this property
                         return {
                             ...prop,
                             pricing: null,
                             pricingLoading: false,
                             pricingError: 'No pricing data received'
                         };
                     }
                });
                
                // Update both properties and filteredProperties to ensure pricing is shown
                setProperties(updatedProperties);
                setFilteredProperties(updatedProperties);
                
                // Mark pricing as loaded
                setHasPricingLoaded(true);
            } else {
                console.log(`❌ Bulk pricing failed:`, data.error);
                
                // Update all properties with pricing error
                const errorProperties = properties.map(prop => ({
                    ...prop, 
                    pricing: null, 
                    pricingLoading: false, 
                    pricingError: data.error || 'Failed to fetch bulk pricing'
                }));
                
                // Update both properties and filteredProperties
                setProperties(errorProperties);
                setFilteredProperties(errorProperties);
            }
        } catch (error) {
            console.error(`❌ Bulk pricing error:`, error);
            
            // Update all properties with pricing error
            const errorProperties = properties.map(prop => ({
                ...prop, 
                pricing: null, 
                pricingLoading: false, 
                pricingError: 'Failed to fetch bulk pricing'
            }));
            
            // Update both properties and filteredProperties
            setProperties(errorProperties);
            setFilteredProperties(errorProperties);
        } finally {
            setIsPricingLoading(false);
            isBulkPricingInProgressRef.current = false;
            lastPricingLoadTimeRef.current = Date.now();
        }
    };

    // Fetch search session and properties on component mount
    useEffect(() => {
        const initializeSearch = async () => {
            setIsLoading(true);
            setIsInitialLoad(true);
            
            try {
                // Check if searchId exists
                if (!searchId) {
                    console.log('No search ID provided, redirecting to home page');
                    // router.push('/');
                    return;
                }

                // Get search session from cookie
                const session = getSearchSession(searchId);
                if (!session) {
                    console.log('No valid search session found, redirecting to home page');
                    // router.push('/');
                    return;
                }

                setSearchSession(session);
                
                // Build search parameters
                const searchParams = new URLSearchParams();
                if (session.propertyIds.length > 0) {
                    searchParams.append('ids', session.propertyIds.join(','));
                }
                if (session.checkInDate) {
                    searchParams.append('availabilityFrom', session.checkInDate);
                }
                if (session.checkOutDate) {
                    searchParams.append('availabilityTo', session.checkOutDate);
                }
                if (session.guests) {
                    searchParams.append('guestsFrom', session.guests.toString());
                    searchParams.append('guestsTo', session.guests.toString());
                }
                
                setSearchData(session)
                // First, ensure properties are cached
                console.log('🔄 Step 1: Fetching properties cache...');
                const cacheResponse = await fetch('/api/properties/cache');
                if (!cacheResponse.ok) {
                    console.error('Failed to cache properties:', cacheResponse.status, cacheResponse.statusText);
                    // Continue anyway - the search API might still work
                } else {
                    const cacheData = await cacheResponse.json();
                    console.log('Cache response:', cacheData);
                }

                // Then fetch properties from search API
                console.log('🔄 Step 2: Fetching properties from search API...');
                const response = await fetch(`/api/properties/search?${searchParams.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data.properties) {
                        // Transform API data to match Property interface
                        const transformedProperties = data.data.properties.map((prop: any) => {
                                                         // Use actual property data
                             const roomType = prop.property_type || 'house';
                             const bedrooms = prop.bedrooms || 1;
                             const bathrooms = prop.bathrooms || 1;
                             const maxGuests = prop.max_guests || 2;
                            
                                                         return {
                                 id: prop.id,
                                 title: prop.name,
                                 location: `${prop.address?.city || ''}, ${prop.address?.state || ''}, ${prop.address?.country || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, ''),
                                 image: prop.thumbnail_url_medium || propertyImage1,
                                 beds: bedrooms,
                                 bathrooms: bathrooms,
                                 guestType: 'Adult', // Default value
                                 persons: maxGuests,
                                 roomType: roomType,
                                 facilities: [], // Simplified for now
                                 price: 0, // Will be updated with real pricing when user requests it
                                 discountPrice: 180,
                                 badge: "FOR RENT",
                                 rating: 4.8,
                                 reviews: 28,
                                 // Initialize pricing state - will show skeleton while loading
                                 pricing: null,
                                 pricingLoading: true,
                                 pricingError: null
                             };
                        });
                        
                        // Debug: Log the transformed properties to see their structure
                        console.log('🔍 Transformed properties structure:', transformedProperties.map((p: Property) => ({
                            id: p.id,
                            title: p.title,
                            roomType: p.roomType,
                            beds: p.beds,
                            bathrooms: p.bathrooms,
                            persons: p.persons,
                            facilities: p.facilities
                        })));
                        
                        console.log(`✅ Step 2 Complete: Successfully loaded ${transformedProperties.length} properties`);
                        setProperties(transformedProperties);
                        setFilteredProperties(transformedProperties);

                        console.log('✅ Properties loaded successfully. Bulk pricing will be loaded automatically.');
                    } else {
                        console.error('No properties found in search response');
                        // Don't clear properties if we already have some
                        if (properties.length === 0) {
                            setProperties([]);
                            setFilteredProperties([]);
                        }
                    }
                } else {
                    console.error('Failed to fetch properties from search API');
                    // Don't clear properties if we already have some
                    if (properties.length === 0) {
                        setProperties([]);
                        setFilteredProperties([]);
                    }
                }
            } catch (error) {
                console.error('Error initializing search:', error);
                // Don't clear properties if we already have some
                if (properties.length === 0) {
                    setProperties([]);
                    setFilteredProperties([]);
                }
            } finally {
                console.log('Initial load complete. Properties count:', properties.length, 'Filtered count:', filteredProperties.length);
                setIsLoading(false);
                setIsInitialLoad(false);
            }
        };


        initializeSearch();
    }, [searchId, router]);

    // Cleanup effect when component unmounts
    useEffect(() => {
        return () => {
            // Reset all refs to prevent memory leaks
            isBulkPricingInProgressRef.current = false;
            lastPricingRequestRef.current = '';
            skipNextPricingLoadRef.current = false;
            lastPricingLoadTimeRef.current = 0;
            
            // Clear filter debounce timer
            if (filterDebounceTimerRef.current) {
                clearTimeout(filterDebounceTimerRef.current);
            }
        };
    }, []);

    // Auto-load bulk pricing when properties and search session are available
    useEffect(() => {
        console.log('🔍 Pricing useEffect triggered:', {
            isInitialLoad,
            hasSearchSession: !!searchSession,
            propertiesCount: properties.length,
            hasPricingLoaded,
            isBulkPricingInProgress: isBulkPricingInProgressRef.current,
            skipNextPricingLoad: skipNextPricingLoadRef.current
        });
        
        if (!isInitialLoad && searchSession && properties.length > 0 && !hasPricingLoaded && !isBulkPricingInProgressRef.current && !skipNextPricingLoadRef.current) {
            const { checkInDate, checkOutDate } = searchSession;
            if (checkInDate && checkOutDate) {
                console.log('🔄 Auto-loading bulk pricing for properties...');
                skipNextPricingLoadRef.current = true; // Prevent immediate re-trigger
                fetchBulkPricing(properties, checkInDate, checkOutDate);
            }
        }
    }, [isInitialLoad, searchSession, properties, hasPricingLoaded]);

    // Reset skip flag when pricing is loaded
    useEffect(() => {
        if (hasPricingLoaded) {
            skipNextPricingLoadRef.current = false;
        }
    }, [hasPricingLoaded]);

    // Apply filters to properties
    useEffect(() => {
        console.log('🔍 Filter effect triggered:', {
            isInitialLoad,
            hasSearchSession: !!searchSession,
            propertiesCount: properties.length,
            filtersInitialized: filtersInitializedRef.current,
            selectedRoomTypes,
            selectedBedrooms,
            selectedBathrooms,
            selectedGuests,
            priceRange
        });
        
        // Skip filter application during initial load or if no search session
        if (isInitialLoad || !searchSession || properties.length === 0) {
            console.log('🔍 Skipping filter application - conditions not met');
            return;
        }

        // Skip if this is the first run (filters are at their default state)
        if (!filtersInitializedRef.current) {
            console.log('🔍 Skipping filter application - filters not initialized yet');
            filtersInitializedRef.current = true;
            return;
        }
        
        // Check if any filters are actually active
        const hasActiveFilters = selectedRoomTypes.length > 0 || 
                               selectedBedrooms.length > 0 || 
                               selectedBathrooms.length > 0 || 
                               selectedGuests.length > 0 || 
                               priceRange[0] > 0 || 
                               priceRange[1] < 10000;
        
        console.log('🔍 Filter check result:', {
            hasActiveFilters,
            roomTypesActive: selectedRoomTypes.length > 0,
            bedroomsActive: selectedBedrooms.length > 0,
            bathroomsActive: selectedBathrooms.length > 0,
            guestsActive: selectedGuests.length > 0,
            priceMinActive: priceRange[0] > 0,
            priceMaxActive: priceRange[1] < 10000,
            priceRange
        });
        
        // If no filters are active, show all properties and return early
        if (!hasActiveFilters) {
            console.log('✅ No filters active, showing all properties');
            setFilteredProperties(properties);
            setCurrentPage(1);
            return;
        }
        
        // Use debouncing to prevent rapid API calls
        if (filterDebounceTimerRef.current) {
            clearTimeout(filterDebounceTimerRef.current);
        }
        
        filterDebounceTimerRef.current = setTimeout(() => {
            console.log('🔍 Filters changed, calling API...');
            applyFiltersWithAPI();
        }, FILTER_DEBOUNCE_DELAY);
        
    }, [selectedRoomTypes, selectedBedrooms, selectedBathrooms, selectedGuests, priceRange, isInitialLoad, searchSession, properties]);

    // Function to apply filters by calling the search API
    const applyFiltersWithAPI = async () => {
        if (!searchSession || properties.length === 0) return;

        try {
            console.log('🔍 Applying filters via API...');
            console.log('🔍 Current filter state:', {
                roomTypes: selectedRoomTypes,
                bedrooms: selectedBedrooms,
                bathrooms: selectedBathrooms,
                guests: selectedGuests,
                priceRange
            });
            console.log('🔍 Price range details:', {
                min: priceRange[0],
                max: priceRange[1],
                minActive: priceRange[0] > 0,
                maxActive: priceRange[1] < 10000
            });
            
            setIsFiltering(true);
            
            // Build search parameters with filters
            const searchParams = new URLSearchParams();
            
            // Add original search parameters
            if (searchSession.propertyIds.length > 0) {
                searchParams.append('ids', searchSession.propertyIds.join(','));
            }
            if (searchSession.checkInDate) {
                searchParams.append('availabilityFrom', searchSession.checkInDate);
            }
            if (searchSession.checkOutDate) {
                searchParams.append('availabilityTo', searchSession.checkOutDate);
            }
            if (searchSession.guests) {
                searchParams.append('guestsFrom', searchSession.guests.toString());
                searchParams.append('guestsTo', searchSession.guests.toString());
            }

            // Add filter parameters
            if (selectedRoomTypes.length > 0) {
                searchParams.append('roomTypes', selectedRoomTypes.join(','));
            }
            if (selectedBedrooms.length > 0) {
                searchParams.append('bedroomRanges', selectedBedrooms.join(','));
            }
            if (selectedBathrooms.length > 0) {
                searchParams.append('bathroomRanges', selectedBathrooms.join(','));
            }
            if (selectedGuests.length > 0) {
                searchParams.append('guestRanges', selectedGuests.join(','));
            }
            if (priceRange[0] > 0 || priceRange[1] < 10000) {
                searchParams.append('priceRange', JSON.stringify(priceRange));
            }

            console.log('📤 Search API request with filters:', searchParams.toString());

            // Call the search API with filters
            const response = await fetch(`/api/properties/search?${searchParams.toString()}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.properties) {
                    console.log(`✅ Filtered properties loaded: ${data.data.properties.length} properties`);
                    
                    // Transform API data to match Property interface
                    const transformedProperties = data.data.properties.map((prop: any) => {
                        const roomType = prop.property_type || 'house';
                        const bedrooms = prop.bedrooms || 1;
                        const bathrooms = prop.bathrooms || 1;
                        const maxGuests = prop.max_guests || 2;
                        
                        return {
                            id: prop.id,
                            title: prop.name,
                            location: `${prop.address?.city || ''}, ${prop.address?.state || ''}, ${prop.address?.country || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, ''),
                            image: prop.thumbnail_url_medium || propertyImage1,
                            beds: bedrooms,
                            bathrooms: bathrooms,
                            guestType: 'Adult',
                            persons: maxGuests,
                            roomType: roomType,
                            facilities: [],
                            price: 0,
                            discountPrice: 180,
                            badge: "FOR RENT",
                            rating: 4.8,
                            reviews: 28,
                            pricing: null,
                            pricingLoading: true,
                            pricingError: null
                        };
                    });

                    // Update properties with filtered results
                    setProperties(transformedProperties);
                    setFilteredProperties(transformedProperties);
                    setCurrentPage(1);

                    // Refresh pricing for the filtered properties
                    if (searchSession.checkInDate && searchSession.checkOutDate && !isBulkPricingInProgressRef.current) {
                        console.log('🔄 Refreshing pricing for filtered properties...');
                        setHasPricingLoaded(false);
                        lastPricingRequestRef.current = '';
                        fetchBulkPricing(transformedProperties, searchSession.checkInDate, searchSession.checkOutDate);
                    }
                } else {
                    console.log('No filtered properties found');
                    setFilteredProperties([]);
                    setCurrentPage(1);
                }
            } else {
                console.error('Failed to fetch filtered properties');
                // Fallback to local filtering if API fails
                applyFiltersLocally();
            }
        } catch (error) {
            console.error('Error applying filters via API:', error);
            // Fallback to local filtering if API fails
            applyFiltersLocally();
        } finally {
            setIsFiltering(false);
        }
    };

    // Fallback local filtering function
    const applyFiltersLocally = () => {
        console.log('🔍 Applying filters locally as fallback...');
        
        let filtered = [...properties];
        
        // Check if any filters are active
        const hasActiveFilters = selectedRoomTypes.length > 0 || 
                               selectedBedrooms.length > 0 || 
                               selectedBathrooms.length > 0 || 
                               selectedGuests.length > 0 || 
                               priceRange[0] > 0 || 
                               priceRange[1] < 10000;

        if (!hasActiveFilters) {
            // No filters active, show all properties
            console.log('✅ No filters active, showing all properties');
            setFilteredProperties(properties);
            setCurrentPage(1);
            return;
        }

        // Room Type filter
        if (selectedRoomTypes.length > 0) {
            const beforeCount = filtered.length;
            filtered = filtered.filter(prop => {
                const matches = selectedRoomTypes.includes(prop.roomType);
                if (!matches) {
                    console.log(`❌ Property ${prop.title} (${prop.id}) filtered out by room type: ${prop.roomType} not in ${selectedRoomTypes.join(', ')}`);
                }
                return matches;
            });
            console.log(`🏠 After room type filter: ${filtered.length} properties (filtered out ${beforeCount - filtered.length})`);
        }
        
        // Bedrooms filter
        if (selectedBedrooms.length > 0) {
            const beforeCount = filtered.length;
            filtered = filtered.filter(prop => {
                const matches = selectedBedrooms.some(range => {
                    if (range === '1-2') return prop.beds >= 1 && prop.beds <= 2;
                    if (range === '3-4') return prop.beds >= 3 && prop.beds <= 4;
                    if (range === '5+') return prop.beds >= 5;
                    return false;
                });
                if (!matches) {
                    console.log(`❌ Property ${prop.title} (${prop.id}) filtered out by bedrooms: ${prop.beds} not in ranges ${selectedBedrooms.join(', ')}`);
                }
                return matches;
            });
            console.log(`🛏️ After bedrooms filter: ${filtered.length} properties (filtered out ${beforeCount - filtered.length})`);
        }
        
        // Bathrooms filter
        if (selectedBathrooms.length > 0) {
            const beforeCount = filtered.length;
            filtered = filtered.filter(prop => {
                const matches = selectedBathrooms.some(range => {
                    if (range === '1-2') return prop.bathrooms >= 1 && prop.bathrooms <= 2;
                    if (range === '3-4') return prop.bathrooms >= 3 && prop.bathrooms <= 4;
                    if (range === '5+') return prop.bathrooms >= 5;
                    return false;
                });
                if (!matches) {
                    console.log(`❌ Property ${prop.title} (${prop.id}) filtered out by bathrooms: ${prop.bathrooms} not in ranges ${selectedBathrooms.join(', ')}`);
                }
                return matches;
            });
            console.log(`🚿 After bathrooms filter: ${filtered.length} properties (filtered out ${beforeCount - filtered.length})`);
        }
        
        // Guests filter
        if (selectedGuests.length > 0) {
            const beforeCount = filtered.length;
            filtered = filtered.filter(prop => {
                const matches = selectedGuests.some(range => {
                    if (range === '1-4') return prop.persons >= 1 && prop.persons <= 4;
                    if (range === '5-8') return prop.persons >= 5 && prop.persons <= 8;
                    if (range === '9+') return prop.persons >= 9;
                    return false;
                });
                if (!matches) {
                    console.log(`❌ Property ${prop.title} (${prop.id}) filtered out by guests: ${prop.persons} not in ranges ${selectedGuests.join(', ')}`);
                }
                return matches;
            });
            console.log(`👥 After guests filter: ${filtered.length} properties (filtered out ${beforeCount - filtered.length})`);
        }
        
        // Price range filter
        if (priceRange[0] > 0 || priceRange[1] < 10000) {
            const beforeCount = filtered.length;
            filtered = filtered.filter(prop => {
                const price = prop.price || 0;
                const matches = price >= priceRange[0] && price <= priceRange[1];
                if (!matches) {
                    console.log(`❌ Property ${prop.title} (${prop.id}) filtered out by price: $${price} not in range $${priceRange[0]} - $${priceRange[1]}`);
                }
                return matches;
            });
            console.log(`💰 After price filter: ${filtered.length} properties (filtered out ${beforeCount - filtered.length})`);
        }
        
        console.log(`✅ Local filtering complete: ${filtered.length} properties match criteria`);
        setFilteredProperties(filtered);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE);
    const paginatedProperties = filteredProperties.slice(
        (currentPage - 1) * PROPERTIES_PER_PAGE,
        currentPage * PROPERTIES_PER_PAGE
    );

    // Handlers for checkboxes
    const handleCheckbox = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter((prev) =>
            e.target.checked ? [...prev, value] : prev.filter((v) => v !== value)
        );
    };

    // Handler for price range
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const val = Number(e.target.value);
        console.log(`🔍 Price range change: idx=${idx}, val=${val}, current=${priceRange}`);
        setPriceRange((prev) => {
            const newRange: [number, number] = idx === 0 ? [val, prev[1]] : [prev[0], val];
            console.log(`🔍 New price range: ${prev} -> ${newRange}`);
            return newRange;
        });
    };

    // Clear all filters
    const clearAll = () => {
        setSelectedRoomTypes([]);
        setSelectedBedrooms([]);
        setSelectedBathrooms([]);
        setSelectedGuests([]);
        setPriceRange([0, 10000]);
        
        // Refresh properties from API when filters are cleared to show all properties
        if (searchSession && !isBulkPricingInProgressRef.current) {
            console.log('🔄 Refreshing properties after clearing filters...');
            setIsFiltering(true);
            
            // Build search parameters without filters
            const searchParams = new URLSearchParams();
            if (searchSession.propertyIds.length > 0) {
                searchParams.append('ids', searchSession.propertyIds.join(','));
            }
            if (searchSession.checkInDate) {
                searchParams.append('availabilityFrom', searchSession.checkInDate);
            }
            if (searchSession.checkOutDate) {
                searchParams.append('availabilityTo', searchSession.checkOutDate);
            }
            if (searchSession.guests) {
                searchParams.append('guestsFrom', searchSession.guests.toString());
                searchParams.append('guestsTo', searchSession.guests.toString());
            }

            // Fetch all properties without filters
            fetch(`/api/properties/search?${searchParams.toString()}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.data.properties) {
                        console.log(`✅ All properties restored: ${data.data.properties.length} properties`);
                        
                        // Transform API data to match Property interface
                        const transformedProperties = data.data.properties.map((prop: any) => {
                            const roomType = prop.property_type || 'house';
                            const bedrooms = prop.bedrooms || 1;
                            const bathrooms = prop.bathrooms || 1;
                            const maxGuests = prop.max_guests || 2;
                            
                            return {
                                id: prop.id,
                                title: prop.name,
                                location: `${prop.address?.city || ''}, ${prop.address?.state || ''}, ${prop.address?.country || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, ''),
                                image: prop.thumbnail_url_medium || propertyImage1,
                                beds: bedrooms,
                                bathrooms: bathrooms,
                                guestType: 'Adult',
                                persons: maxGuests,
                                roomType: roomType,
                                facilities: [],
                                price: 0,
                                discountPrice: 180,
                                badge: "FOR RENT",
                                rating: 4.8,
                                reviews: 28,
                                pricing: null,
                                pricingLoading: true,
                                pricingError: null
                            };
                        });

                        // Update properties with all results
                        setProperties(transformedProperties);
                        setFilteredProperties(transformedProperties);
                        setCurrentPage(1);

                        // Refresh pricing for all properties
                        if (searchSession.checkInDate && searchSession.checkOutDate && !isBulkPricingInProgressRef.current) {
                            console.log('🔄 Refreshing pricing for all properties...');
                            setHasPricingLoaded(false);
                            lastPricingRequestRef.current = '';
                            fetchBulkPricing(transformedProperties, searchSession.checkInDate, searchSession.checkOutDate);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error refreshing properties after clearing filters:', error);
                })
                .finally(() => {
                    setIsFiltering(false);
                });
        }
    };

    // Close filter on mobile when clicking outside
    const handleFilterClose = () => {
        if (window.innerWidth < 768) {
            setShowFilters(false);
        }
    };

    // Show loading state during initial load or when loading and no properties yet
    if (isInitialLoad || (isLoading && properties.length === 0)) {
        return (
            <div className="w-full text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading properties...</p>
            </div>
        );
    }

    return (
        <>
            {/* <Properties_list /> */}
            <SearchForm searchData={ searchId ? searchData : {}} />

            {
               searchId ? (
                <>
                   {/* Properties Header Section */}
                   {!isLoading && !isInitialLoad && properties.length > 0 && (
                       <div className="flex flex-col max-w-6xl mx-auto lg:flex-row justify-between items-center mt-4 sm:mt-6 md:mt-8 mb-4 sm:mb-6 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
                           <div className="text-sm sm:text-base lg:text-lg font-medium text-gray-800 text-center lg:text-left">
                               <span className="font-semibold">{(currentPage - 1) * PROPERTIES_PER_PAGE + 1}</span> - <span className="font-semibold">{Math.min(currentPage * PROPERTIES_PER_PAGE, filteredProperties.length)}</span> of <span className="font-semibold">{filteredProperties.length}</span> Properties
                               {filteredProperties.length !== properties.length && (
                                   <span className="ml-2 text-blue-600 text-xs">
                                       (filtered from {properties.length} total)
                                   </span>
                               )}
                               {/* {isPricingLoading && (
                                   <span className="ml-2 text-yellow-600 text-xs flex items-center">
                                       <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400 mr-1"></div>
                                       Loading pricing...
                                   </span>
                               )}
                               {!isPricingLoading && hasPricingLoaded && (
                                   <span className="ml-2 text-green-600 text-xs flex items-center">
                                       ✅ Pricing loaded
                                   </span>
                               )}
                               {!isPricingLoading && !hasPricingLoaded && properties.length > 0 && (
                                   <button 
                                       onClick={() => {
                                           if (searchSession?.checkInDate && searchSession?.checkOutDate && !isBulkPricingInProgressRef.current) {
                                               console.log('🔄 Manually refreshing pricing...');
                                               setHasPricingLoaded(false);
                                               // Reset the last pricing request to allow new pricing fetch
                                               lastPricingRequestRef.current = '';
                                               fetchBulkPricing(properties, searchSession.checkInDate, searchSession.checkOutDate);
                                           }
                                       }}
                                       className="ml-2 text-blue-600 text-xs hover:text-blue-800 underline cursor-pointer"
                                       disabled={isBulkPricingInProgressRef.current}
                                   >
                                       {isBulkPricingInProgressRef.current ? 'Loading...' : 'Load pricing'}
                                   </button>
                               )} */}
                               {/* {isFiltering && (
                                   <span className="ml-2 text-blue-600 text-xs flex items-center">
                                       <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-1"></div>
                                       Applying filters...
                                   </span>
                               )} */}
                               {/* Show active filters indicator
                               {(selectedRoomTypes.length > 0 || selectedBedrooms.length > 0 || selectedBathrooms.length > 0 || selectedGuests.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000) && (
                                   <span className="ml-2 text-purple-600 text-xs flex items-center">
                                       🔍 Filters active
                                   </span>
                               )} */}
                           </div>
                           {/* <div className="flex items-center gap-2">
                               <span className="text-gray-500 text-xs sm:text-sm">Sort By:</span>
                               <button
                                   className="ml-2 border border-gray-300 rounded-full px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition flex items-center"
                                   onClick={() => {
                                                                        // Debug: Show available filter options
                                        const availableRoomTypes = [...new Set(properties.map(p => p.roomType))];
                                        const availableBedrooms = [...new Set(properties.map(p => p.beds))];
                                        const availableBathrooms = [...new Set(properties.map(p => p.bathrooms))];
                                        const availableGuests = [...new Set(properties.map(p => p.persons))];
                                        const availablePrices = properties.map(p => p.price).filter(p => p > 0);
                                        
                                        console.log('🔍 Available filter options:', {
                                            roomTypes: availableRoomTypes,
                                            bedrooms: availableBedrooms,
                                            bathrooms: availableBathrooms,
                                            guests: availableGuests,
                                            priceRange: availablePrices.length > 0 ? `$${Math.min(...availablePrices)} - $${Math.max(...availablePrices)}` : 'No pricing data'
                                        });
                                       
                                       setShowFilters(!showFilters);
                                   }}
                               >
                                   More Filters
                                   <svg className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                               </button>
                           </div> */}
                       </div>
                   )}
       
                   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row">
                       {/* Mobile Filter Modal Overlay */}
                       {showFilters && (
                           <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden" onClick={handleFilterClose}></div>
                       )}
       
                       {/* Mobile Filter Modal */}
                       {showFilters && (
                           <div className="fixed inset-0 z-50 lg:hidden flex items-center justify-center p-4">
                               <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
                                   <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 rounded-t-xl">
                                       <div className="flex justify-between items-center">
                                           <div>
                                           <div className="font-semibold text-lg">Filter by</div>
                                               {filteredProperties.length !== properties.length && (
                                                   <div className="text-xs text-gray-500 mt-1">
                                                       Showing {filteredProperties.length} of {properties.length} properties
                                                   </div>
                                               )}
                                               {/* Show active filters summary */}
                                               {(selectedRoomTypes.length > 0 || selectedBedrooms.length > 0 || selectedBathrooms.length > 0 || selectedGuests.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000) && (
                                                   <div className="text-xs text-purple-600 mt-1">
                                                       🔍 Filters: {[
                                                           selectedRoomTypes.length > 0 && `${selectedRoomTypes.length} room types`,
                                                           selectedBedrooms.length > 0 && `${selectedBedrooms.length} bedroom ranges`,
                                                           selectedBathrooms.length > 0 && `${selectedBathrooms.length} bathroom ranges`,
                                                           selectedGuests.length > 0 && `${selectedGuests.length} guest ranges`,
                                                           (priceRange[0] > 0 || priceRange[1] < 10000) && 'price range'
                                                       ].filter(Boolean).join(', ')}
                                                   </div>
                                               )}
                                           </div>
                                           <div className="flex items-center gap-2">
                                               <button 
                                                   className="text-green-500 text-sm" 
                                                   onClick={() => {
                                                       // Force re-apply filters to debug
                                                       console.log('🧪 Testing filters...');
                                                       // Trigger filter re-application
                                                       const currentFilters = {
                                                           roomTypes: selectedRoomTypes,
                                                           bedrooms: selectedBedrooms,
                                                           bathrooms: selectedBathrooms,
                                                           guests: selectedGuests,
                                                           priceRange
                                                       };
                                                       console.log('🧪 Current filters:', currentFilters);
                                                       
                                                       // Manually trigger the filter API call
                                                       console.log('🧪 Manually triggering filter API call...');
                                                       applyFiltersWithAPI();
                                                   }}
                                               >
                                                   Test
                                               </button>
                                               <button 
                                                   className="text-orange-500 text-sm ml-2" 
                                                   onClick={() => {
                                                       // Test price range filter
                                                       console.log('🧪 Testing price range filter...');
                                                       setPriceRange([3000, 10000]);
                                                       console.log('🧪 Set price range to [3000, 10000]');
                                                   }}
                                               >
                                                   Test Price
                                               </button>
                                               <button className="text-blue-500 text-sm" onClick={clearAll} disabled={isFiltering}>Clear all</button>
                                               <button className="text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setShowFilters(false)}>&times;</button>
                                           </div>
                                       </div>
                                   </div>
                                   
                                   <div className="p-4 space-y-4">
                                       {/* Room Type */}
                                       <div>
                                           <div className="font-semibold text-sm mb-2">Room Type</div>
                                           {ROOM_TYPES.map((type) => (
                                               <div key={type} className="flex items-center mb-1">
                                                   <input 
                                                       type="checkbox" 
                                                       checked={selectedRoomTypes.includes(type)} 
                                                       onChange={handleCheckbox(setSelectedRoomTypes, type)} 
                                                       className="mr-2" 
                                                       disabled={isFiltering}
                                                   />
                                                   <span className="text-sm">{type}</span>
                                               </div>
                                           ))}
                                       </div>
                                       
                                       {/* Bedrooms */}
                                       <div>
                                           <div className="font-semibold text-sm mb-2">Bedrooms</div>
                                           {BEDROOM_RANGES.map((range) => (
                                               <div key={range} className="flex items-center mb-1">
                                                   <input 
                                                       type="checkbox" 
                                                       checked={selectedBedrooms.includes(range)} 
                                                       onChange={handleCheckbox(setSelectedBedrooms, range)} 
                                                       className="mr-2" 
                                                       disabled={isFiltering}
                                                   />
                                                   <span className="text-sm">{range}</span>
                                               </div>
                                           ))}
                                       </div>
                                       
                                       {/* Bathrooms */}
                                       <div>
                                           <div className="font-semibold text-sm mb-2">Bathrooms</div>
                                           {BATHROOM_RANGES.map((range) => (
                                               <div key={range} className="flex items-center mb-1">
                                                   <input 
                                                       type="checkbox" 
                                                       checked={selectedBathrooms.includes(range)} 
                                                       onChange={handleCheckbox(setSelectedBathrooms, range)} 
                                                       className="mr-2" 
                                                       disabled={isFiltering}
                                                   />
                                                   <span className="text-sm">{range}</span>
                                               </div>
                                           ))}
                                       </div>
                                       
                                       {/* Guests */}
                                       <div>
                                           <div className="font-semibold text-sm mb-2">Guests</div>
                                           {GUEST_RANGES.map((range) => (
                                               <div key={range} className="flex items-center mb-1">
                                                   <input 
                                                       type="checkbox" 
                                                       checked={selectedGuests.includes(range)} 
                                                       onChange={handleCheckbox(setSelectedGuests, range)} 
                                                       className="mr-2" 
                                                       disabled={isFiltering}
                                                   />
                                                   <span className="text-sm">{range}</span>
                                               </div>
                                           ))}
                                       </div>
                                       
                                       {/* Price Range */}
                                       <div>
                                           <div className="font-semibold text-sm mb-2">Price range</div>
                                           <div className="flex flex-col sm:flex-row items-center justify-between mb-2 gap-2">
                                               <div className="flex items-center gap-2">
                                                   <span className="text-xs text-gray-500">Min</span>
                                                   <input
                                                       type="number"
                                                       min={0}
                                                       max={priceRange[1]}
                                                       value={priceRange[0]}
                                                                                                   onChange={e => {
                                                       const val = Math.min(Number(e.target.value), priceRange[1]);
                                                       console.log(`🔍 Desktop min price slider change: ${val}`);
                                                       setPriceRange([val, priceRange[1]]);
                                                   }}
                                                       className="w-16 px-2 py-1 border border-gray-200 rounded text-xs text-center focus:ring-2 focus:ring-yellow-400"
                                                       disabled={isFiltering}
                                                   />
                                               </div>
                                               <span className="mx-2 text-gray-400 hidden sm:inline">—</span>
                                               <div className="flex items-center gap-2">
                                                   <span className="text-xs text-gray-500">Max</span>
                                                   <input
                                                       type="number"
                                                       min={priceRange[0]}
                                                       max={10000}
                                                       value={priceRange[1]}
                                                                                                   onChange={e => {
                                                       const val = Math.max(Number(e.target.value), priceRange[0]);
                                                       console.log(`🔍 Desktop max price slider change: ${val}`);
                                                       setPriceRange([priceRange[0], val]);
                                                   }}
                                                       className="w-20 px-2 py-1 border border-gray-200 rounded text-xs text-center focus:ring-2 focus:ring-yellow-400"
                                                       disabled={isFiltering}
                                                   />
                                               </div>
                                           </div>
                                           <div className="relative flex items-center">
                                               {/* Min slider */}
                                               <input
                                                   type="range"
                                                   min={0}
                                                   max={priceRange[1]}
                                                   value={priceRange[0]}
                                                   onChange={e => {
                                                       const val = Math.min(Number(e.target.value), priceRange[1]);
                                                       console.log(`🔍 Min price slider change: ${val}`);
                                                       setPriceRange([val, priceRange[1]]);
                                                   }}
                                                   className="w-full accent-yellow-400"
                                                   style={{ zIndex: priceRange[0] > 0 ? 2 : 1 }}
                                                   disabled={isFiltering}
                                               />
                                               {/* Max slider */}
                                               <input
                                                   type="range"
                                                   min={priceRange[0]}
                                                   max={10000}
                                                   value={priceRange[1]}
                                                   onChange={e => {
                                                       const val = Math.max(Number(e.target.value), priceRange[0]);
                                                       console.log(`🔍 Max price slider change: ${val}`);
                                                       setPriceRange([priceRange[0], val]);
                                                   }}
                                                   className="w-full accent-yellow-400 absolute left-0 top-0"
                                                   style={{ zIndex: 1 }}
                                                   tabIndex={-1}
                                                   disabled={isFiltering}
                                               />
                                           </div>
                                           <div className="flex justify-between text-xs text-gray-400 mt-1">
                                               <span>$0</span>
                                               <span>$10,000</span>
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       )}
       
                       {/* Desktop Sidebar Filter Panel */}
                       {showFilters && !isLoading && !isInitialLoad && properties.length > 0 && (
                           <div className="hidden lg:block lg:relative lg:w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-6 mr-8 relative z-20">
                               <div className="flex justify-between items-center mb-4">
                                   <div>
                                   <div className="font-semibold text-lg">Filter by</div>
                                       {filteredProperties.length !== properties.length && (
                                           <div className="text-xs text-gray-500 mt-1">
                                               Showing {filteredProperties.length} of {properties.length} properties
                                           </div>
                                       )}
                                       {/* Show active filters summary */}
                                       {(selectedRoomTypes.length > 0 || selectedBedrooms.length > 0 || selectedBathrooms.length > 0 || selectedGuests.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000) && (
                                           <div className="text-xs text-purple-600 mt-1">
                                               🔍 Filters: {[
                                                   selectedRoomTypes.length > 0 && `${selectedRoomTypes.length} room types`,
                                                   selectedBedrooms.length > 0 && `${selectedBedrooms.length} bedroom ranges`,
                                                   selectedBathrooms.length > 0 && `${selectedBathrooms.length} bathroom ranges`,
                                                   selectedGuests.length > 0 && `${selectedGuests.length} guest ranges`,
                                                   (priceRange[0] > 0 || priceRange[1] < 10000) && 'price range'
                                               ].filter(Boolean).join(', ')}
                                           </div>
                                       )}
                                   </div>
                                   <div className="flex gap-2">
                                       <button 
                                           className="text-green-500 text-sm" 
                                           onClick={() => {
                                               // Force re-apply filters to debug
                                               console.log('🧪 Testing filters...');
                                               // Trigger filter re-application
                                               const currentFilters = {
                                                   roomTypes: selectedRoomTypes,
                                                   bedrooms: selectedBedrooms,
                                                   bathrooms: selectedBathrooms,
                                                   guests: selectedGuests,
                                                   priceRange
                                               };
                                               console.log('🧪 Current filters:', currentFilters);
                                               console.log('🧪 Properties to filter:', properties.length);
                                               console.log('🧪 Current filtered count:', filteredProperties.length);
                                               
                                               // Manually trigger the filter API call
                                               console.log('🧪 Manually triggering filter API call...');
                                               applyFiltersWithAPI();
                                           }}
                                       >
                                           Test
                                       </button>
                                       <button 
                                           className="text-orange-500 text-sm ml-2" 
                                           onClick={() => {
                                               // Test price range filter
                                               console.log('🧪 Testing price range filter...');
                                               setPriceRange([3000, 10000]);
                                               console.log('🧪 Set price range to [3000, 10000]');
                                           }}
                                       >
                                           Test Price
                                       </button>
                                   <button className="text-blue-500 text-sm" onClick={clearAll} disabled={isFiltering}>Clear all</button>
                                   </div>
                               </div>
                               
                               {/* Room Type */}
                               <div className="mb-4">
                                   <div className="font-semibold text-sm mb-2">Room Type</div>
                                   {ROOM_TYPES.map((type) => (
                                       <div key={type} className="flex items-center mb-1">
                                           <input 
                                               type="checkbox" 
                                               checked={selectedRoomTypes.includes(type)} 
                                               onChange={handleCheckbox(setSelectedRoomTypes, type)} 
                                               className="mr-2" 
                                               disabled={isFiltering}
                                           />
                                           <span className="text-sm">{type}</span>
                                       </div>
                                   ))}
                               </div>
                               
                               {/* Bedrooms */}
                               <div className="mb-4">
                                   <div className="font-semibold text-sm mb-2">Bedrooms</div>
                                   {BEDROOM_RANGES.map((range) => (
                                       <div key={range} className="flex items-center mb-1">
                                           <input 
                                               type="checkbox" 
                                               checked={selectedBedrooms.includes(range)} 
                                               onChange={handleCheckbox(setSelectedBedrooms, range)} 
                                               className="mr-2" 
                                               disabled={isFiltering}
                                           />
                                           <span className="text-sm">{range}</span>
                                       </div>
                                   ))}
                               </div>
                               
                               {/* Bathrooms */}
                               <div className="mb-4">
                                   <div className="font-semibold text-sm mb-2">Bathrooms</div>
                                   {BATHROOM_RANGES.map((range) => (
                                       <div key={range} className="flex items-center mb-1">
                                           <input 
                                               type="checkbox" 
                                               checked={selectedBathrooms.includes(range)} 
                                               onChange={handleCheckbox(setSelectedBathrooms, range)} 
                                               className="mr-2" 
                                               disabled={isFiltering}
                                           />
                                           <span className="text-sm">{range}</span>
                                       </div>
                                   ))}
                               </div>
                               
                               {/* Guests */}
                               <div className="mb-4">
                                   <div className="font-semibold text-sm mb-2">Guests</div>
                                   {GUEST_RANGES.map((range) => (
                                       <div key={range} className="flex items-center mb-1">
                                           <input 
                                               type="checkbox" 
                                               checked={selectedGuests.includes(range)} 
                                               onChange={handleCheckbox(setSelectedGuests, range)} 
                                               className="mr-2" 
                                               disabled={isFiltering}
                                           />
                                           <span className="text-sm">{range}</span>
                                       </div>
                                   ))}
                               </div>
                               
                               {/* Price Range */}
                               <div className="mb-4">
                                   <div className="font-semibold text-sm mb-2">Price range</div>
                                   <div className="flex flex-col sm:flex-row items-center justify-between mb-2 gap-2">
                                       <div className="flex items-center gap-2">
                                           <span className="text-xs text-gray-500">Min</span>
                                           <input
                                               type="number"
                                               min={0}
                                               max={priceRange[1]}
                                               value={priceRange[0]}
                                               onChange={e => {
                                                   const val = Math.min(Number(e.target.value), priceRange[1]);
                                                   console.log(`🔍 Mobile min price input change: ${val}`);
                                                   setPriceRange([val, priceRange[1]]);
                                               }}
                                               className="w-16 px-2 py-1 border border-gray-200 rounded text-xs text-center focus:ring-2 focus:ring-yellow-400"
                                               disabled={isFiltering}
                                           />
                                       </div>
                                       <span className="mx-2 text-gray-400 hidden sm:inline">—</span>
                                       <div className="flex items-center gap-2">
                                           <span className="text-xs text-gray-500">Max</span>
                                           <input
                                               type="number"
                                               min={priceRange[0]}
                                               max={10000}
                                               value={priceRange[1]}
                                               onChange={e => {
                                                   const val = Math.max(Number(e.target.value), priceRange[0]);
                                                   console.log(`🔍 Mobile max price input change: ${val}`);
                                                   setPriceRange([priceRange[0], val]);
                                               }}
                                               className="w-20 px-2 py-1 border border-gray-200 rounded text-xs text-center focus:ring-2 focus:ring-yellow-400"
                                               disabled={isFiltering}
                                           />
                                       </div>
                                   </div>
                                   <div className="relative flex items-center">
                                       {/* Min slider */}
                                       <input
                                           type="range"
                                           min={0}
                                           max={priceRange[1]}
                                           value={priceRange[0]}
                                                                                   onChange={e => {
                                                   const val = Math.min(Number(e.target.value), priceRange[1]);
                                                   console.log(`🔍 Mobile min price slider change: ${val}`);
                                                   setPriceRange([val, priceRange[1]]);
                                               }}
                                           className="w-full accent-yellow-400"
                                           style={{ zIndex: priceRange[0] > 0 ? 2 : 1 }}
                                           disabled={isFiltering}
                                       />
                                       {/* Max slider */}
                                       <input
                                           type="range"
                                           min={priceRange[0]}
                                           max={10000}
                                           value={priceRange[1]}
                                                                                   onChange={e => {
                                                   const val = Math.max(Number(e.target.value), priceRange[0]);
                                                   console.log(`🔍 Mobile max price slider change: ${val}`);
                                                   setPriceRange([priceRange[0], val]);
                                               }}
                                           className="w-full accent-yellow-400 absolute left-0 top-0"
                                           style={{ zIndex: 1 }}
                                           tabIndex={-1}
                                           disabled={isFiltering}
                                       />
                                   </div>
                                   <div className="flex justify-between text-xs text-gray-400 mt-1">
                                       <span>$0</span>
                                       <span>$10,000</span>
                                   </div>
                               </div>
                           </div>
                       )}
       
                       {/* Property Grid */}
                       <div className={`flex-1 transition-all duration-300 ${showFilters ? 'lg:w-2/3' : 'w-full'}`}>
                           {isLoading ? (
                               <div className="w-full text-center py-16">
                                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                                   <p className="text-gray-600">Loading properties...</p>
                               </div>
                           ) : isFiltering ? (
                               <div className="w-full text-center py-16">
                                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                                   <p className="text-gray-600">Applying filters...</p>
                               </div>
                           ) : !isInitialLoad && !isLoading && properties.length === 0 ? (
                               <div className="w-full text-center py-16">
                                   <div className="mb-4">
                                       <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                       </svg>
                                   </div>
                                   <h3 className="text-lg font-medium text-gray-900 mb-2">No properties available</h3>
                                   <p className="text-gray-500">No properties found matching your search criteria.</p>
                               </div>
                           ) : filteredProperties.length > 0 ? (
                               <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 ${showFilters ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
                                   {paginatedProperties.map((property) => (
                                       <PropertyCard key={property.id} property={property} searchId={searchId} />
                                   ))}
                               </div>
                           ) : (
                               <div className="w-full text-center py-16">
                                   <div className="mb-4">
                                       <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                       </svg>
                                   </div>
                                   <h3 className="text-lg font-medium text-gray-900 mb-2">No properties match your filters</h3>
                                   <p className="text-gray-500">Try adjusting your filter criteria or clear all filters to see all properties.</p>
                                   <button 
                                       onClick={clearAll}
                                       className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                   >
                                       Clear All Filters
                                   </button>
                               </div>
                           )}
                       </div>
                   </div>
       
                   {/* Pagination */}
                   {!isLoading && !isInitialLoad && properties.length > 0 && totalPages > 1 && (
                       <div className="flex justify-center my-16 mb-20 sm:my-16 lg:my-20 px-4 sm:px-6 lg:px-8">
                           <nav className="flex items-center gap-2 sm:gap-4">
                               {/* Left Arrow */}
                               <button
                                   className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border text-sm sm:text-base ${currentPage === 1 ? 'border-blue-100 text-blue-200 cursor-not-allowed' : 'border-blue-100 text-blue-500 hover:bg-blue-50'}`}
                                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                   disabled={currentPage === 1}
                               >
                                   &larr;
                               </button>
                               {/* Page Numbers */}
                               {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                   <button
                                       key={page}
                                       className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-blue-100 text-blue-500 font-semibold text-xs sm:text-sm ${currentPage === page ? 'bg-yellow-400 text-white' : 'bg-white hover:bg-blue-50'}`}
                                       onClick={() => setCurrentPage(page)}
                                   >
                                       {page.toString().padStart(2, '0')}
                                   </button>
                               ))}
                               {/* Right Arrow */}
                               <button
                                   className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border text-sm sm:text-base ${currentPage === totalPages ? 'border-blue-100 text-blue-200 cursor-not-allowed' : 'border-blue-100 text-blue-500 hover:bg-blue-50'}`}
                                   onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                   disabled={currentPage === totalPages}
                               >
                                   &rarr;
                               </button>
                           </nav>
                       </div>
                   )}

               </>

               ) : (
                <Properties_list />
               )
            }
        </>
    )
}

