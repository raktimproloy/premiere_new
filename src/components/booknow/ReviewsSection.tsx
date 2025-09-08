'use client'
import React, { useState } from 'react';

const ReviewsSection = () => {
  const [sortOption, setSortOption] = useState('newest');
  const [reviewsToShow, setReviewsToShow] = useState(3);
  const [reviewForm, setReviewForm] = useState({
    name: 'Zahidul Islami',
    email: 'zahidulislam@example.com',
    rating: 5,
    content: 'This property is...'
  });
 
  const profileImage1 = '/images/profile.jpg'
  const profileImage2 = '/images/profile2.jpg'
  
  // Mock reviews data
  const reviews = [
    {
      id: 1,
      name: 'Cameron Williamson',
      date: 'July, 23 2020',
      profileImage: profileImage1,
      content: 'Our family stayed at the Wynwood Townhome and couldn’t have been happier. The heated pool was a hit with the kids, and the spacious, modern interior had everything we needed.',
      rating: 5
    },
    {
      id: 2,
      name: 'Floyd Miles',
      date: 'July, 23 2020',
      profileImage: profileImage2,
      content: 'Our family stayed at the Wynwood Townhome and couldn’t have been happier. The heated pool was a hit with the kids, and the spacious, modern interior had everything we needed.',
      rating: 5
    },
    {
      id: 3,
      name: 'Kathryn Murphy',
      date: 'July, 23 2020',
      profileImage: profileImage1,
      content: 'Our family stayed at the Wynwood Townhome and couldn’t have been happier. The heated pool was a hit with the kids, and the spacious, modern interior had everything we needed.',
      rating: 5
    },
    {
      id: 4,
      name: 'Jenny Wilson',
      date: 'June, 15 2020',
      profileImage: profileImage2,
      content: 'The location was perfect for exploring Miami. The heated pool was amazing and the property was even better than the photos. Would definitely stay again!',
      rating: 4
    },
    {
      id: 5,
      name: 'Robert Fox',
      date: 'May, 30 2020',
      profileImage: profileImage1,
      content: 'We had a wonderful time at the townhome. The management was very responsive and the property was clean and well-maintained. Highly recommend!',
      rating: 5
    },
    {
      id: 6,
      name: 'Dianne Russell',
      date: 'May, 12 2020',
      profileImage: profileImage2,
      content: 'Perfect for our large family gathering. Plenty of space for everyone and the pool area was fantastic. The design district location was very convenient.',
      rating: 5
    }
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Review submitted:', reviewForm);
    // Here you would typically send the review to your backend
    alert('Review submitted successfully!');
  };

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortOption === 'highest') {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
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
                  4.9 OUT OF 5 
                  <span className="flex text-yellow-400 ml-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </span>
                    6 REVIEWS</p>
              </div>
            </div>
              <p className=" text-gray-600">
                (68%) People Recommended this Property
              </p>
          </div>
        </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">
                ALL COMMENTS (2,100)
              </h2>
              <div className="flex items-center">
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
              </div>
            </div>

            <div className="space-y-8">
              {sortedReviews.slice(0, reviewsToShow).map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-200 rounded-full w-14 h-14 mr-4" style={{backgroundImage: `url(${review.profileImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}} />
                    <div>
                      <h3 className="font-bold text-gray-900">{review.name}</h3>
                      <p className="text-gray-500 text-sm">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700">{review.content}</p>
                </div>
              ))}

              {reviewsToShow < reviews.length && (
                <button 
                  onClick={handleLoadMore}
                  className="w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-300"
                >
                  Load more reviews
                </button>
              )}
            </div>
          </div>

          {/* Review Form */}
          <div className="lg:col-span-1">
            {/* Review Summary Progress Bars */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
              <div className="mb-4">
                {[5, 4, 3, 2, 1].map((star, idx) => {
                  const counts = [45, 162, 34, 25, 12];
                  const total = 45 + 162 + 34 + 25 + 12;
                  const count = counts[5 - star];
                  const percent = (count / total) * 100;
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
                    Your name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={reviewForm.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={reviewForm.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose rating
                  </label>
                  <select
                    name="rating"
                    value={reviewForm.rating}
                    onChange={(e) => handleRatingChange(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select a rating</option>
                    <option value="5">⭐ 5 stars</option>
                    <option value="4">⭐ 4 stars</option>
                    <option value="3">⭐ 3 stars</option>
                    <option value="2">⭐ 2 stars</option>
                    <option value="1">⭐ 1 star</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your review
                  </label>
                  <textarea
                    name="content"
                    value={reviewForm.content}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 bg-[#F7B730] hover:bg-[#9c834d] rounded-full text-white font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  View All Services
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;