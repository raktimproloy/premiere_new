'use client'
import Image from 'next/image'
import React from 'react'
import { BathroomIcon, GuestIcon, LocationFillIcon } from '../../../../public/images/svg'
import { BedIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../LoadingSpinner';

export default function PropertyCard({property, searchId, showPrice = true}: {property: any, searchId?: string | null, showPrice?: boolean}) {
  console.log('PropertyCard received:', {
    id: property.id,
    title: property.title,
    price: property.price,
    pricing: property.pricing ? {
      hasPricing: !!property.pricing.pricing,
      hasSummary: !!property.pricing.summary,
      totalAmount: property.pricing.summary?.totalAmount,
      structure: Object.keys(property.pricing)
    } : 'No pricing data',
    pricingLoading: property.pricingLoading,
    pricingError: property.pricingError
  });
  const router = useRouter();

  // Pricing skeleton component
  const PricingSkeleton = () => (
    <div className="flex justify-between items-center">
      <div className='flex items-center'>
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div 
      onClick={() => {
        if (showPrice) {
          router.push(`/book-now/${property.id}${searchId ? `?id=${searchId}` : ''}`);
        } else {
          router.push(`/properties/${property.id}`);
        }
      }}
      key={property.id}
      className="bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      {/* Property Image with Badge */}
      <div className="relative h-48 sm:h-56 md:h-64">
        <div className="absolute inset-0">
            <Image src={property.thumbnail_url_large || property.image} alt={property.name || property.title} width={1000} height={1000} className="w-full h-full object-cover rounded-t-xl" />
        </div>
        
        {/* Badge */}
        <div className="absolute top-3 sm:top-4 left-0 flex items-center z-20">
          <div className="relative flex items-center h-6 sm:h-8">
            <div className="absolute -left-2 bg-[#586DF7] text-white font-bold px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs  flex items-center h-6 sm:h-8 z-10 whitespace-nowrap">
              {property.badge || "FOR RENT"}
            </div>
            <span className="absolute -left-2 top-4.5 sm:top-6 block w-0 h-0 border-t-6 sm:border-t-8 border-b-6 sm:border-b-8 border-r-8 sm:border-r-10 border-t-transparent border-b-transparent text-[#6C81FF] border-l-[#6C81FF] z-5"></span>
            
          </div>
        </div>
        
        {/* Glass Effect Features Panel */}
        <div className="absolute w-[90%] border-2 border-[#F2F2F23D] mx-auto bottom-2 sm:bottom-3 left-0 right-0 bg-white/10 backdrop-blur-md py-2 sm:py-3 px-3 sm:px-4 rounded-full">
          <div className="flex justify-between text-white text-xs sm:text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5">
                <BedIcon className="w-full h-full" />
              </div>
              <span className="ml-1">{property.bedrooms || property.beds} Beds</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5">
                <BathroomIcon />
              </div>
              <span className="ml-1">{property.bathrooms || property.bathrooms_full} Bath</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5">
                <GuestIcon />
              </div>
              <span className="ml-1">{property.max_guests || property.guests} Guests</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Property Details */}
      <div className="p-4 sm:p-5 md:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {property.name || property.title}
        </h3>
        <p className={`text-gray-600 mb-3 sm:mb-4 flex items-start text-sm sm:text-base border-gray-200 pb-3 ${showPrice ? 'border-b' : ''}`}>
          <span className='mr-2 bg-[#586DF71A] p-1.5 sm:p-2 rounded-full flex-shrink-0'>
            <span className="w-3 h-3 sm:w-4 sm:h-4">
              <LocationFillIcon />
            </span>
          </span>
          <span className="line-clamp-2">
            {property.address ? 
              `${property.address.street1 || ''} ${property.address.city || ''} ${property.address.state || ''} ${property.address.country || ''}`.trim() :
              property.location
            }
          </span>
        </p>
        
        {/* Pricing and Rating - Only show if showPrice is true */}
        {showPrice && (
          <div className="flex justify-between items-center">
            <div className='flex items-center'>
              {/* Show pricing based on state */}
              {property.pricingLoading ? (
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : property.pricingError ? (
                <div className="text-sm text-red-500">Pricing unavailable</div>
              ) : property.pricing ? (
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  ${property.pricing.summary?.totalAmount?.toFixed(2) || property.price?.toFixed(2) || '0.00'}
                </div>
              ) : property.price && property.price > 0 ? (
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  ${property.price.toFixed(2)}
                </div>
              ) : (
                <div className="text-sm text-gray-400">Price on request</div>
              )}
              <div className="text-gray-400 text-sm sm:text-base"></div>
            </div>
            {/* <div className="text-right">
              <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                  <span>
                  <svg  
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 sm:h-5 sm:w-5 text-yellow-400`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  </span>
                  <span className='text-black font-bold mx-1'>
                      4.9
                  </span>
                  <span className="hidden sm:inline">({property.reviews || 0} Reviews)</span>
                  <span className="sm:hidden">({property.reviews || 0})</span>
              </div>
              
            </div> */}
          </div>
        )}
      </div>
    </div>
  )
}
