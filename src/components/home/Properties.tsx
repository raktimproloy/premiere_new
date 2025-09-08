// components/FeaturedPropertiesSection.tsx
'use client'
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { BathroomIcon, BedIcon, GuestIcon, LocationFillIcon, LocationIcon } from '../../../public/images/svg';
import PropertyCard from '../common/card/PropertyCard';

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

const FeaturedPropertiesSection = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/properties/cache');
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        
        if (data.success && data.properties) {
          // Take only the first 3 properties for featured section
          setProperties(data.properties.slice(0, 3));
        } else {
          throw new Error(data.error || 'Failed to fetch properties');
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 sm:mb-10 md:mb-12">
            <div className="mb-6 lg:mb-0 w-full lg:w-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                Explore Our Featured Properties
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-xl">
                Properties that combine exceptional style, prime locations & outstanding value.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
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
              Explore Our Featured Properties
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
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with button on right */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 sm:mb-10 md:mb-12">
          <div className="mb-6 lg:mb-0 w-full lg:w-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Explore Our Featured Properties
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl">
              Properties that combine exceptional style, prime locations & outstanding value.
            </p>
          </div>
          {/* <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-full sm:w-auto flex items-center justify-center bg-[#F7B730] text-black font-bold py-3 px-4 sm:px-6 rounded-full shadow-lg transition-all duration-300 hover:bg-[#e6a825] hover:shadow-xl active:scale-95 text-sm sm:text-base"
          >
            <span>Discover More</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button> */}
        </div>

        {/* Property Cards Grid */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} showPrice={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No properties available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedPropertiesSection;