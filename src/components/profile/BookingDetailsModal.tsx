import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaStar, FaTimes } from 'react-icons/fa';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: any;
}

const dummyProperty = {
  name: 'Wynwood Townhomes w/Heated Pools',
  location: 'Miami, Miami-Dade County, Florida, United States',
  bedrooms: 4,
  bathrooms: 6,
  type: 'Cabin',
  capacity: '4 Guests',
  payment: 'Credit Card',
  services: ['Breakfast', 'Lunch', 'Dinner'],
  price: 175,
  rating: 4.9,
  reviews: 28,
  applyDate: '10-10-2025',
  checkIn: 'N/A',
  checkOut: 'N/A',
  guests: 1,
  nights: 1,
  status: 'N/A',
  images: [
    '/images/property.png',
    '/images/property.png',
    '/images/property.png',
    '/images/property.png',
  ],
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem in velit sed enim pharetra aliquet. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, nec dictum ex enim euismod enim. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, nec dictum ex enim euismod enim.',
};

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose, property }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Map the actual booking data structure to the expected format
  const data = property ? {
    name: property.propertyName || property.title || property.name,
    location: property.location || 'Location not available',
    bedrooms: property.bedroom || property.bedrooms || 'N/A',
    bathrooms: property.bathroom || property.bathrooms || 'N/A',
    type: property.type || 'N/A',
    capacity: property.capacity || `${property.guests || 1} Guests`,
    payment: property.payment || 'Credit Card',
    services: property.services || [],
    price: property.totalAmount || property.price || 0,
    rating: property.rating || 4.5,
    reviews: property.reviews || 3400,
    applyDate: property.bookingDate || property.applyDate || 'N/A',
    checkIn: property.checkIn || 'N/A',
    checkOut: property.checkOut || 'N/A',
    guests: property.guests || 1,
    nights: property.nights || 1,
    status: property.status || 'N/A',
    images: property.images || [
      '/images/property.png',
      '/images/property.png',
      '/images/property.png',
      '/images/property.png',
    ],
    description: property.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem in velit sed enim pharetra aliquet. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, nec dictum ex enim euismod enim. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, nec dictum ex enim euismod enim.',
  } : dummyProperty;

  // Close on Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm">
      {/* Modal Panel */}
      <div
        ref={modalRef}
        className="relative bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-fadeIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <FaTimes className="h-5 w-5" />
            </button>
            <span className="text-lg font-semibold text-gray-900">Booking Details</span>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Images Carousel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
            {data.images.map((img: string, idx: number) => (
              <div key={idx} className="aspect-square rounded-2xl overflow-hidden">
                <Image src={img} alt="property" width={200} height={200} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
          {/* Property Details Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Property Name:</span>
              <span className="text-gray-500">{data.name}</span>
              <span className="font-medium text-gray-700 mt-2">Property Location:</span>
              <span className="text-gray-500">{data.location}</span>
              <span className="font-medium text-gray-700 mt-2">Check-in Date:</span>
              <span className="text-gray-500">{data?.checkIn || 'N/A'}</span>
              <span className="font-medium text-gray-700 mt-2">Check-out Date:</span>
              <span className="text-gray-500">{data?.checkOut || 'N/A'}</span>
              <span className="font-medium text-gray-700 mt-2">Number of Guests:</span>
              <span className="text-gray-500">{data?.guests || 'N/A'}</span>
              <span className="font-medium text-gray-700 mt-2">Number of Nights:</span>
              <span className="text-gray-500">{data?.nights || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Booking Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block w-fit ${
                data.status === 'Approved' ? 'bg-green-500 text-white' :
                data.status === 'Pending' ? 'bg-yellow-400 text-yellow-900' :
                data.status === 'Cancelled' ? 'bg-red-500 text-white' :
                data.status === 'Completed' ? 'bg-green-400 text-white' :
                'bg-gray-500 text-white'
              }`}>{data.status}</span>
              <span className="font-medium text-gray-700 mt-2">Total Amount:</span>
              <span className="text-gray-500">${data.price.toFixed(2)}</span>
              <span className="font-medium text-gray-700 mt-2">Booking Date:</span>
              <span className="text-gray-500">{data.applyDate}</span>
              <span className="font-medium text-gray-700 mt-2">Payment Method:</span>
              <span className="text-gray-500">{data.payment}</span>
              <span className="font-medium text-gray-700 mt-2">Extra Services:</span>
              <span className="text-gray-500">{data.services.length > 0 ? data.services.join(', ') : 'None'}</span>
            </div>
          </div>
          {/* Description */}
          <div className="mt-6">
            <span className="font-medium text-gray-700 block mb-2">Description</span>
            <div className="bg-gray-50 border rounded-lg p-4 max-h-40 overflow-y-auto text-gray-600 text-sm">
              {data.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal; 