'use client';
import React, { useState, useEffect } from 'react';
import { FiEye, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiStar, FiRefreshCw } from 'react-icons/fi';
import { UnifiedReview, ReviewsApiResponse } from '@/types/review';

const PropertyReviewsPage = () => {
  const [reviews, setReviews] = useState<UnifiedReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<UnifiedReview[]>([]);
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedReview, setSelectedReview] = useState<UnifiedReview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  const itemsPerPage = 8;

  // Fetch reviews from API
  const fetchReviews = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/reviews/admin?page=${page}&pageSize=${itemsPerPage}`);
      const data: ReviewsApiResponse = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
        setFilteredReviews(data.reviews);
        setTotalPages(data.totalPages);
        setTotalCount(data.total);
        setCurrentPage(page);
      } else {
        setError(data.error || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Failed to fetch reviews. Please try again.');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, []);

  // Pagination controls (match payment-history style)
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchReviews(page);
    }
  };

  // Refresh reviews
  const handleRefresh = () => {
    fetchReviews(currentPage);
  };

  // Render star rating
  // const renderStarRating = (rating: number) => {
  //   const stars = [];
  //   const fullStars = Math.floor(rating);
  //   const hasHalfStar = rating % 1 !== 0;

  //   for (let i = 0; i < fullStars; i++) {
  //     stars.push(<FiStar key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />);
  //   }

  //   if (hasHalfStar) {
  //     stars.push(<FiStar key="half" className="w-4 h-4 fill-orange-200 text-orange-400" />);
  //   }

  //   const emptyStars = 5 - Math.ceil(rating);
  //   for (let i = 0; i < emptyStars; i++) {
  //     stars.push(<FiStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
  //   }

  //   return stars;
  // };

  // Render pagination buttons
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
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
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    
    return (
      <div className="flex items-center space-x-2 mt-6 justify-center">
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
          Showing {totalCount === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount} reviews
        </span>
      </div>
    );
  };

  // Modal handlers
  const handleOpenModal = (review: UnifiedReview) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  // List view component
  const ListView = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-5 text-left text-xs font-semibold text-black uppercase tracking-wider">Property Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Review Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Reviewer</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-black uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{review.propertyName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{review.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{review.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{review.reviewDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-700">{review.rating}</span>
                      <FiStar className="w-4 h-4 fill-orange-400 text-orange-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{review.reviewerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(review)}
                      className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <FiEye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  {loading ? 'Loading reviews...' : 'No reviews found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Grid view component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredReviews.length > 0 ? (
        filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                <img src={review.reviewerAvatar} alt="reviewer" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{review.reviewerName}</h3>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-900">{review.rating}</span>
                    <FiStar className="w-4 h-4 fill-orange-400 text-orange-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{review.reviewDate}</p>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {`"`}{review.reviewText}{`"`}
                </p>
                <div className="text-xs text-gray-500">
                  Property: {review.propertyName}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-2 text-center py-8 text-gray-500">
          {loading ? 'Loading reviews...' : 'No reviews found'}
        </div>
      )}
    </div>
  );

  // Review detail modal
  const ReviewModal = () => {
    if (!isModalOpen || !selectedReview) return null;

    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Review Details</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                  <img src={selectedReview.reviewerAvatar} alt="reviewer" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{selectedReview.reviewerName}</h3>
                  <p className="text-gray-500">{selectedReview.reviewDate}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-medium text-gray-900">{selectedReview.rating}</span>
                  <FiStar className="w-4 h-4 fill-orange-400 text-orange-400" />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Property Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Property:</span>
                    <p className="font-medium">{selectedReview.propertyName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium">{selectedReview.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <p className="font-medium">{selectedReview.price}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Review Date:</span>
                    <p className="font-medium">{selectedReview.reviewDate}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Review</h4>
                <p className="text-gray-700 leading-relaxed">{selectedReview.reviewText}</p>
                {selectedReview.response && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Response:</h5>
                    <p className="text-gray-700">{selectedReview.response}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedReview.visible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedReview.visible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Property Review List</h1>
            {totalCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {totalCount} review{totalCount !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          <div className="mt-4 flex gap-3 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 rounded-md flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                viewType === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiList size={16} />
              List View
            </button>
            <button
              onClick={() => setViewType('grid')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                viewType === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiGrid size={16} />
              Grid View
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => fetchReviews(currentPage)}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        {viewType === 'list' ? <ListView /> : <GridView />}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            {renderPagination()}
          </div>
        )}

        {/* Modal */}
        <ReviewModal />
      </div>
    </div>
  );
};

export default PropertyReviewsPage;