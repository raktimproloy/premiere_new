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
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  
  // Mock data - matches the image
  useEffect(() => {
    const mockData: BookingRequest[] = [
        { id: '1', personName: 'MD Siam', email: 'mdsiam@gmail.com', phone: '880 1877787...', propertyName: 'Urban Apartment', type: 'Apartment', status: 'Pending', applyDate: '2025-06-30', price: '$85/night' },
        { id: '2', personName: 'MD Rahat', email: 'mdsiam@gmail.com', phone: '880 1877787...', propertyName: 'Urban Apartment', type: 'Apartment', status: 'Pending', applyDate: '2025-06-30', price: '$85/night' },
        { id: '3', personName: 'Rifat Hassan', email: 'mdsiam@gmail.com', phone: '880 1877787...', propertyName: 'Cozy Lakeview Cabin', type: 'Cabin', status: 'Occupied', applyDate: '2025-07-10', price: '$85/night' },
        { id: '4', personName: 'Hasib ali', email: 'mdsiam@gmail.com', phone: '880 1877787...', propertyName: 'Luxury Beach Villa', type: 'Villa', status: 'Occupied', applyDate: '2025-07-05', price: '$85/night' },
        { id: '5', personName: 'Sbbir Rahm...', email: 'mdsiam@gmail.com', phone: '880 1877787...', propertyName: 'Urban Apartment', type: 'Apartment', status: 'Pending', applyDate: '2025-06-30', price: '$85/night' },
      ];
    setRequests(mockData);
    setFilteredRequests(mockData);
  }, []);

  // Filter requests based on status
  useEffect(() => {
    let result = [...requests];
    if (statusFilter !== 'All') {
      result = result.filter(request => request.status === statusFilter);
    }
    setFilteredRequests(result);
    setCurrentPage(1);
  }, [statusFilter, requests]);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-[#F7B730] text-white';
      case 'Occupied':
        return 'bg-[#586DF7] text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination controls
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Render pagination buttons
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? 'bg-[#EBA83A] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1 rounded-md ${
            currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FiChevronLeft size={20} />
        </button>
        
        {pages}
        
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1 rounded-md ${
            currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FiChevronRight size={20} />
        </button>
        
        <span className="text-sm text-gray-600 ml-2">
          Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredRequests.length)} of {filteredRequests.length} properties
        </span>
      </div>
    );
  };

  const handleReject = () => {
    console.log('Reject clicked');
  };

  const handleApprove = () => {
    console.log('Approve clicked');
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
                checked={statusFilter === 'Pending'}
                onChange={() => setStatusFilter('Pending')}
                className="sr-only"
                />
                <span className={`px-5 py-2 rounded-full text-sm font-medium ${
                statusFilter === 'Pending' 
                    ? 'bg-[#F7B730] text-white ' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                Pending Request
                </span>
            </label>
            <label className="flex items-center cursor-pointer">
                <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === 'Occupied'}
                onChange={() => setStatusFilter('Occupied')}
                className="sr-only"
                />
                <span className={`px-5 py-2 rounded-full text-sm font-medium ${
                statusFilter === 'Occupied' 
                    ? 'bg-[#586DF7] text-white ' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                Occupied User
                </span>
            </label>
          </div>
        </div>
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
                {paginatedRequests.length > 0 ? (
                  paginatedRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{request.personName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.propertyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.type}</td>
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
          {filteredRequests.length > itemsPerPage && (
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
      <PropertyDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        property={mapBookingToProperty(selectedRequest)}
        editUrl={`/superadmin/properties/edit/${mapBookingToProperty(selectedRequest)?.id}`}
        editLabel="Edit Property"
        editActive={mapBookingToProperty(selectedRequest)?.status !== 'Pending'}
        onEditClick={() => { /* custom logic */ }}
        footerActions={[
          { label: 'Reject', active: true, color: '#FF4545', onClick: handleReject },
          { label: 'Approve', active: mapBookingToProperty(selectedRequest)?.status === 'Pending', color: '#40C557', onClick: handleApprove }
        ]}
      />
    </div>
  );
};

export default Bookings;