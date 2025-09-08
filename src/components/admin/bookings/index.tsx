'use client';
import React, { useState, useEffect } from 'react';
import { FiEye, FiPlus, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import PropertyDetailModal from '@/components/common/PropertyDetailModal';
import Link from 'next/link';

// Define Property interface locally for modal compatibility
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

interface BookingRequest {
  id: string;
  personName: string;
  email: string;
  phone: string;
  propertyName: string;
  type: string;
  status: 'Pending' | 'Occupied';
  applyDate: string;
  price: string;
}

const Bookings = () => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BookingRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationLoading, setPaginationLoading] = useState(false);
  console.log(requests)
  const itemsPerPage = 8;

  // Fetch bookings from API with pagination
  const fetchBookings = async (offset: number = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const limit = 8;
      const sinceDate = '2024-01-01T00:00:00Z';
      
      const response = await fetch(`/api/bookings/all?limit=${limit}&offset=${offset}&since=${sinceDate}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch bookings');
      }
      
      const data = await response.json();
      
      if (data.bookings) {
        setRequests(data.bookings);
        setFilteredRequests(data.bookings);
        
        // Update total bookings from the API response
        const total = data.pagination?.total || data.bookings.length;
        setTotalBookings(total);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(currentOffset);
  }, [currentOffset]);

  // Filter requests based on status
  useEffect(() => {
    let result = [...requests];
    if (statusFilter !== 'active') {
      result = result.filter(request => request.status === statusFilter);
    }
    setFilteredRequests(result);
  }, [statusFilter, requests]);

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-[#F7B730] text-white';
      case 'Occupied':
        return 'bg-[#586DF7] text-white';
      case 'Approved':
        return 'bg-green-500 text-white';
      case 'Cancelled':
        return 'bg-red-500 text-white';
      case 'Completed':
        return 'bg-green-400 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination controls
  const handleNext = async () => {
    setPaginationLoading(true);
    const newOffset = currentOffset + itemsPerPage;
    setCurrentOffset(newOffset);
    setPaginationLoading(false);
  };

  const handlePrevious = async () => {
    setPaginationLoading(true);
    const newOffset = Math.max(0, currentOffset - itemsPerPage);
    setCurrentOffset(newOffset);
    setPaginationLoading(false);
  };

  // Check if next button should be enabled
  const canGoNext = () => {
    return requests.length === itemsPerPage ;
  };

  // Check if previous button should be enabled
  const canGoPrevious = () => {
    return currentOffset >= itemsPerPage;
  };

  // Calculate current page for display
  const getCurrentPage = () => {
    return Math.floor(currentOffset / itemsPerPage) + 1;
  };

  // Calculate total pages for display
  const getTotalPages = () => {
    return Math.ceil(totalBookings / itemsPerPage);
  };
  
  // Render pagination buttons
  const renderPagination = () => {
    const currentPage = getCurrentPage();
    const totalPages = getTotalPages();
    
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious() || paginationLoading}
          className={`p-1 rounded-md ${
            canGoPrevious() && !paginationLoading
              ? 'text-gray-600 hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          {paginationLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          ) : (
            <FiChevronLeft size={20} />
          )}
        </button>
        
        <span className="px-3 py-1 text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={handleNext}
          disabled={!canGoNext() || paginationLoading}
          className={`p-1 rounded-md ${
            canGoNext() && !paginationLoading
              ? 'text-gray-600 hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          {paginationLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          ) : (
            <FiChevronRight size={20} />
          )}
        </button>
        
        <span className="text-sm text-gray-600 ml-2">
          Showing {currentOffset + 1} - {Math.min(currentOffset + requests.length, totalBookings)} of {totalBookings} bookings
        </span>
      </div>
    );
  };

  // Property Detail Modal for Booking Requests
  const handleOpenModal = (request: BookingRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  // Map BookingRequest to Property for modal compatibility
  const mapBookingToProperty = (request: BookingRequest | null): Property | null => {
    if (!request) return null;
    return {
      id: request.id,
      name: request.propertyName,
      type: request.type,
      bathrooms: 1, // Placeholder, as BookingRequest does not have this field
      bedrooms: 1, // Placeholder
      capacity: 'N/A', // Placeholder
      price: request.price,
      status: request.status,
      listingDate: request.applyDate, // Use applyDate as listingDate
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Request List</h1>
          </div>
          <div className="mt-4 flex gap-3 md:mt-0">
            <label className="flex items-center cursor-pointer">
                <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === 'active'}
                onChange={() => setStatusFilter('active')}
                className="sr-only"
                />
                <span className={`px-5 py-2 rounded-full text-sm font-medium ${
                statusFilter === 'active' 
                    ? 'bg-green-500 text-white ' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                All Bookings
                </span>
            </label>
            <label className="flex items-center cursor-pointer">
                <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === 'Pending'}
                onChange={() => setStatusFilter('Pending')}
                className="sr-only"
                />
                <span className={`px-5 py-2 rounded-full text-sm font-medium ${
                statusFilter === 'Pending' 
                    ? 'bg-[#F7B730] text-white ' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                Pending
                </span>
            </label>
            <label className="flex items-center cursor-pointer">
                <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === 'Approved'}
                onChange={() => setStatusFilter('Approved')}
                className="sr-only"
                />
                <span className={`px-5 py-2 rounded-full text-sm font-medium ${
                statusFilter === 'Approved' 
                    ? 'bg-green-500 text-white ' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                Approved
                </span>
            </label>
            <label className="flex items-center cursor-pointer">
                <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === 'Completed'}
                onChange={() => setStatusFilter('Completed')}
                className="sr-only"
                />
                <span className={`px-5 py-2 rounded-full text-sm font-medium ${
                statusFilter === 'Completed' 
                    ? 'bg-green-400 text-white ' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                Completed
                </span>
            </label>
          </div>
        </div>
        {loading && <div className="p-8 text-center text-gray-500">Loading bookings...</div>}
        {error && <div className="p-8 text-center text-red-500">{error}</div>}
        {/* Booking Request Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-black uppercase tracking-wider">Person Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Email address</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Phone No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Property Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Apply Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-black uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{request.personName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.propertyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.type || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-5 py-2 inline-flex text-md leading-5 font-semibold rounded-full  ${getStatusBadge(request.status)}`}>{request.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.applyDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(request)}
                          className="text-gray-600 hover:text-[#EBA83A] transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">No requests found matching your filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalBookings > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              {renderPagination()}
            </div>
          )}
        </div>
      </div>
      {/* Property Detail Modal (now shows booking details) */}
      <PropertyDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        property={mapBookingToProperty(selectedRequest)}
      />
    </div>
  );
};

export default Bookings;
