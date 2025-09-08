'use client'
import React, { useState } from 'react';
import PropertyCard from '../common/card/PropertyCard';
const propertyImage1 = '/images/property.png';
// Mock property data
const properties = [
  {
    id: 1,
    image: propertyImage1,
    badge: 'FOR RENT',
    beds: 2,
    bathrooms: 1,
    guests: 4,
    title: 'Design District Guesthouse – 2Bdrms',
    location: 'Miami, Miami-Dade County, Florida, United States',
    price: 50.0,
    reviews: 28,
  },
  {
    id: 2,
    image: propertyImage1,
    badge: 'FOR RENT',
    beds: 2,
    bathrooms: 1,
    guests: 4,
    title: 'Design District Guesthouse – 2Bdrms',
    location: 'Miami, Miami-Dade County, Florida, United States',
    price: 50.0,
    reviews: 28,
  },
  {
    id: 3,
    image: propertyImage1,
    badge: 'FOR RENT',
    beds: 2,
    bathrooms: 1,
    guests: 4,
    title: 'Design District Guesthouse – 2Bdrms',
    location: 'Miami, Miami-Dade County, Florida, United States',
    price: 50.0,
    reviews: 28,
  },
  {
    id: 4,
    image: propertyImage1,
    badge: 'FOR RENT',
    beds: 2,
    bathrooms: 1,
    guests: 4,
    title: 'Design District Guesthouse – 2Bdrms',
    location: 'Miami, Miami-Dade County, Florida, United States',
    price: 50.0,
    reviews: 28,
  },
  // Add more mock properties as needed
];

const CARDS_PER_PAGE = 3;

export default function Properties() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(properties.length / CARDS_PER_PAGE);

  const paginatedProperties = properties.slice(
    (page - 1) * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE
  );

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handlePage = (p: number) => setPage(p);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Explore Similar Listings
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-[#D9D9D9] text-[#586DF7] hover:bg-[#F7B730] hover:text-white transition-colors duration-200 disabled:opacity-50"
              aria-label="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F7B730] hover:bg-[#9c834d] transition-colors duration-200 disabled:opacity-50"
              aria-label="Next page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {paginatedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        {/* Pagination bar */}
        <div className="flex items-center justify-center gap-2 my-10">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[#D9D9D9] text-[#586DF7] hover:bg-[#F7B730] hover:text-white transition-colors duration-200 disabled:opacity-50"
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => handlePage(idx + 1)}
              className={`w-10 h-10 rounded-full border border-[#D9D9D9] text-[#586DF7] font-semibold transition-colors duration-200 ${page === idx + 1 ? 'bg-[#F7B730] text-white border-[#F7B730]' : 'bg-white'}`}
            >
              {`0${idx + 1}`}
            </button>
          ))}
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F7B730] hover:bg-[#9c834d] text-white transition-colors duration-200 disabled:opacity-50"
            aria-label="Next page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
