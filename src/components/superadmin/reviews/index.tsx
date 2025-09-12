'use client';
import React, { useState, useEffect } from 'react';
import { FiEye, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiStar, FiRefreshCw, FiFilter, FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

interface Review {
  _id: string;
  body: string;
  date: string;
  display_name: string;
  property: {
    id: number;
    name: string;
  };
  property_id: number;
  response: string;
  reviewer: string;
  stars: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

interface ReviewsApiResponse {
  success: boolean;
  data: {
    reviews: Review[];
    statistics: ReviewStats;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReviews: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

const PropertyReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  
  const itemsPerPage = 20;

  // Fetch reviews from API
  const fetchReviews = async (page: number = 1, status: string = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: itemsPerPage.toString(),
        ...(status !== 'all' && { status })
      });

      const response = await fetch(`/api/reviews/superadmin?${params}`);
      const data: ReviewsApiResponse = await response.json();
      
      if (data.success) {
        setReviews(data.data.reviews);
        setFilteredReviews(data.data.reviews);
        setTotalPages(data.data.pagination.totalPages);
        setTotalCount(data.data.pagination.totalReviews);
        setStats(data.data.statistics);
        setCurrentPage(page);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (err) {
      setError('Failed to fetch reviews. Please try again.');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, statusFilter);
  }, [statusFilter]);

  // Pagination controls (match payment-history style)
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchReviews(page, statusFilter);
    }
  };

  // Refresh reviews
  const handleRefresh = () => {
    fetchReviews(currentPage, statusFilter);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle bulk actions
  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedReviews.length === 0) return;

    try {
      const response = await fetch('/api/reviews/superadmin/approve', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewIds: selectedReviews,
          newStatus: action === 'approve' ? 'approved' : 'rejected'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`${data.modifiedCount} review(s) ${action}d successfully`);
        setSelectedReviews([]);
        fetchReviews(currentPage, statusFilter);
      } else {
        alert(data.message || 'Failed to update reviews');
      }
    } catch (error) {
      console.error('Error updating reviews:', error);
      alert('Failed to update reviews');
    }
  };

  // Handle individual review update
  const handleUpdateReview = async (reviewId: string, updates: Partial<Review>) => {
    try {
      const response = await fetch(`/api/reviews/superadmin/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (data.success) {
        alert('Review updated successfully');
        fetchReviews(currentPage, statusFilter);
      } else {
        alert(data.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    }
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/reviews/superadmin/${reviewId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        alert('Review deleted successfully');
        fetchReviews(currentPage, statusFilter);
      } else {
        alert(data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  // Handle edit review - navigate to edit page
  const handleEditReview = (review: Review) => {
    window.location.href = `/superadmin/reviews/edit/${review._id}`;
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedReviews(filteredReviews.map(r => r._id));
                    } else {
                      setSelectedReviews([]);
                    }
                  }}
                  className="rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Property Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Reviewer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Review</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-black uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedReviews.includes(review._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReviews([...selectedReviews, review._id]);
                        } else {
                          setSelectedReviews(selectedReviews.filter(id => id !== review._id));
                        }
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{review.property.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{review.display_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-700">{review.stars}</span>
                      <FiStar className="w-4 h-4 fill-orange-400 text-orange-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm text-gray-700 truncate">{review.body}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      review.status === 'approved' ? 'bg-green-100 text-green-800' :
                      review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenModal(review)}
                        className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
                        title="Edit Review"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete Review"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
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
          <div key={review._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">
                {review.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{review.display_name}</h3>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-900">{review.stars}</span>
                    <FiStar className="w-4 h-4 fill-orange-400 text-orange-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{new Date(review.created_at).toLocaleDateString()}</p>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {`"`}{review.body}{`"`}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Property: {review.property.name}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    review.status === 'approved' ? 'bg-green-100 text-green-800' :
                    review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {review.status}
                  </span>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleOpenModal(review)}
                    className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <FiEye size={16} />
                  </button>
                  <button
                    onClick={() => handleEditReview(review)}
                    className="text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
                    title="Edit Review"
                  >
                    <FiEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete Review"
                  >
                    <FiTrash2 size={16} />
                  </button>
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
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-semibold text-gray-600">
                  {selectedReview.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{selectedReview.display_name}</h3>
                  <p className="text-gray-500">{new Date(selectedReview.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-medium text-gray-900">{selectedReview.stars}</span>
                  <FiStar className="w-4 h-4 fill-orange-400 text-orange-400" />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Property Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Property:</span>
                    <p className="font-medium">{selectedReview.property.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Property ID:</span>
                    <p className="font-medium">{selectedReview.property_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Reviewer Type:</span>
                    <p className="font-medium">{selectedReview.reviewer}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Review Date:</span>
                    <p className="font-medium">{new Date(selectedReview.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Review</h4>
                <p className="text-gray-700 leading-relaxed">{selectedReview.body}</p>
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
                    selectedReview.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedReview.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedReview.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <span>Created: {new Date(selectedReview.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  <span>Updated: {new Date(selectedReview.updated_at).toLocaleString()}</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedReviews.length} review(s) selected
              </span>
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FiCheck size={16} />
                Approve Selected
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <FiX size={16} />
                Reject Selected
              </button>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusFilterChange('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilterChange('pending')}
                className={`px-3 py-1 rounded-md text-sm ${
                  statusFilter === 'pending'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusFilterChange('approved')}
                className={`px-3 py-1 rounded-md text-sm ${
                  statusFilter === 'approved'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => handleStatusFilterChange('rejected')}
                className={`px-3 py-1 rounded-md text-sm ${
                  statusFilter === 'rejected'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
            </div>
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
                    onClick={() => fetchReviews(currentPage, statusFilter)}
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

        {/* Modals */}
        <ReviewModal />
      </div>
    </div>
  );
};

export default PropertyReviewsPage;