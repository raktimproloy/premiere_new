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

  console.log("property",property)

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
    applyDate:property?.createdAt || "10-08-2025"
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
                          {/* <tr>
                            <td className="font-medium text-gray-700 py-1 pr-4 whitespace-nowrap">Extra Services:</td>
                            <td className="text-gray-500 py-1 whitespace-nowrap">{mockBooking.property.extraServices}</td>
                          </tr> */}
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