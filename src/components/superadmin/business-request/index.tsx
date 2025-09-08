'use client';
import React, { useState, useEffect } from 'react';
import { FiEye } from 'react-icons/fi';
import BusinessRequestDetailModal, { BusinessRequestDetail } from './BusinessRequestDetailModal';
import { SubmittedIcon } from '../../../../public/images/svg';
import businessRequests from './businessRequests.json';

interface BusinessRequest {
  id: string;
  personName: string;
  email: string;
  phone: string;
  document: string;
  requestStatus: 'Pending' | 'Approved';
  applyDate: string;
}

const BusinessRequestList = () => {
  const [requests, setRequests] = useState<BusinessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BusinessRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedRequest, setSelectedRequest] = useState<BusinessRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Load data from JSON file
  useEffect(() => {
    setRequests(businessRequests as BusinessRequest[]);
    setFilteredRequests(businessRequests as BusinessRequest[]);
  }, []);

  useEffect(() => {
    let result = [...requests];
    if (statusFilter !== 'All') {
      result = result.filter(request => request.requestStatus === statusFilter);
    }
    setFilteredRequests(result);
  }, [statusFilter, requests]);

  // Paginated requests
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  // Pagination controls
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, requests]);

  // Render pagination buttons (copied and adapted from properties page)
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
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
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
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </button>
        <span className="text-sm text-gray-600 ml-2">
          Showing {filteredRequests.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
        </span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-[#F7B730] text-white';
      case 'Approved':
        return 'bg-[#2ECC71] text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handler for opening modal with details
  const handleOpenModal = (request: BusinessRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  // Map BusinessRequest to BusinessRequestDetail for modal
  const mapToDetail = (request: BusinessRequest | null): BusinessRequestDetail | null => {
    if (!request) return null;
    return {
      id: request.id,
      personName: request.personName,
      email: request.email,
      phone: request.phone,
      requestDate: request.applyDate,
      totalPropertyListing: '112 List', // mock value
      revenueGenerated: '$456663', // mock value
      documentation: [
        { label: 'NID Card' },
        { label: 'Driving License' },
        { label: 'Income Proof' }
      ]
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Request List</h1>
          </div>
          <div className="mt-4 flex gap-3 md:mt-0">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === 'All'}
                onChange={() => setStatusFilter('All')}
                className="sr-only"
              />
              <span className={`px-5 py-2 rounded-full text-sm font-medium ${statusFilter === 'All' ? 'bg-[#2ECC71] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All Business User</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="statusFilter"
                checked={statusFilter === 'Pending'}
                onChange={() => setStatusFilter('Pending')}
                className="sr-only"
              />
              <span className={`px-5 py-2 rounded-full text-sm font-medium ${statusFilter === 'Pending' ? 'bg-[#F7B730] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Pending Request</span>
            </label>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white border-b border-gray-300 border-dashed">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-black uppercase tracking-wider">Business User Na...</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Email address</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Phone No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Document...</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Request St...</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Apply Date</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.document === 'Submitted' ? <span className="inline-flex items-center">Submitted
                         {/* <span className="ml-1 text-green-500">&#10003;</span> */}
                         <SubmittedIcon />
                         </span> : request.document}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-5 py-2 inline-flex text-md leading-5 font-semibold rounded-full ${getStatusBadge(request.requestStatus)}`}>{request.requestStatus}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{request.applyDate}</td>
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
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No requests found matching your filters</td>
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
      {/* Business Request Detail Modal */}
      <BusinessRequestDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        request={mapToDetail(selectedRequest)}
      />
    </div>
  );
};

export default BusinessRequestList;
