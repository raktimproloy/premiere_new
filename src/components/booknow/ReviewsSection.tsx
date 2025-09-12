'use client'
import React, { useState, useEffect } from 'react';

interface Review {
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
  status: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  averageRatingText: string;
}

const ReviewsSection = ({ id }: { id: string }) => {
  const [sortOption, setSortOption] = useState('newest');
  const [reviewsToShow, setReviewsToShow] = useState(4);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    rating: 5,
    content: ''
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
 
  const profileImage1 = '/images/profile.jpg'
  const profileImage2 = '/images/profile2.jpg'
  
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
  
  // Fetch reviews and statistics
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reviews/public?property_id=${id}&limit=10&page=1`);
        const data = await response.json();
        
        if (data.success) {
          setReviews(data.data.reviews);
          setStats(data.data.statistics);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handleLoadMore = () => {
    setReviewsToShow(prev => prev + 3);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating: number) => {
    setReviewForm(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewForm.name || !reviewForm.email || !reviewForm.content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/reviews/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: reviewForm.content,
          display_name: reviewForm.name,
          property_id: parseInt(id),
          stars: reviewForm.rating,
          reviewer: 'guest'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Show success toast
        showToast('Review submitted successfully! It will be reviewed before being published.', 'success');
        setReviewForm({
          name: '',
          email: '',
          rating: 5,
          content: ''
        });
        // Refresh reviews
        const refreshResponse = await fetch(`/api/reviews/public?property_id=${id}&limit=10&page=1`);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setReviews(refreshData.data.reviews);
          setStats(refreshData.data.statistics);
        }
      } else {
        showToast(data.message || 'Failed to submit review', 'error');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Failed to submit review. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortOption === 'highest') {
      return b.stars - a.stars;
    } else {
      return a.stars - b.stars;
    }
  });

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2">
          <div className="text-start mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Thousands of Clients Saying
          </h1>
          <div className="flex flex-col items-start justify-start gap-4">
            <div className="flex items-center">
              <div className="">
                <p className="text-gray-600 mt-1 flex items-center font-semibold gap-2">
                  {loading ? 'Loading...' : stats ? `${stats.averageRating} OUT OF 5` : '0 OUT OF 5'}
                  <span className="flex text-yellow-400 ml-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </span>
                  {loading ? '...' : stats ? `${stats.totalReviews} REVIEWS` : '0 REVIEWS'}</p>
              </div>
            </div>
              {/* <p className=" text-gray-600">
                (68%) People Recommended this Property
              </p> */}
          </div>
        </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">
                ALL COMMENTS ({loading ? '...' : stats ? stats.totalReviews : 0})
              </h2>
              {/* <div className="flex items-center">
                <span className="text-gray-600 mr-3">Sort by :</span>
                <select 
                  value={sortOption}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div> */}
            </div>

            <div className="space-y-8">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading reviews...</p>
                </div>
              ) : sortedReviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet. Be the first to review this property!</p>
                </div>
              ) : (
                <>
                  {sortedReviews.slice(0, reviewsToShow).map((review, index) => (
                    <div key={`${review.property_id}-${index}`} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="bg-gray-200 rounded-full w-14 h-14 mr-4 flex items-center justify-center text-gray-600 font-semibold">
                          {review.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{review.display_name}</h3>
                          <p className="text-gray-500 text-sm">{new Date(review.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-400 mb-3">
                        {[...Array(review.stars)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-700">{review.body}</p>
                      {review.response && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 font-medium mb-1">Property Response:</p>
                          <p className="text-gray-700">{review.response}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {reviewsToShow < sortedReviews.length && (
                    <button 
                      onClick={handleLoadMore}
                      className="w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-300"
                    >
                      Load more reviews
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Review Form */}
          <div className="lg:col-span-1">
            {/* Review Summary Progress Bars */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
              <div className="mb-4">
                {[5, 4, 3, 2, 1].map((star, idx) => {
                  const count = stats ? stats.ratingDistribution[star as keyof typeof stats.ratingDistribution] : 0;
                  const total = stats ? stats.totalReviews : 1;
                  const percent = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center mb-2">
                      <span className="w-6 text-sm flex items-center gap-1 font-medium text-gray-700">{star} <span className="text-yellow-400">★</span></span>
                      <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-sm text-gray-700 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* End Review Summary Progress Bars */}
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Write Your Review
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={reviewForm.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={reviewForm.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose rating *
                  </label>
                  <select
                    name="rating"
                    value={reviewForm.rating}
                    onChange={(e) => handleRatingChange(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="5">⭐ 5 stars - Excellent</option>
                    <option value="4">⭐ 4 stars - Very Good</option>
                    <option value="3">⭐ 3 stars - Good</option>
                    <option value="2">⭐ 2 stars - Fair</option>
                    <option value="1">⭐ 1 star - Poor</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your review *
                  </label>
                  <textarea
                    name="content"
                    value={reviewForm.content}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Share your experience with this property..."
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#F7B730] hover:bg-[#9c834d] disabled:bg-gray-400 disabled:cursor-not-allowed rounded-full text-white font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Review
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
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
    </section>
  );
};

export default ReviewsSection;