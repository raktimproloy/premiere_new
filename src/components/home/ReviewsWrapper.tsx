// components/ReviewsWrapper.tsx
import React from 'react';
import ReviewsSection from './Reviews';

// Define the interface for the testimonial data
interface Testimonial {
  id: string;
  rating: number;
  description: string;
  profileImage: string;
  name: string;
  publishDate: string;
}

// Fetch testimonials data server-side
async function getTestimonialsData(): Promise<Testimonial[]> {
  try {
    // In server components, we can directly call the API route handler
    // Instead of using fetch which requires a full URL
    const apiModule = await import('@/app/api/page-settings/testimonials/route');
    
    // Call GET function directly (it doesn't accept parameters)
    const response = await apiModule.GET();
    const result = await response.json();
    
    if (result.success && result.data?.testimonials) {
      return result.data.testimonials;
    }
    
    // If no data, return default testimonials
    return getDefaultTestimonials();
  } catch (error) {
    // Silently fail and return default testimonials
    // This is expected in development when the database might not be set up
    return getDefaultTestimonials();
  }
}

// Default testimonials data
function getDefaultTestimonials(): Testimonial[] {
  return [
      {
        id: '1',
        name: "Annette Black",
        publishDate: "12 January, 2025",
        profileImage: '/images/review1.png',
        rating: 4,
        description: "We had a wonderful experience with Premier Stays Miami. The rooms were spacious and well-equipped, and any requests we had were. It was the perfect home base for our family trip."
      },
      {
        id: '2',
        name: "Guy Hawkins",
        publishDate: "12 January, 2025",
        profileImage: '/images/review2.png',
        rating: 4,
        description: "Excellent location and fantastic service! The property was exactly as described—clean, quiet, and close to Miami. The team made sure we felt welcome and taken our stay."
      },
      {
        id: '3',
        name: "Jane Cooper",
        publishDate: "5 February, 2025",
        profileImage: '/images/review1.png',
        rating: 5,
        description: "Absolutely stunning property with breathtaking views. The attention to detail was impressive, and the amenities exceeded our expectations. We'll definitely be returning next year!"
      },
      {
        id: '4',
        name: "Robert Fox",
        publishDate: "28 March, 2025",
        profileImage: '/images/review2.png',
        rating: 4,
        description: "The booking process was seamless, and the property manager was incredibly responsive. The space was perfect for our group, and the location couldn't be beat. Highly recommend!"
      }
    ];
}

const ReviewsWrapper = async () => {
  // Fetch data server-side
  const testimonials = await getTestimonialsData();
  
  // Pass data to client component
  return <ReviewsSection testimonials={testimonials} />;
};

export default ReviewsWrapper;
