'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';

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

const EditReviewPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Review>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);

  // Toast functions
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const closeToast = () => {
    setToast(null);
  };

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setReviewId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  // Fetch review data
  useEffect(() => {
    const fetchReview = async () => {
      if (!reviewId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/reviews/superadmin/${reviewId}`);
        const data = await response.json();
        
        if (data.success) {
          setReview(data.data);
          setFormData(data.data);
        } else {
          setError(data.message || 'Failed to fetch review');
        }
      } catch (error) {
        console.error('Error fetching review:', error);
        setError('Failed to fetch review');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [reviewId]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewId) {
      showToast('Review ID not available', 'error');
      return;
    }
    
    // Basic validation
    if (!formData.display_name?.trim()) {
      showToast('Please enter a reviewer name', 'error');
      return;
    }
    
    if (!formData.body?.trim()) {
      showToast('Please enter review text', 'error');
      return;
    }
    
    if (!formData.stars || formData.stars < 1 || formData.stars > 5) {
      showToast('Please select a valid rating (1-5 stars)', 'error');
      return;
    }
    
    try {
      setSaving(true);
      const response = await fetch(`/api/reviews/superadmin/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        showToast('Review updated successfully', 'success');
        setTimeout(() => {
          router.push('/superadmin/reviews');
        }, 1500);
      } else {
        showToast(data.message || 'Failed to update review', 'error');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      showToast('Failed to update review', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/superadmin/reviews');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/superadmin/reviews')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Reviews
          </button>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">Review not found</div>
          <button
            onClick={() => router.push('/superadmin/reviews')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Reviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminLayout> 
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Back to Reviews
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Review</h1>
          <p className="text-gray-600 mt-2">
            Review for {review.property.name} by {review.display_name}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reviewer Name *
                </label>
                <input
                  type="text"
                  value={formData.display_name || ''}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <select
                  value={formData.stars || 5}
                  onChange={(e) => handleInputChange('stars', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 Star - Poor</option>
                  <option value={2}>2 Stars - Fair</option>
                  <option value={3}>3 Stars - Good</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={5}>5 Stars - Excellent</option>
                </select>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Text *
              </label>
              <textarea
                value={formData.body || ''}
                onChange={(e) => handleInputChange('body', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the review content..."
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status || 'pending'}
                onChange={(e) => handleInputChange('status', e.target.value as 'pending' | 'approved' | 'rejected')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Response */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Response (Optional)
              </label>
              <textarea
                value={formData.response || ''}
                onChange={(e) => handleInputChange('response', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a response to this review..."
              />
            </div>

            {/* Review Info */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Review Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Property:</span> {review.property.name}
                </div>
                <div>
                  <span className="font-medium">Reviewer Type:</span> {review.reviewer}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(review.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(review.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center"
              >
                <FiX className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <FiSave className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
         </div>
       </div>

       {/* Toast Notification */}
       {toast && (
         <div className="fixed top-4 right-4 z-50 max-w-sm">
           <div className={`rounded-lg shadow-lg p-4 flex items-center justify-between ${
             toast.type === 'success' ? 'bg-green-500 text-white' :
             toast.type === 'error' ? 'bg-red-500 text-white' :
             'bg-blue-500 text-white'
           }`}>
             <div className="flex items-center">
               {toast.type === 'success' && (
                 <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
               )}
               {toast.type === 'error' && (
                 <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                 </svg>
               )}
               {toast.type === 'info' && (
                 <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                 </svg>
               )}
               <span className="text-sm font-medium">{toast.message}</span>
             </div>
             <button
               onClick={closeToast}
               className="ml-4 text-white hover:text-gray-200 focus:outline-none"
             >
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
             </button>
           </div>
         </div>
       )}
     </div>

     </SuperAdminLayout>
   );
 };

export default EditReviewPage;
