// components/ServicesSection.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CardOne from '../common/card/CardOne';



const ServicesSection = () => {
  const serviceImage1 = '/images/service1.png';
  const serviceImage2 = '/images/service2.png';
  const serviceImage3 = '/images/service3.png';
  const services = [
    {
      id: 1,
      number: '18',
      title: 'Housekeeping & Turnover Coordination',
      image: serviceImage3,
      imageBg: "#A020F0",
      description: 'We prioritize cleanliness and guest satisfaction with our meticulous housekeeping. Each turnover is managed with a detailed checklist to ensure a hotel-standard experience.',
      stat: '99%',
      statLabel: 'Customer Satisfaction',
      link: '/services'
    },
    {
      id: 2,
      number: '99%',
      title: 'Legal & Compliance Assistance',
      image: serviceImage2,
      imageBg: "#F86E04",
      description: 'Navigating local laws and regulations in the short-term rental market can be complex, especially in places like Miami. We stay up-to-date on all relevant legal requirements.',
      stat: '06Y',
      statLabel: 'Years Experience',
      link: '/services'
    },
    {
      id: 3,
      number: '06Y',
      title: 'Guest Communication & Booking Management',
      image: serviceImage1,
      imageBg: "#38C6F9",
      description: 'Our team is available to handle all aspects of guest communication, from initial inquiries to post-checkout feedback. We ensure timely, professional responses to all',
      stat: '35+',
      statLabel: 'Amazing team members',
      link: '/services'
    }
  ];

  const stats = [
    { value: '99%', label: 'Customer Satisfaction' },
    { value: '06Y', label: 'Years Experience' },
    { value: '35+', label: 'Amazing team members' },
    { value: '1.5k+', label: 'Our Happy Clients' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-12">
          <div>
            <span className="inline-block text-[#586DF7] font-bold tracking-wider mb-2">
              SERVICES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              We Provide Services for You.
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Explore our comprehensive services, meticulously crafted to enhance property value and streamline management.
            </p>
          </div>
          <Link 
            href="/services" 
            className="mt-4 bg-[#F7B730] rounded-full px-6 py-4 md:mt-0 flex items-center text-black font-semibold hover:text-blue-800 transition-colors"
          >
            View All Service
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service) => (
            <CardOne key={service.id} service={service} />
            // <div 
            //   key={service.id}
            //   className="bg-[#272266] rounded-xl shadow-lg p-8 relative overflow-hidden transition-all duration-300 hover:shadow-xl"
            // >
            //   {/* Quarter red and green circles at top-right */}
            //   <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#11DBFA0A] rounded-full z-20"></div>
            //   <div className="absolute -top-35 -right-35 w-70 h-70 bg-[#11DBFA0F] rounded-full z-10"></div>

            //   {/* Service image and content */}
            //   <div className={`w-20 h-20 object-cover bg-[${service.imageBg}] p-2 rounded-full flex items-center justify-center mb-4`}>
            //     <Image src={service.image} alt={service.title} width={100} height={100} className="w-10 h-10 object-cover" />
            //   </div>
            //   <h3 className="text-xl font-bold text-white mb-4 pr-8">{service.title}</h3>
            //   <p className="text-gray-200 mb-6">{service.description}</p>
            //   <div className="flex justify-between items-center">
            //     <Link 
            //       href="#" 
            //       className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
            //     >
            //       Learn More
            //     </Link>
            //   </div>
            // </div>
          ))}
        </div>

        {/* Statistics Section */}


      </div>
    </section>
  );
};

export default ServicesSection;