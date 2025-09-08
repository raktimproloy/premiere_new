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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-settings/testimonials`, {
      cache: 'no-store' // Disable caching to always get fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch testimonials data');
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.data.testimonials || [];
    } else {
      throw new Error(result.message || 'Failed to fetch testimonials data');
    }
  } catch (error) {
    console.error('Error fetching testimonials data:', error);
    // Return default testimonials if API fails
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
}

const ReviewsWrapper = async () => {
  // Fetch data server-side
  const testimonials = await getTestimonialsData();
  
  // Pass data to client component
  return <ReviewsSection testimonials={testimonials} />;
};

export default ReviewsWrapper;
