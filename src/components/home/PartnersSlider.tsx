'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';

// Define the interface for partners data
interface Partner {
  id: string;
  name: string;
  image: string;
  website?: string;
}

interface PartnersSliderProps {
  partners: Partner[];
}

export default function PartnersSlider({ partners }: PartnersSliderProps) {
  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      spaceBetween={16}
      slidesPerView={1}
      breakpoints={{
        480: { slidesPerView: 2, spaceBetween: 16 },
        640: { slidesPerView: 3, spaceBetween: 20 },
        900: { slidesPerView: 4, spaceBetween: 24 },
        1200: { slidesPerView: 5, spaceBetween: 30 },
      }}
      pagination={{ clickable: true }}
      loop={true}
      className="mySwiper"
    >
      {partners.map((partner) => (
        <SwiperSlide key={partner.id}>
          <div className="flex items-center justify-center h-24 sm:h-32 md:h-40 lg:h-48">
            <Image 
              src={partner.image} 
              alt={partner.name || 'partner'} 
              width={1000} 
              height={1000} 
              className='w-full h-full object-contain'
              // className="w-24 h-16 sm:w-32 sm:h-24 md:w-40 md:h-32 lg:w-48 lg:h-40 object-contain"
              // sizes="(max-width: 640px) 96px, (max-width: 900px) 128px, (max-width: 1200px) 160px, 192px"
              priority
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
