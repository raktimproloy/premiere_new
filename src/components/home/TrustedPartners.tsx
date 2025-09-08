'use client';

import React, { useState, useEffect } from 'react';
import PartnersSlider from './PartnersSlider';

// Define the interface for partners data
interface Partner {
  id: string;
  name: string;
  image: string;
  website?: string;
}

export default function TrustedPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch partners data on component mount
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('/api/page-settings/home');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.partners) {
            setPartners(result.data.partners);
          } else {
            // Use default partners if API doesn't return data
            setPartners([
              { id: '1', name: 'Partner 1', image: '/images/partner1.png' },
              { id: '2', name: 'Partner 2', image: '/images/partner2.png' },
              { id: '3', name: 'Partner 3', image: '/images/partner3.png' },
              { id: '4', name: 'Partner 4', image: '/images/partner4.png' },
              { id: '5', name: 'Partner 5', image: '/images/partner1.png' }
            ]);
          }
        } else {
          // Use default partners if API fails
          setPartners([
            { id: '1', name: 'Partner 1', image: '/images/partner1.png' },
            { id: '2', name: 'Partner 2', image: '/images/partner2.png' },
            { id: '3', name: 'Partner 3', image: '/images/partner3.png' },
            { id: '4', name: 'Partner 4', image: '/images/partner4.png' },
            { id: '5', name: 'Partner 5', image: '/images/partner1.png' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
        // Use default partners if fetch fails
        setPartners([
          { id: '1', name: 'Partner 1', image: '/images/partner1.png' },
          { id: '2', name: 'Partner 2', image: '/images/partner2.png' },
          { id: '3', name: 'Partner 3', image: '/images/partner3.png' },
          { id: '4', name: 'Partner 4', image: '/images/partner4.png' },
          { id: '5', name: 'Partner 5', image: '/images/partner1.png' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-14 gap-4 md:gap-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4 text-center md:text-left">
              Our Trusted Partners
            </h2>
            <p className="text-sm sm:text-md text-gray-600 max-w-md text-center md:text-left mx-auto md:mx-0">
              We proudly partner with leading booking platforms to ensure maximum visibility for our properties. Check out the platforms where you can find us!
            </p>
          </div>
          <div className="relative">
            <div className="flex items-center justify-center h-48">
              <div className="grid grid-cols-5 gap-4 w-full max-w-4xl">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-24 bg-gray-300 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-14 gap-4 md:gap-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4 text-center md:text-left">
            Our Trusted Partners
          </h2>
          <p className="text-sm sm:text-md text-gray-600 max-w-md text-center md:text-left mx-auto md:mx-0">
            We proudly partner with leading booking platforms to ensure maximum visibility for our properties. Check out the platforms where you can find us!
          </p>
        </div>

        <div className="relative">
          <PartnersSlider partners={partners} />
        </div>
      </div>
    </section>
  );
}