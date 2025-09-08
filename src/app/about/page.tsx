'use client';

import DefaultLayout from '@/components/layout/DefaultLayout'
import Image from 'next/image';
import React, { useState, useEffect } from 'react'
import { DoubleTickIcon } from '../../../public/images/svg';

// Define the interface for the about page data
interface AboutPageData {
  title: string;
  aboutText: string;
  items: string[];
  mainMedia?: string;
  mainImage?: string; // Keep for backward compatibility
  mainMediaType?: 'image' | 'video';
  smallImages: string[];
}

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutPageData>({
    title: 'We offer Unique Places Suitable for your Comfort',
    aboutText: 'At Premierestays Miami, our mission is to deliver exceptional property management services that exceed guest expectations through Careful attention to detail and unwavering commitment to quality. We strive to maintain the highest standards in the industry, ensuring every property we manage is not only maintained but elevated, creating seamless and memorable guest experiences that reflect our dedication to excellence.',
    items: [
      "Exceptional Stays, Every Time.",
      "Hands-Off Property Management",
      "Maximized Visibility",
      "Luxury+Level Guest Experience",
      "Performance-Driven Approach"
    ],
    mainMedia: '',
    mainMediaType: 'image',
    smallImages: ['', '', '']
  });
  const [loading, setLoading] = useState(true);

  // Fetch about page data on component mount
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/page-settings/about');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Handle backward compatibility and new media structure
            const data = result.data;
            setAboutData({
              title: data.title || aboutData.title,
              aboutText: data.aboutText || aboutData.aboutText,
              items: data.items || aboutData.items,
              mainMedia: data.mainMedia || data.mainImage || '',
              mainMediaType: data.mainMediaType || 'image',
              smallImages: data.smallImages || aboutData.smallImages
            });
          }
        }
      } catch (error) {
        console.error('Error fetching about page data:', error);
        // Keep default data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);
  
  const AboutVideo = "/images/about_page.mp4"
  const AboutImage1 = "/images/about_page1.jpg"
  const AboutImage2 = "/images/about_page2.jpg"
  const AboutImage3 = "/images/about_page3.jpg"
  
  if (loading) {
    return (
      <DefaultLayout>
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div className="relative">
                <div className="w-full h-[400px] bg-gray-300 rounded-2xl animate-pulse"></div>
                <div className="flex mt-4 justify-center items-center -space-x-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-[170px] h-[200px] bg-gray-300 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-6 bg-gray-300 rounded w-full animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </DefaultLayout>
    );
  }
  
  return (
    <DefaultLayout>
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Content */}
            <div className="relative">
              {/* Main Image - Use from API if available, otherwise fallback to video */}
              {aboutData.mainMedia ? (
                <div className="relative rounded-2xl w-full h-[400px] overflow-hidden shadow-xl aspect-[4/5]">
                  {aboutData.mainMediaType === 'image' ? (
                    <Image 
                      src={aboutData.mainMedia} 
                      alt="Main About" 
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <video src={aboutData.mainMedia} autoPlay muted loop className="w-full h-full object-cover" />
                  )}
                </div>
              ) : (
                <div className="relative rounded-2xl w-full h-[400px] overflow-hidden shadow-xl aspect-[4/5]">
                  <video src={AboutVideo} autoPlay muted loop className="w-full h-full object-cover" />
                </div>
              )}
              
              {/* Small Images - Use from API if available, otherwise fallback to default images */}
              <div className="flex mt-4 justify-center items-center -space-x-5">
                {aboutData.smallImages[0] ? (
                  <Image 
                    src={aboutData.smallImages[0]} 
                    alt="About" 
                    width={170} 
                    height={200} 
                    className="rounded-2xl w-[170px] h-[200px] object-cover shadow-lg rotate-[5deg] z-10" 
                  />
                ) : (
                  <Image 
                    src={AboutImage1} 
                    alt="About" 
                    width={170} 
                    height={200} 
                    className="rounded-2xl w-[170px] h-[200px] object-cover shadow-lg rotate-[5deg] z-10" 
                  />
                )}
                
                {aboutData.smallImages[1] ? (
                  <Image 
                    src={aboutData.smallImages[1]} 
                    alt="About" 
                    width={170} 
                    height={200} 
                    className="rounded-2xl w-[170px] h-[200px] object-cover shadow-lg z-20" 
                  />
                ) : (
                  <Image 
                    src={AboutImage3} 
                    alt="About" 
                    width={170} 
                    height={200} 
                    className="rounded-2xl w-[170px] h-[200px] object-cover shadow-lg z-20" 
                  />
                )}
                
                {aboutData.smallImages[2] ? (
                  <Image 
                    src={aboutData.smallImages[2]} 
                    alt="About" 
                    width={170} 
                    height={200} 
                    className="rounded-2xl w-[170px] h-[200px] object-cover shadow-lg rotate-[-5deg] z-30" 
                  />
                ) : (
                  <Image 
                    src={AboutImage2} 
                    alt="About" 
                    width={170} 
                    height={200} 
                    className="rounded-2xl w-[170px] h-[200px] object-cover shadow-lg rotate-[-5deg] z-30" 
                  />
                )}
              </div>
            </div>
            <div>
              <div className="mb-8">
                <span className="inline-block text-[#A020F0] font-bold tracking-wider mb-3">
                  ABOUT US
                </span>
                <h1 className="text-2xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {aboutData.title || 'We offer Unique Places Suitable for your Comfort'}
                </h1>
              </div>
              
              <div className="space-y-6 mb-10">
                <p className="text-lg text-gray-600 leading-relaxed">
                  {aboutData.aboutText || 'At Premierestays Miami, our mission is to deliver exceptional property management services that exceed guest expectations through Careful attention to detail and unwavering commitment to quality. We strive to maintain the highest standards in the industry, ensuring every property we manage is not only maintained but elevated, creating seamless and memorable guest experiences that reflect our dedication to excellence.'}
                </p>
              </div>
              
              {/* Features List */}
              <div className="">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {aboutData.items && aboutData.items.length > 0 ? aboutData.items[0] : 'Exceptional Stays, Every Time.'}
                </h2>
                <ul className="space-y-4">
                  {aboutData.items && aboutData.items.length > 1 ? (
                    aboutData.items.slice(1).map((item, index) => (
                      <li key={index + 1} className="flex items-center gap-2">
                        <DoubleTickIcon />
                        <span className="text-gray-800 font-medium text-lg">{item}</span>
                      </li>
                    ))
                  ) : (
                    // Fallback to default features if no items or only one item
                    [
                      "Hands-Off Property Management",
                      "Maximized Visibility",
                      "Luxury+Level Guest Experience",
                      "Performance-Driven Approach"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <DoubleTickIcon />
                        <span className="text-gray-800 font-medium text-lg">{feature}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
            
            {/* Right Column - Image */}

          </div>
        </div>
      </section>
    </DefaultLayout>
  )
}
