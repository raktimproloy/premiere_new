'use client';
import React, { useState, useEffect } from 'react';
import { FiEye, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';

interface Review {
  id: string;
  propertyName: string;
  type: string;
  price: string;
  listingDate: string;
  rating: number;
  reviewCount: string;
  reviewerName: string;
  reviewDate: string;
  reviewText: string;
  reviewerAvatar: string;
}

const PropertyReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  const reviewImage = "/images/review.png";

  // Mock data matching the images
  useEffect(() => {
    const mockData: Review[] = [
      { id: '1', propertyName: 'Urban Apartment', type: 'Apartment', price: '$85/night', listingDate: '2025-06-30', rating: 4.5, reviewCount: '2.3k Reviews', reviewerName: 'Cameron Williamson', reviewDate: 'July, 23 2020', reviewText: 'Our family stayed at the Wynwood Townhome and couldn\'t have been happier. The heated pool was a hit with the kids, and the spacious, modern interior had everything we needed.', reviewerAvatar: reviewImage },
      { id: '2', propertyName: 'Urban Apartment', type: 'Apartment', price: '$85/night', listingDate: '2025-06-30', rating: 2.0, reviewCount: '2.3k Reviews', reviewerName: 'Cameron Williamson', reviewDate: 'July, 23 2020', reviewText: 'Our family stayed at the Wynwood Townhome and couldn\'t have been happier. The heated pool was a hit with the kids, and the spacious, modern interior had everything we needed.', reviewerAvatar: reviewImage },
      { id: '3', propertyName: 'Cozy Lakeview Cabin', type: 'Cabin', price: '$70/night', listingDate: '2025-07-10', rating: 4.8, reviewCount: '1.7k Reviews', reviewerName: 'Cameron Williamson', reviewDate: 'July, 23 2020', reviewText: 'Our family stayed at the Wynwood Townhome and couldn\'t have been happier. The heated pool was a hit with the kids, and the spacious, modern interior had everything we needed.', reviewerAvatar: reviewImage },
      { id: '4', propertyName: 'Luxury Beach Villa', type: 'Villa', price: '$200/night', listingDate: '2025-07-05', rating: 4.0, reviewCount: '15k Reviews', reviewerName: 'Cameron Williamson', reviewDate: 'July, 23 2020', reviewText: 'Our family stayed at the Wynwood Townhome and couldn\'t have been happier. The heated pool was a hit with the kids, and the spacious, modern interior had everything we needed.', reviewerAvatar: reviewImage },
      { id: '5', propertyName: 'Urban Apartment', type: 'Apartment', price: '$85/night', listingDate: '2025-06-30', rating: 3.5, reviewCount: '1.6k Reviews', reviewerName: 'Cameron Williamson', reviewDate: 'July, 23 2020', reviewText: 'Our family stayed at the Wynwood Townhome and couldn\'t have been happier. The heated pool was a hit with the kids, and the spacious, modern interior had everything we needed.', reviewerAvatar: reviewImage },
      { id: '6', propertyName: 'Rustic Mountain House', type: 'Duplex House', price: '$120/night', listingDate: '2025-07-01', rating: 3.0, reviewCount: '1.3k Reviews', reviewerName: 'Cameron Williamson', reviewDate: 'July, 23 2020', reviewText: 'Our family stayed at the Wynwood Townhome and couldn\'t have been happier. The heated pool was a hit with the kids, and the spacious, modern interior had everything we needed.', reviewerAvatar: reviewImage },
      { id: '7', propertyName: 'Cozy Lakeview Cabin', type: 'Cabin', price: '$70/night', listingDate: '2025-07-10', rating: 3.4, reviewCount: '1.3k Reviews', reviewerName: 'Cameron Williamson', reviewDate: 'July, 23 2020', reviewText: 'Our family stayed at the Wynwood Townhome and couldn\'t have been happier. The heated pool was a hit with the kids, and the spacious, modern interior had everything we needed.', reviewerAvatar: reviewImage },
      { id: '8', propertyName: 'Rustic Mountain House', type: 'Duplex House', price: '$120/night', listingDate: '2025-07-01', rating: 5.7, reviewCount: '1.3k Reviews', reviewerName: 'Cameron Williamson', reviewDate: 'July, 23 2020', reviewText: 'Our family stayed at the Wynwood Townhome and couldn\'t have been happier. The heated pool was a hit with the kids, and the spacious, modern interior had everything we needed.', reviewerAvatar: reviewImage },
      { id: '9', propertyName: 'Luxury Beach Villa', type: 'Villa', price: '$200/night', listingDate: '2025-07-05', rating: 5.0, reviewCount: '1.3k Reviews', reviewerName: 'Cameron Williamson', reviewDate: 'July, 23 2020', reviewText: 'Our family stayed at the Wynwood Townhome and couldn\'t have been happier. The heated pool was a hit with the kids, and the spacious, modern interior had everything we needed.', reviewerAvatar: reviewImage },
    ];
    setReviews(mockData);
    setFilteredReviews(mockData);
  }, []);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when viewType or reviews change
  useEffect(() => {
    setCurrentPage(1);
  }, [viewType, reviews]);

  // Pagination controls (match payment-history style)
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
          Showing {filteredReviews.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredReviews.length)} of {filteredReviews.length} reviews
        </span>
      </div>
    );
  };

  // Modal handlers
  const handleOpenModal = (review: Review) => {
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Listing Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Reviews</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-black uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedReviews.length > 0 ? (
              paginatedReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{review.propertyName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{review.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{review.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{review.listingDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-700">{review.rating}</span>
                      <FiStar className="w-4 h-4 fill-orange-400 text-orange-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{review.reviewCount}</td>
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
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No reviews found</td>
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
      {paginatedReviews.map((review) => (
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
            </div>
          </div>
        </div>
      ))}
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
                    <span className="text-gray-500">Listing Date:</span>
                    <p className="font-medium">{selectedReview.listingDate}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Review</h4>
                <p className="text-gray-700 leading-relaxed">{selectedReview.reviewText}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-blue-600 font-medium">{selectedReview.reviewCount}</p>
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
          </div>
          <div className="mt-4 flex gap-3 md:mt-0">
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

        {/* Main content */}
        {viewType === 'list' ? <ListView /> : <GridView />}

        {/* Pagination */}
        {filteredReviews.length > itemsPerPage && (
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