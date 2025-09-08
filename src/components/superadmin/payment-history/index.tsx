'use client';
import React, { useEffect, useState } from 'react';
import { FiEye } from 'react-icons/fi';
import PropertyDetailModal from '@/components/common/PropertyDetailModal';

interface PaymentHistory {
  id: string;
  propertyName?: string;
  personName?: string;
  paymentMethod?: string;
  payAmount?: string;
  status?: string;
  paymentDate?: string;
}

const PaymentHistoryTable = () => {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [view, setView] = useState<'your' | 'lister'>('your');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;


  const handleReject = () => {
    console.log('Reject clicked');
  };

  const handleApprove = () => {
    console.log('Approve clicked');
  };

  useEffect(() => {
    fetch('/data/paymentHistory.json')
      .then((res) => res.json())
      .then((data) => setPayments(data));
  }, []);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-[#40C557] text-white';
      case 'Pending':
        return 'bg-[#F7B730] text-white';
      case 'Reject':
        return 'bg-[#FF4545] text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenModal = (payment: PaymentHistory) => {
    setSelectedPayment({
      id: payment.id,
      name: payment.propertyName || '',
      type: '',
      bathrooms: 0,
      bedrooms: 0,
      capacity: '',
      price: payment.payAmount || '',
      status: (payment.status as 'Pending' | 'Occupied' | 'Active') || 'Pending',
      listingDate: payment.paymentDate || '',
    });
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  // Filtered payments based on view
  const displayedPayments = view === 'lister' ? payments.filter(p => p.status === 'Paid') : payments;

  // Paginated payments
  const totalPages = Math.ceil(displayedPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = displayedPayments.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when view or payments change
  useEffect(() => {
    setCurrentPage(1);
  }, [view, payments]);

  // Pagination controls
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
          Showing {displayedPayments.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, displayedPayments.length)} of {displayedPayments.length} payments
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Request List</h1>
          </div>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:gap-3 md:mt-0 w-full md:w-auto">
            <button
              className={`px-5 py-2 rounded-full text-sm font-medium w-full md:w-auto ${view === 'your' ? 'bg-[#586DF7] text-white' : 'bg-gray-100 text-gray-400'}`}
              onClick={() => setView('your')}
            >
              Your Payment History
            </button>
            <button
              className={`px-5 py-2 rounded-full text-sm font-medium w-full md:w-auto ${view === 'lister' ? 'bg-[#586DF7] text-white' : 'bg-gray-100 text-gray-400'}`}
              onClick={() => setView('lister')}
            >
              Lister Payment History
            </button>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-black uppercase tracking-wider">Property Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Person Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Pay Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Payment Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-black uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPayments.length > 0 ? (
                  paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{payment.propertyName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.personName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.paymentMethod || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.payAmount || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-5 py-2 inline-flex text-md leading-5 font-semibold rounded-full ${getStatusBadge(payment.status)}`}>{payment.status || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.paymentDate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(payment)}
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
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No payment history found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {displayedPayments.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              {renderPagination()}
            </div>
          )}
        </div>
      </div>
      {/* Property Detail Modal */}

      <PropertyDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        property={selectedPayment}
        editUrl={`/superadmin/properties/edit/${selectedPayment?.id}`}
        editLabel="Edit Property"
        editActive={selectedPayment?.status !== 'Pending'}
        onEditClick={() => { /* custom logic */ }}
        footerActions={[
          { label: 'Reject', active: true, color: '#FF4545', onClick: handleReject },
          { label: 'Approve', active: selectedPayment?.status === 'Pending', color: '#40C557', onClick: handleApprove }
        ]}
      />
    </div>
  );
};

export default PaymentHistoryTable;
