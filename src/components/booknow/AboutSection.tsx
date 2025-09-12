'use client'
import React, { useState } from 'react';

interface Property {
  id?: number;
  name?: string;
  description?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  bathrooms_full?: number;
  bathrooms_half?: number;
  max_guests?: number;
  max_pets?: number;
  check_in?: string;
  check_out?: string;
  address?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  localData?: {
    description?: string;
    amenities?: Array<{
      id: string;
      name: string;
      category: string;
      icon?: string;
    }>;
    rules?: Array<{
      id: string;
      name: string;
      description?: string;
      isAllowed: boolean;
    }>;
    policies?: {
      cancellationPolicy?: string;
      houseRules?: string[];
      petPolicy?: string;
      smokingPolicy?: string;
    };
    owner?: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    availability?: {
      checkInTime?: string;
      checkOutTime?: string;
      minStay?: number;
      maxStay?: number;
    };
  };
}

const AboutSection = ({ property }: { property: Property | null }) => {
  const [activeTab, setActiveTab] = useState('about');
  
  const tabs = [
    { id: 'about', label: 'ABOUT THIS LISTING' },
    { id: 'details', label: 'DETAILS' },
    { id: 'features', label: 'FEATURES' },
    { id: 'terms', label: 'TERMS & RULES' },
    // { id: 'contact', label: 'CONTACT THE HOST' },
  ];

  // Helper functions to get property data with fallbacks
  const getPropertyName = () => property?.name || 'Property';
  
  const getPropertyDescription = () => {
    return property?.localData?.description || 
           property?.description || 
           'Experience a comfortable and well-appointed stay at this beautiful property. Our space is designed to provide you with all the amenities and comfort you need for a memorable visit.';
  };

  const getPropertyType = () => {
    return property?.property_type || 'Private Room / Apartment';
  };

  const getBedrooms = () => {
    return property?.bedrooms || 'N/A';
  };

  const getBathrooms = () => {
    if (property?.bathrooms_full && property?.bathrooms_half) {
      return `${property.bathrooms_full} Full, ${property.bathrooms_half} Half Baths`;
    }
    return property?.bathrooms ? `${property.bathrooms} Bathrooms` : 'N/A';
  };

  const getMaxGuests = () => {
    return property?.max_guests ? `${property.max_guests}+ Guests` : 'N/A';
  };

  const getCheckInTime = () => {
    return property?.localData?.availability?.checkInTime || 
           property?.check_in || 
           '3:00 PM';
  };

  const getCheckOutTime = () => {
    return property?.localData?.availability?.checkOutTime || 
           property?.check_out || 
           '11:00 AM';
  };

  const getAmenities = () => {
    if (property?.localData?.amenities && property.localData.amenities.length > 0) {
      return property.localData.amenities.map(amenity => amenity.name);
    }
    // Default amenities if none provided
    return [
      'High-Speed WiFi',
      'Air Conditioning',
      'Fully Equipped Kitchen',
      'Luxury Bathrooms',
      'Spacious Living Areas',
      'Secure Parking'
    ];
  };

  const getHouseRules = () => {
    if (property?.localData?.policies?.houseRules && property.localData.policies.houseRules.length > 0) {
      return property.localData.policies.houseRules;
    }
    // Default house rules
    return [
      'No parties or events without prior approval',
      'No smoking inside the property',
      'Pets allowed with prior approval (additional fee applies)',
      'Quiet hours from 10:00 PM to 8:00 AM',
      'Maximum occupancy must not exceed the number of booked guests'
    ];
  };

  const getCancellationPolicy = () => {
    return property?.localData?.policies?.cancellationPolicy || 
           'Free cancellation up to 30 days before check-in. 50% refund if canceled between 15-30 days before check-in. No refund if canceled less than 15 days before check-in.';
  };

  const getSmokingPolicy = () => {
    return property?.localData?.policies?.smokingPolicy || 
           'Smoking is allowed outside only. Smoking of any substance is not allowed in the apartment. Guest will be held responsible for all damage caused by smoking including, but not limited to, stains, burns, odors, and removal of debris.';
  };

  const getPetPolicy = () => {
    return property?.localData?.policies?.petPolicy || 
           'Pets are welcome with prior approval. Additional cleaning fees may apply. Please inform us about your pet when booking.';
  };

  const getOwnerInfo = () => {
    if (property?.localData?.owner) {
      return {
        name: property.localData.owner.name,
        email: property.localData.owner.email,
        phone: property.localData.owner.phone
      };
    }
    // Default owner info
    return {
      name: 'Property Host',
      email: 'contact@premierestays.com',
      phone: '+1 (555) 123-4567'
    };
  };

  const getLocationInfo = () => {
    if (property?.address) {
      const { city, state, country } = property.address;
      return `${city || 'Miami'}, ${state || 'FL'}, ${country || 'USA'}`;
    }
    return 'Miami, FL, USA';
  };

  return (
    <section className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 my-8 sm:my-10">
      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center items-center mb-6 sm:mb-8 relative gap-2">
        {tabs.map((tab) => (
          <div key={tab.id} className="relative flex flex-col items-center">
            <button
              className={`px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 rounded-full font-semibold text-xs sm:text-sm md:text-base transition-colors duration-200 focus:outline-none cursor-pointer whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
            {activeTab === tab.id && (
              <span className="w-0 h-0 border-l-6 sm:border-l-8 border-r-6 sm:border-r-8 border-t-6 sm:border-t-8 border-l-transparent border-r-transparent border-t-blue-600 absolute top-full"></span>
            )}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === 'about' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 border-b border-gray-200 pb-3 sm:pb-4">About this listing</h2>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">About this space</h3>
            <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
              <p>
                {getPropertyDescription()}
              </p>
              
              {/* Location Info */}
              {property?.address && (
                <p className="text-blue-600 font-medium">
                  Located in {getLocationInfo()}
                </p>
              )}
              
              <div className="pt-3 sm:pt-4 mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Smoking Policy</h3>
                <p>
                  {getSmokingPolicy()}
                </p>
              </div>
              
              <div className="pt-3 sm:pt-4 mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Pet Policy</h3>
                <p>
                  {getPetPolicy()}
                </p>
              </div>
              
              <div className="pt-3 sm:pt-4 mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Guest access</h3>
                <p>
                  Feel free to come and go as you please. We provide all necessary access information 
                  and will assist you with any questions about the property or local area.
                </p>
                <p className="mt-2">
                  Upon checkout: please ensure all doors are locked and keys are returned as instructed. 
                  Failure to follow checkout procedures may result in additional fees.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'details' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Property Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Basic Information</h3>
                <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                  <li className="flex flex-col sm:flex-row">
                    <span className="font-medium w-full sm:w-32 mb-1 sm:mb-0">Property Type:</span>
                    <span>{getPropertyType()}</span>
                  </li>
                  <li className="flex flex-col sm:flex-row">
                    <span className="font-medium w-full sm:w-32 mb-1 sm:mb-0">Accommodates:</span>
                    <span>{getMaxGuests()}</span>
                  </li>
                  <li className="flex flex-col sm:flex-row">
                    <span className="font-medium w-full sm:w-32 mb-1 sm:mb-0">Bedrooms:</span>
                    <span>{getBedrooms()} {getBedrooms() !== 'N/A' ? 'Bedrooms' : ''}</span>
                  </li>
                  <li className="flex flex-col sm:flex-row">
                    <span className="font-medium w-full sm:w-32 mb-1 sm:mb-0">Bathrooms:</span>
                    <span>{getBathrooms()}</span>
                  </li>
                  {property?.max_pets !== undefined && (
                    <li className="flex flex-col sm:flex-row">
                      <span className="font-medium w-full sm:w-32 mb-1 sm:mb-0">Max Pets:</span>
                      <span>{property.max_pets} {property.max_pets === 0 ? 'No pets allowed' : 'Pets allowed'}</span>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Amenities</h3>
                <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                  {getAmenities().slice(0, 6).map((amenity, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500">✓</div>
                      <span>{amenity}</span>
                    </li>
                  ))}
                  {getAmenities().length > 6 && (
                    <li className="text-gray-500 text-sm">
                      +{getAmenities().length - 6} more amenities
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'features' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Property Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {getAmenities().map((feature, index) => (
                <div key={index} className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-600">✓</div>
                  <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'terms' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Terms & Rules</h2>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Check-in/Check-out</h3>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-gray-700 text-sm sm:text-base">
                  <li>Check-in: After {getCheckInTime()}</li>
                  <li>Check-out: Before {getCheckOutTime()}</li>
                  <li>Early check-in/late check-out may be available upon request</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Cancellation Policy</h3>
                <div className="text-gray-700 text-sm sm:text-base">
                  <p>{getCancellationPolicy()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">House Rules</h3>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-gray-700 text-sm sm:text-base">
                  {getHouseRules().map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'contact' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Contact the Host</h2>
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                  <span className="text-gray-500 text-lg font-bold">
                    {getOwnerInfo().name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="font-bold text-base sm:text-lg">{getOwnerInfo().name}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Property Host · Available 24/7</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                I'm available 24/7 to ensure you have a perfect stay. Feel free to reach out with any questions 
                about the property, neighborhood, or your upcoming visit.
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Type your message here"
                  ></textarea>
                </div>
                
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-300 text-sm sm:text-base">
                  Send Message
                </button>
              </div>
              
              {/* Contact Information */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Direct Contact</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Email: {getOwnerInfo().email}</p>
                  {getOwnerInfo().phone && <p>Phone: {getOwnerInfo().phone}</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;