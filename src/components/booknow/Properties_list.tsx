// components/PropertiesList.tsx
'use client'
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { BathroomIcon, BedIcon, GuestIcon, LocationFillIcon, LocationIcon } from '../../../public/images/svg';
import PropertyCard from '../common/card/PropertyCard';
import SearchForm from './SearchForm';

interface Property {
  id: number;
  name: string;
  address: {
    street1: string;
    city: string;
    state: string;
    country: string;
  };
  thumbnail_url: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  property_type: string;
  [key: string]: any;
}

interface PaginationInfo {
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
}

const PropertiesListSection = ({title = true}: {title?: boolean}) => {
  console.log(title)
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 9,
    hasMore: false,
    totalPages: 1
  });
  const [totalProperties, setTotalProperties] = useState(0);

  // Fetch initial properties
  useEffect(() => {
    fetchProperties(1);
  }, []);

  // Function to fetch properties with pagination
  const fetchProperties = async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`/api/properties/cache?page=${page}&limit=6`);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      const data = await response.json();
      
      if (data.success && data.properties) {
        if (append) {
          // Append to existing properties
          setProperties(prev => [...prev, ...data.properties]);
        } else {
          // Replace properties
          setProperties(data.properties);
        }
        
        // Update pagination info
        if (data.pagination) {
          setPagination(data.pagination);
        }
        
        // Update total properties count
        setTotalProperties(data.totalProperties || 0);
      } else {
        throw new Error(data.error || 'Failed to fetch properties');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle load more button click
  const handleLoadMore = () => {
    const nextPage = pagination.page + 1;
    fetchProperties(nextPage, true);
  };

  if (loading) {
    return (
      <section className="py-6 md:py-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {title && (
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 sm:mb-10 md:mb-12">
            <div className="mb-6 lg:mb-0 w-full lg:w-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                Explore Our Properties
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-xl">
                Discover amazing properties that match your needs.
              </p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                <div className="h-48 sm:h-56 md:h-64 bg-gray-200 rounded-t-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Properties
            </h2>
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#F7B730] text-black font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 hover:bg-[#e6a825] hover:shadow-xl active:scale-95"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with property count */}
        {title && (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 sm:mb-10 md:mb-12">
          <div className="mb-6 lg:mb-0 w-full lg:w-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Explore Our Properties
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl">
              Discover amazing properties that match your needs. 
              {totalProperties > 0 && (
                <span className="font-semibold text-gray-900"> {totalProperties} properties available</span>
              )}
            </p>
          </div>
        </div>
        )}
        {/* Property Cards Grid */}
        {properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} showPrice={false} />
              ))}
            </div>

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="flex justify-center mt-10 sm:mt-12 md:mt-16">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="group relative bg-[#F7B730] text-black font-bold py-4 px-8 sm:px-12 rounded-full shadow-lg transition-all duration-300 hover:bg-[#e6a825] hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {loadingMore ? (
                    <>
                      <svg 
                        className="animate-spin h-5 w-5" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Properties</span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 transition-transform group-hover:translate-y-1" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Showing count info */}
            {/* <div className="text-center mt-6 text-sm text-gray-600">
              Showing {properties.length} of {totalProperties} properties
            </div> */}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No properties available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertiesListSection;