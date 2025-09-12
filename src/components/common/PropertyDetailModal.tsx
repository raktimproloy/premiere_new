'use client';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { FiX, FiEdit, FiUser, FiHome, FiCalendar, FiCreditCard } from 'react-icons/fi';
import { formatDateForDisplay } from '@/utils/dateUtils';

interface Property {
  id: string;
  name: string;
  type: string;
  bathrooms: number;
  bedrooms: number;
  capacity: string;
  price: string;
  status: 'Pending' | 'Occupied' | 'Active';
  listingDate: string;
  services?: Array<{name: string, price: string}>;
  owner?: {
    name: string;
    email: string;
    phone: string;
  };
  booking?: {
    arrival?: string;
    departure?: string;
    guestId?: number;
    propertyId?: number;
    createdUtc?: string;
    updatedUtc?: string;
  };
}

interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | any;
  editUrl?: string;
  editLabel?: string;
  editActive?: boolean;
  onEditClick?: () => void;
  footerActions?: Array<{
    label: string;
    active?: boolean;
    onClick?: () => void;
    color?: string;
  }>;
}

const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  isOpen,
  onClose,
  property,
  editUrl = '',
  editLabel = 'You can edit property',
  editActive = true,
  onEditClick,
  footerActions = [
    { label: 'Reject', active: true, color: '#FF4545' },
    { label: 'Approved', active: true, color: '#40C557' },
  ],
}) => {

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Mock booking data for demonstration
  const mockBooking = {
    person: {
      name: property?.owner?.name || "",
      email: property?.owner?.email || "",
      phone: property?.owner?.phone || ""
    },
    images: property?.images || [],
    property: {
      name: property?.name || "",
      location: property?.address?.street1 || "",
      bathrooms: `${property?.bathrooms || 0} Bathroom`,
      bedrooms: `${property?.bedrooms || 0} Bedroom`,
      type: property?.type || "",
      capacity: property?.capacity || "",
      price: property?.price || ""
    },
    applyDate: property?.createdAt || property?.listingDate || "10-08-2025",
    // Add booking-specific information
    booking: property?.booking || null
  };

  if (!isOpen || !property) return null;

  return (
    <>
      {/* Backdrop with fade effect */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-2 sm:pl-10">
            {/* Modal Panel */}
            <div className={`pointer-events-auto w-screen max-w-3xl transform transition ease-in-out duration-300 ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
              <div className="flex h-full flex-col bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={onClose}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <img src="/images/icons/back.svg" alt="close" className="h-5 w-5" />
                    </button>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Booking Details</h2>
                  </div>
                  {editUrl && (
                    <Link
                      href={editUrl}
                      onClick={editActive && onEditClick ? onEditClick : undefined}
                      className={`flex items-center space-x-2 text-xs sm:text-sm px-3 sm:px-4 cursor-pointer py-2 rounded-full ${editActive ? 'bg-[#4581FF] text-white' : 'bg-gray-300 text-gray-400 cursor-not-allowed pointer-events-none'}`}
                    >
                      <span>{editLabel}</span>
                      <FiEdit className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="px-3 sm:px-6 py-6">
                    {/* Property Images */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
                      {mockBooking.images.map((image: any, index: number) => (
                        <div key={index} className="aspect-square rounded-2xl overflow-hidden">
                          <img src={image.url} alt="property" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>

                    {/* Person Details Section */}
                    <div className="mb-6 overflow-x-auto">
                      <table className="w-full border-collapse text-xs sm:text-md min-w-[320px]">
                        <tbody>
                          <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Person Name:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.person.name}</td>
                          </tr>
                          <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Person Email ID:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.person.email}</td>
                          </tr>
                          <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Person Phone:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.person.phone}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-300 my-6"></div>

                    {/* Booking Details Section - Only show if booking data exists */}
                    {mockBooking.booking && (
                      <>
                        <div className="mb-6 overflow-x-auto">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                            Booking Details
                          </h3>
                          <table className="w-full border-collapse text-xs sm:text-md min-w-[320px]">
                            <tbody>
                              <tr>
                                <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Booking ID:</td>
                                <td className="text-gray-500 py-1 whitespace-nowrap">{property.id}</td>
                              </tr>
                              {mockBooking.booking.arrival && (
                                <tr>
                                  <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Arrival Date:</td>
                                  <td className="text-gray-500 py-1 whitespace-nowrap">{formatDateForDisplay(mockBooking.booking.arrival)}</td>
                                </tr>
                              )}
                              {mockBooking.booking.departure && (
                                <tr>
                                  <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Departure Date:</td>
                                  <td className="text-gray-500 py-1 whitespace-nowrap">{formatDateForDisplay(mockBooking.booking.departure)}</td>
                                </tr>
                              )}
                              {mockBooking.booking.guestId && (
                                <tr>
                                  <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Guest ID:</td>
                                  <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.booking.guestId}</td>
                                </tr>
                              )}
                              {mockBooking.booking.propertyId && (
                                <tr>
                                  <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Property ID:</td>
                                  <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.booking.propertyId}</td>
                                </tr>
                              )}
                              {mockBooking.booking.createdUtc && (
                                <tr>
                                  <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Created:</td>
                                  <td className="text-gray-500 py-1 whitespace-nowrap">{formatDateForDisplay(mockBooking.booking.createdUtc)}</td>
                                </tr>
                              )}
                              {mockBooking.booking.updatedUtc && (
                                <tr>
                                  <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Last Updated:</td>
                                  <td className="text-gray-500 py-1 whitespace-nowrap">{formatDateForDisplay(mockBooking.booking.updatedUtc)}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Divider */}
                        <div className="border-t border-dashed border-gray-300 my-6"></div>
                      </>
                    )}

                    {/* Services Section */}
                    {property?.services && property.services.length > 0 && (
                      <>
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                            Property Services
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {property.services.map((service: any, index: number) => (
                              <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-sm font-bold">
                                        {service.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-800">{service.name}</h4>
                                      <p className="text-sm text-gray-600">
                                        {parseFloat(service.price) === 0 ? 'Complimentary service' : 'Additional service'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                      parseFloat(service.price) === 0 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {parseFloat(service.price) === 0 ? 'FREE' : `$${service.price}`}
                                    </div>
                                    {parseFloat(service.price) > 0 && (
                                      <p className="text-xs text-gray-500 mt-1">per service</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">Total Services Available:</span>
                              <span className="font-bold text-blue-600">{property.services.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="font-medium text-gray-700">Free Services:</span>
                              <span className="font-bold text-green-600">
                                {property.services.filter((s: any) => parseFloat(s.price) === 0).length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="font-medium text-gray-700">Paid Services:</span>
                              <span className="font-bold text-blue-600">
                                {property.services.filter((s: any) => parseFloat(s.price) > 0).length}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Divider */}
                        <div className="border-t border-dashed border-gray-300 my-6"></div>
                      </>
                    )}

                    {/* Property Details Section */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs sm:text-md min-w-[320px]">
                        <tbody>
                          <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Property Name:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.property.name}</td>
                          </tr>
                          <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Property Location:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.property.location}</td>
                          </tr>
                          <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Bathroom:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.property.bathrooms}</td>
                          </tr>
                          <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Bedroom:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.property.bedrooms}</td>
                          </tr>
                          <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Type:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.property.type}</td>
                          </tr>
                          <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Capacity:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.property.capacity}</td>
                          </tr>
                          <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Services:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">
                              {property?.services && property.services.length > 0 ? (
                                <div className="space-y-2">
                                  {property.services.map((service: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="font-medium text-gray-700">{service.name}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          parseFloat(service.price) === 0 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-blue-100 text-blue-800'
                                        }`}>
                                          {parseFloat(service.price) === 0 ? 'Free' : `$${service.price}`}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="mt-2 text-xs text-gray-500">
                                    Total Services: {property.services.length}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2 text-gray-400">
                                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                  <span>No services available</span>
                                </div>
                              )}
                            </td>
                          </tr>
                          {/* <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Price:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.property.price}</td>
                          </tr> */}
                          {/* <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Payment Method:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.paymentMethod}</td>
                          </tr> */}
                          <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Apply Date:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{formatDateForDisplay(mockBooking.applyDate)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Footer with Action Buttons */}
                <div className="border-t border-gray-200 px-4 sm:px-6 py-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {footerActions.map((action, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`flex-1 px-4 py-2 rounded-full text-sm font-medium text-white transition-colors cursor-pointer ${
                          action.active !== false
                            ? ''
                            : 'bg-gray-300 text-gray-400 cursor-not-allowed pointer-events-none'
                        }`}
                        style={{ backgroundColor: action.active !== false ? (action.color || '#586DF7') : undefined }}
                        onClick={action.onClick}
                        disabled={action.active === false}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyDetailModal; 