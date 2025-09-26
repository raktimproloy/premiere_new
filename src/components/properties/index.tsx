'use client'
import React, { useState, useEffect } from 'react'
import { BathroomIcon, BedIcon, GuestIcon, LocationFillIcon, PropertyIcon2 } from '../../../public/images/svg';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';
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
    const id = props.id || (params?.id as string);
    
    // Property data state
    const [property, setProperty] = useState<any>(null);
    const [propertyLoading, setPropertyLoading] = useState(true);
    const [propertyError, setPropertyError] = useState<string | null>(null);

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

          {/* Right: Property Info */}
          <div className="w-full lg:w-2/5 flex flex-col">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property?.name || 'Property Details'}</h1>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <span className='mr-2 bg-[#586DF71A] p-2 rounded-full'><LocationFillIcon /></span>
                {property?.address ? `${property.address.city}, ${property.address.state}, ${property.address.country}` : 'Location not available'}
              </div>
              

              {/* Property Services */}
              {(property?.services && property.services.length > 0) && (
                <div className="mb-6">
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
              )}

              {/* Property Amenities */}
              {(property?.localData?.amenities && property.localData.amenities.length > 0) && (
                <div className="mb-6">
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
