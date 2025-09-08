'use client';

import React, { useState } from 'react';

// Define types
interface Statement {
  Key: string;
  OwnerId: number;
  StatementDate: string;
  IncludedBookings: number;
  Total: number;
  Paid: number;
  Unpaid: number;
  Status: number;
  Note?: string;
  downloadUrl: string;
}

interface OwnerStatementsData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  statements: Statement[];
}

interface OwnerStatementsTableProps {
  data: OwnerStatementsData | null;
  isLoading: boolean;
  error: string | null;
  onPageChange: (newPage: number) => void;
}

const OwnerStatementsTable: React.FC<OwnerStatementsTableProps> = ({
  data,
  isLoading,
  error,
  onPageChange
}) => {
  // State for loading download key
  const [loadingDownloadKey, setLoadingDownloadKey] = useState<string | null>(null);
  // State for expanded card in mobile view
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getStatusInfo = (status: number): { text: string; class: string } => {
    switch (status) {
      case 1:
        return { text: 'Pending', class: 'bg-yellow-100 text-yellow-800' };
      case 2:
        return { text: 'Paid', class: 'bg-green-100 text-green-800' };
      case 3:
        return { text: 'Overdue', class: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
      onPageChange(newPage);
    }
  };

  // Handle download click
  const handleDownloadClick = (key: string, url: string) => {
    setLoadingDownloadKey(key);
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLoadingDownloadKey(null);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
        <p className="mt-3 text-gray-600">Loading statements...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Unable to load statements</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => onPageChange(data?.page || 1)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!data || data.total === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No statements available</h3>
          <p className="mt-1 text-gray-500">You don't have any owner statements yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 sm:p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Owner Statements</h2>
        {/* Mobile Card View */}
        <div className="sm:hidden space-y-4">
          {data.statements.map((statement) => {
            const statusInfo = getStatusInfo(statement.Status);
            const isLoading = loadingDownloadKey === statement.Key;
            const isExpanded = expandedKey === statement.Key;
            return (
              <div key={statement.Key} className="border rounded-lg p-4 shadow-sm bg-[#F9F8FC]">
                {/* Always visible summary */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Statement Date</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(statement.StatementDate)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(statement.Total)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}>{statusInfo.text}</span>
                </div>
                <button
                  className="w-full flex items-center justify-center mt-2 text-purple-600 hover:text-purple-900 font-medium text-sm focus:outline-none"
                  onClick={() => setExpandedKey(isExpanded ? null : statement.Key)}
                >
                  {isExpanded ? 'Hide Details' : 'Show Details'}
                  <svg
                    className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Id</span>
                      <span className="text-sm font-medium text-gray-900">{statement.OwnerId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Paid</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(statement.Paid)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Unpaid</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(statement.Unpaid)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Note</span>
                      <span className="text-sm font-medium text-gray-900">{statement.Note}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Download</span>
                      <button
                        onClick={() => handleDownloadClick(statement.Key, statement.downloadUrl)}
                        disabled={isLoading}
                        className="text-purple-600 hover:text-purple-900 font-medium flex items-center"
                      >
                        {isLoading ? (
                          <svg className="animate-spin h-5 w-5 mr-1 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        )}
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto rounded-lg mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#F3F0FF]">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statement Date</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unpaid</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Download</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.statements.map((statement) => {
                const statusInfo = getStatusInfo(statement.Status);
                const isLoading = loadingDownloadKey === statement.Key;
                return (
                  <tr key={statement.Key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{statement.OwnerId}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatDate(statement.StatementDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(statement.Paid)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(statement.Unpaid)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{formatCurrency(statement.Total)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{statement.Note}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}>{statusInfo.text}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button onClick={() => handleDownloadClick(statement.Key, statement.downloadUrl)} disabled={isLoading} className="text-purple-600 hover:text-purple-900 font-medium flex items-center">
                        {isLoading ? (
                          <svg className="animate-spin h-5 w-5 mr-1 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        )}
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                data.page === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page >= data.totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ml-3 ${
                data.page >= data.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(data.page - 1) * data.pageSize + 1}</span> to{' '}
                <span className="font-medium">{Math.min(data.page * data.pageSize, data.total)}</span> of{' '}
                <span className="font-medium">{data.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(data.page - 1)}
                  disabled={data.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    data.page === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */} 
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  let pageNum;
                  if (data.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (data.page <= 3) {
                    pageNum = i + 1;
                  } else if (data.page >= data.totalPages - 2) {
                    pageNum = data.totalPages - 4 + i;
                  } else {
                    pageNum = data.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        data.page === pageNum
                          ? 'z-10 bg-purple-600 border-purple-600 text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(data.page + 1)}
                  disabled={data.page >= data.totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    data.page >= data.totalPages
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerStatementsTable;
