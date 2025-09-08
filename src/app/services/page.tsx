import DefaultLayout from '@/components/layout/DefaultLayout'
import Breadcrumb from '@/components/common/Breadcrumb'
import React from 'react'
import CardOne from '@/components/common/card/CardOne';
import WorkRating from '@/components/common/WorkRating';

// Define the interface for the service data
interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
}

// Fetch services data server-side
async function getServicesData(): Promise<Service[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-settings/services`, {
      cache: 'no-store' // Disable caching to always get fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch services data');
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.data.services || [];
    } else {
      throw new Error(result.message || 'Failed to fetch services data');
    }
  } catch (error) {
    console.error('Error fetching services data:', error);
    // Return default services if API fails
    return [
      {
        id: '1',
        icon: 'fas fa-home',
        title: 'Housekeeping & Turnover Coordination',
        description: 'We prioritize cleanliness and guest satisfaction with our meticulous housekeeping. Each turnover is managed with a detailed checklist to ensure a hotel-standard experience.'
      },
      {
        id: '2',
        icon: 'fas fa-gavel',
        title: 'Legal & Compliance Assistance',
        description: 'Navigating local laws and regulations in the short-term rental market can be complex, especially in places like Miami. We stay up-to-date on all relevant legal requirements.'
      },
      {
        id: '3',
        icon: 'fas fa-comments',
        title: 'Guest Communication & Booking Management',
        description: 'Our team is available to handle all aspects of guest communication, from initial inquiries to post-checkout feedback. We ensure timely, professional responses to all.'
      },
      {
        id: '4',
        icon: 'fas fa-chart-line',
        title: 'Performance Analytics & Reporting',
        description: 'Get detailed insights into your property performance with comprehensive analytics and regular reporting to help optimize your rental strategy.'
      },
      {
        id: '5',
        icon: 'fas fa-tools',
        title: 'Maintenance & Property Care',
        description: 'We handle all maintenance requests and ensure your property is always in top condition for guests.'
      }
    ];
  }
}

export default async function ServicesPage() {
  // Fetch data server-side
  const services = await getServicesData();
  
  return (
    <DefaultLayout>
        <Breadcrumb bgImage={"/images/service_breadcrumb.jpg"} path={["Home", "Services"]} title="Find Your Perfect Stay - Book with Confidence" description="Explore a wide range of rental properties tailored to your needs. Whether it's short-term or long-term, we make booking easy, secure, and hassle-free." />
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 text-sm font-semibold text-indigo-600 mb-4">
                Services
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                We Provide Services for You.
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-gray-600">
                Explore our comprehensive services, meticulously crafted to enhance property value and streamline management.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={service.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                    <i className={`${service.icon} text-2xl text-white`}></i>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <WorkRating />
    </DefaultLayout>
  )
}
