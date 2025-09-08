'use client';

import React, { useState } from 'react';

// Define property type
interface Property {
  active: boolean;
  address?: {
    city: string;
    country: string;
    id: number;
    is_default: boolean;
    postal_code: string;
    state: string;
    street1?: string;
    street2?: string;
  };
  bathrooms: number;
  bathrooms_full: number;
  bathrooms_half: number;
  bedrooms: number;
  check_in: string;
  check_out: string;
  currency_code: string;
  id: number;
  key: string;
  latitude: number;
  longitude: number;
  max_children: number;
  max_guests: number;
  max_pets: number;
  name: string;
  property_type: string;
  thumbnail_url: string;
  thumbnail_url_large: string;
  thumbnail_url_medium: string;
}

interface PropertiesData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  images: string[];
  properties: Property[];
}

interface PropertiesTableProps {
  data: PropertiesData | null;
  isLoading: boolean;
  error: string | null;
  onPageChange: (newPage: number) => void;
}

const PropertiesTable: React.FC<PropertiesTableProps> = ({
  data,
  isLoading,
  error,
  onPageChange
}) => {
  // State for column visibility on mobile
  const [showColumns, setShowColumns] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
      onPageChange(newPage);
    }
  };

  // Toggle row expansion on mobile
  const toggleRow = (key: string) => {
    setExpandedRow(expandedRow === key ? null : key);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
        <p className="mt-3 text-gray-600">Loading properties...</p>
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
          <h3 className="text-lg font-medium text-gray-800 mb-2">Unable to load properties</h3>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No properties available</h3>
          <p className="mt-1 text-gray-500">No properties found in our records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 sm:p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Properties List</h2>
        
        {/* Column visibility toggle for mobile */}
        <div className="sm:hidden mb-3">
          <button
            onClick={() => setShowColumns(!showColumns)}
            className="flex items-center text-sm text-purple-600 font-medium"
          >
            {showColumns ? 'Hide Details' : 'Show Details'}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${showColumns ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#F3F0FF] hidden sm:table-header-group">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                  Property
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amenities
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rates
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                  Rules
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.properties.map((property:any) => (
                <React.Fragment key={property.key}>
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer sm:cursor-auto"
                    onClick={() => toggleRow(property.key)}
                  >
                    {/* Property Cell - Always visible */}
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {property.thumbnail_url ? (
                            <img 
                              className="h-12 w-12 rounded-full object-cover" 
                              src={property.thumbnail_url} 
                              alt={property.name} 
                              />
                            ) : 
                          
                            property.images && property.images.length > 0 ? (
                              <img 
                                className="h-12 w-12 rounded-full object-cover" 
                                src={property.images[0].url} 
                                alt={property.name} 
                              />
                            ) : 
                          (
                            <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12 flex items-center justify-center text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {property.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.address?.street1 || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {property.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Description - Hidden on mobile by default */}
                    <td className={`px-4 py-4 text-sm text-gray-900 hidden sm:table-cell ${showColumns ? '!table-cell' : ''}`}>
                      <div className="font-medium">{property.property_type || 'N/A'}</div>
                      <div className="text-gray-500">
                        {property.bedrooms} bd, {property.bathrooms} ba
                      </div>
                    </td>
                    
                    {/* Amenities - Hidden on mobile by default */}
                    <td className={`px-4 py-4 text-sm text-gray-500 hidden sm:table-cell ${showColumns ? '!table-cell' : ''}`}>
                      <div>Guests: {property.max_guests || 'N/A'}</div>
                      <div>Pets: {property.max_pets || '0'}</div>
                      <div>Children: {property.max_children || '0'}</div>
                    </td>
                    
                    {/* Rates - Hidden on mobile by default */}
                    <td className={`px-4 py-4 text-sm text-gray-500 hidden sm:table-cell ${showColumns ? '!table-cell' : ''}`}>
                      <div className="text-gray-900">N/A</div>
                      <div>Currency: {property.currency_code || 'N/A'}</div>
                    </td>
                    
                    {/* Rules - Hidden on mobile by default */}
                    <td className={`px-4 py-4 text-sm text-gray-500 hidden sm:table-cell ${showColumns ? '!table-cell' : ''}`}>
                      <div>Check-in: {property.check_in || 'N/A'}</div>
                      <div>Check-out: {property.check_out || 'N/A'}</div>
                    </td>
                    
                    {/* Mobile expand button */}
                    <td className="px-4 py-4 text-right text-sm font-medium sm:hidden">
                      <button
                        onClick={() => toggleRow(property.key)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        {expandedRow === property.key ? 'Hide' : 'Show'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded row for mobile */}
                  {expandedRow === property.key && (
                    <tr className="sm:hidden bg-gray-50">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Description</h4>
                            <p className="text-sm text-gray-500">
                              Type: {property.property_type || 'N/A'}<br />
                              Bedrooms: {property.bedrooms}<br />
                              Bathrooms: {property.bathrooms}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Amenities</h4>
                            <p className="text-sm text-gray-500">
                              Guests: {property.max_guests || 'N/A'}<br />
                              Pets: {property.max_pets || '0'}<br />
                              Children: {property.max_children || '0'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Rates</h4>
                            <p className="text-sm text-gray-500">
                              N/A<br />
                              Currency: {property.currency_code || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Rules</h4>
                            <p className="text-sm text-gray-500">
                              Check-in: {property.check_in || 'N/A'}<br />
                              Check-out: {property.check_out || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - Same as your example */}
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
                <span className="font-medium">{data.total}</span> properties
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

export default PropertiesTable;