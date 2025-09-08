// components/ReviewsSection.tsx
'use client';

import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
import { QuoteIcon } from '../../../public/images/svg';

// Define the interface for the testimonial data
interface Testimonial {
  id: string;
  rating: number;
  description: string;
  profileImage: string;
  name: string;
  publishDate: string;
}

interface ReviewsSectionProps {
  testimonials: Testimonial[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ testimonials }) => {
  const swiperRef = useRef<any>(null);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            What are Our Customers Saying
          </h2>
        </div>

        <div className="relative py-8 mt-4">
          {/* Custom Navigation Buttons - manually positioned at top center */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-4 z-10">
            <button
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 bg-white transition-colors hover:border-gray-500 hover:shadow-lg focus:outline-none"
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Previous"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.3508 12.7499L11.2096 17.4615L10.1654 18.5383L3.42264 11.9999L10.1654 5.46148L11.2096 6.53833L6.3508 11.2499L21 11.2499L21 12.7499L6.3508 12.7499Z" fill="#080341" />
              </svg>
            </button>
            <button
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 bg-white transition-colors hover:border-gray-500 hover:shadow-lg focus:outline-none"
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Next"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                <g transform="scale(-1,1) translate(-24,0)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M6.3508 12.7499L11.2096 17.4615L10.1654 18.5383L3.42264 11.9999L10.1654 5.46148L11.2096 6.53833L6.3508 11.2499L21 11.2499L21 12.7499L6.3508 12.7499Z" fill="#080341" />
                </g>
              </svg>
            </button>
          </div>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            breakpoints={{
              768: {
                slidesPerView: 2,
              }
            }}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            pagination={{
              el: '.swiper-pagination',
              clickable: true,
              renderBullet: (index, className) => {
                return `<span class="${className} bg-gray-300 w-3 h-3 mx-1 rounded-full"></span>`;
              },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="mySwiper pt-8 pb-8 h-[400px]"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="bg-white rounded-2xl shadow-md p-8 relative">
                  {/* Star Rating */}
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-6 w-6 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {/* Review Content */}
                  <blockquote className="text-gray-600 text-lg mb-8 italic">
                    "{testimonial.description}"
                  </blockquote>
                  <div className='flex items-center justify-between'>
                    <div className="flex items-center">
                      <Image 
                        src={testimonial.profileImage} 
                        alt={testimonial.name} 
                        width={100} 
                        height={100} 
                        className='rounded-full w-16 h-16 object-cover' 
                      />
                      <div className="ml-4">
                        <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                        <p className="text-gray-500">{testimonial.publishDate}</p>
                      </div>
                    </div>
                    <QuoteIcon/>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Pagination */}
          <div className="swiper-pagination mt-6 flex justify-center"></div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;