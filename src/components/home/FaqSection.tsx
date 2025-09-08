// components/FAQSection.tsx
'use client';

import { useState, useEffect } from 'react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'property' | 'booking';
}

const FAQSection = () => {
  const [activeTab, setActiveTab] = useState('property');
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch FAQs data on component mount
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch('/api/page-settings/faqs');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.faqs) {
            setFaqs(result.data.faqs);
          } else {
            // Use default FAQs if API doesn't return data
            setFaqs([
              {
                id: '1',
                question: "How do you handle guest bookings and reservations for my property?",
                answer: "Set Sale Marine modernizes the boat buying and selling process by offering an easy-to-use platform, professional level resources, and AI personalized assistance. Our goal is to connect buyers and sellers while providing expert guidance at every step.",
                category: 'property'
              },
              {
                id: '2',
                question: "How do you ensure that my property is well-maintained and guest-ready at all times?",
                answer: "We implement a rigorous cleaning and maintenance schedule with detailed checklists for each turnover. Our team conducts regular inspections and uses smart home technology to monitor property conditions. All properties are deep-cleaned weekly and after each guest stay.",
                category: 'property'
              },
              {
                id: '3',
                question: "What strategies do you use to maximize my rental income?",
                answer: "We employ dynamic pricing algorithms that adjust rates based on market demand, seasonality, and local events. Our marketing strategies target high-value guests through multiple channels, and we optimize listing content to improve visibility and conversion rates.",
                category: 'property'
              },
              {
                id: '4',
                question: "How do you screen potential guests for my property?",
                answer: "We use a comprehensive verification system that includes ID verification, payment authentication, and previous review analysis. Our AI-powered risk assessment flags potentially problematic bookings, and we require security deposits for high-risk reservations.",
                category: 'property'
              },
              {
                id: '5',
                question: "What happens if a guest damages my property?",
                answer: "Our damage protection program covers up to $3,000 in accidental damages. For incidents beyond this, we have a clear process for documentation, claims filing, and resolution. We also maintain strong relationships with local contractors for quick repairs.",
                category: 'property'
              },
              {
                id: '6',
                question: "Do you offer 24/7 guest support?",
                answer: "Yes, our dedicated guest support team is available 24/7 via phone, chat, and in-app messaging. We handle all guest inquiries, emergencies, and issues promptly, ensuring a seamless experience for your guests without requiring your involvement.",
                category: 'property'
              },
              {
                id: '7',
                question: "How do I book a property?",
                answer: "Booking is simple through our website or mobile app. Browse available properties, select your dates, and complete the secure checkout process. You'll receive instant confirmation and access to our guest portal for all trip details.",
                category: 'booking'
              },
              {
                id: '8',
                question: "What is your cancellation policy?",
                answer: "We offer flexible cancellation policies ranging from strict to flexible, depending on the property. Most properties allow free cancellation up to 14 days before check-in. Specific cancellation terms are clearly listed on each property page.",
                category: 'booking'
              },
              {
                id: '9',
                question: "How do I check in to my rental?",
                answer: "We offer contactless check-in through our smart lock system. You'll receive a unique access code prior to your arrival. For properties requiring key pickup, we provide detailed instructions and 24/7 support for assistance.",
                category: 'booking'
              },
              {
                id: '10',
                question: "What amenities are included?",
                answer: "All our properties include premium amenities such as high-speed WiFi, smart TVs, fully equipped kitchens, luxury linens, and essential toiletries. Specific amenities vary by property and are listed in each property description.",
                category: 'booking'
              },
              {
                id: '11',
                question: "Can I bring pets?",
                answer: "Many of our properties are pet-friendly. Look for the pet-friendly filter when searching, and review the specific pet policy for each property. Additional fees may apply, and breed restrictions may be in place.",
                category: 'booking'
              },
              {
                id: '12',
                question: "How do I contact support during my stay?",
                answer: "Our 24/7 guest support is available via phone, chat, and in-app messaging. For urgent issues, you'll receive priority assistance. We also provide a comprehensive digital guidebook with property-specific information.",
                category: 'booking'
              }
            ]);
          }
        } else {
          // Use default FAQs if API fails
          setFaqs([
            {
              id: '1',
              question: "How do you handle guest bookings and reservations for my property?",
              answer: "Set Sale Marine modernizes the boat buying and selling process by offering an easy-to-use platform, professional level resources, and AI personalized assistance. Our goal is to connect buyers and sellers while providing expert guidance at every step.",
              category: 'property'
            },
            {
              id: '2',
              question: "How do you ensure that my property is well-maintained and guest-ready at all times?",
              answer: "We implement a rigorous cleaning and maintenance schedule with detailed checklists for each turnover. Our team conducts regular inspections and uses smart home technology to monitor property conditions. All properties are deep-cleaned weekly and after each guest stay.",
              category: 'property'
            },
            {
              id: '3',
              question: "What strategies do you use to maximize my rental income?",
              answer: "We employ dynamic pricing algorithms that adjust rates based on market demand, seasonality, and local events. Our marketing strategies target high-value guests through multiple channels, and we optimize listing content to improve visibility and conversion rates.",
              category: 'property'
            },
            {
              id: '4',
              question: "How do you screen potential guests for my property?",
              answer: "We use a comprehensive verification system that includes ID verification, payment authentication, and previous review analysis. Our AI-powered risk assessment flags potentially problematic bookings, and we require security deposits for high-risk reservations.",
              category: 'property'
            },
            {
              id: '5',
              question: "What happens if a guest damages my property?",
              answer: "Our damage protection program covers up to $3,000 in accidental damages. For incidents beyond this, we have a clear process for documentation, claims filing, and resolution. We also maintain strong relationships with local contractors for quick repairs.",
              category: 'property'
            },
            {
              id: '6',
              question: "Do you offer 24/7 guest support?",
              answer: "Yes, our dedicated guest support team is available 24/7 via phone, chat, and in-app messaging. We handle all guest inquiries, emergencies, and issues promptly, ensuring a seamless experience for your guests without requiring your involvement.",
              category: 'property'
            },
            {
              id: '7',
              question: "How do I book a property?",
              answer: "Booking is simple through our website or mobile app. Browse available properties, select your dates, and complete the secure checkout process. You'll receive instant confirmation and access to our guest portal for all trip details.",
              category: 'booking'
            },
            {
              id: '8',
              question: "What is your cancellation policy?",
              answer: "We offer flexible cancellation policies ranging from strict to flexible, depending on the property. Most properties allow free cancellation up to 14 days before check-in. Specific cancellation terms are clearly listed on each property page.",
              category: 'booking'
            },
            {
              id: '9',
              question: "How do I check in to my rental?",
              answer: "We offer contactless check-in through our smart lock system. You'll receive a unique access code prior to your arrival. For properties requiring key pickup, we provide detailed instructions and 24/7 support for assistance.",
              category: 'booking'
            },
            {
              id: '10',
              question: "What amenities are included?",
              answer: "All our properties include premium amenities such as high-speed WiFi, smart TVs, fully equipped kitchens, luxury linens, and essential toiletries. Specific amenities vary by property and are listed in each property description.",
              category: 'booking'
            },
            {
              id: '11',
              question: "Can I bring pets?",
              answer: "Many of our properties are pet-friendly. Look for the pet-friendly filter when searching, and review the specific pet policy for each property. Additional fees may apply, and breed restrictions may be in place.",
              category: 'booking'
            },
            {
              id: '12',
              question: "How do I contact support during my stay?",
              answer: "Our 24/7 guest support is available via phone, chat, and in-app messaging. For urgent issues, you'll receive priority assistance. We also provide a comprehensive digital guidebook with property-specific information.",
              category: 'booking'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        // Use default FAQs if fetch fails
        setFaqs([
          {
            id: '1',
            question: "How do you handle guest bookings and reservations for my property?",
            answer: "Set Sale Marine modernizes the boat buying and selling process by offering an easy-to-use platform, professional level resources, and AI personalized assistance. Our goal is to connect buyers and sellers while providing expert guidance at every step.",
            category: 'property'
          },
          {
            id: '2',
            question: "How do you ensure that my property is well-maintained and guest-ready at all times?",
            answer: "We implement a rigorous cleaning and maintenance schedule with detailed checklists for each turnover. Our team conducts regular inspections and uses smart home technology to monitor property conditions. All properties are deep-cleaned weekly and after each guest stay.",
            category: 'property'
          },
          {
            id: '3',
            question: "What strategies do you use to maximize my rental income?",
            answer: "We employ dynamic pricing algorithms that adjust rates based on market demand, seasonality, and local events. Our marketing strategies target high-value guests through multiple channels, and we optimize listing content to improve visibility and conversion rates.",
            category: 'property'
          },
          {
            id: '4',
            question: "How do you screen potential guests for my property?",
            answer: "We use a comprehensive verification system that includes ID verification, payment authentication, and previous review analysis. Our AI-powered risk assessment flags potentially problematic bookings, and we require security deposits for high-risk reservations.",
            category: 'property'
          },
          {
            id: '5',
            question: "What happens if a guest damages my property?",
            answer: "Our damage protection program covers up to $3,000 in accidental damages. For incidents beyond this, we have a clear process for documentation, claims filing, and resolution. We also maintain strong relationships with local contractors for quick repairs.",
            category: 'property'
          },
          {
            id: '6',
            question: "Do you offer 24/7 guest support?",
            answer: "Yes, our dedicated guest support team is available 24/7 via phone, chat, and in-app messaging. We handle all guest inquiries, emergencies, and issues promptly, ensuring a seamless experience for your guests without requiring your involvement.",
            category: 'property'
          },
          {
            id: '7',
            question: "How do I book a property?",
            answer: "Booking is simple through our website or mobile app. Browse available properties, select your dates, and complete the secure checkout process. You'll receive instant confirmation and access to our guest portal for all trip details.",
            category: 'booking'
          },
          {
            id: '8',
            question: "What is your cancellation policy?",
            answer: "We offer flexible cancellation policies ranging from strict to flexible, depending on the property. Most properties allow free cancellation up to 14 days before check-in. Specific cancellation terms are clearly listed on each property page.",
            category: 'booking'
          },
          {
            id: '9',
            question: "How do I check in to my rental?",
            answer: "We offer contactless check-in through our smart lock system. You'll receive a unique access code prior to your arrival. For properties requiring key pickup, we provide detailed instructions and 24/7 support for assistance.",
            category: 'booking'
          },
          {
            id: '10',
            question: "What amenities are included?",
            answer: "All our properties include premium amenities such as high-speed WiFi, smart TVs, fully equipped kitchens, luxury linens, and essential toiletries. Specific amenities vary by property and are listed in each property description.",
            category: 'booking'
          },
          {
            id: '11',
            question: "Can I bring pets?",
            answer: "Many of our properties are pet-friendly. Look for the pet-friendly filter when searching, and review the specific pet policy for each property. Additional fees may apply, and breed restrictions may be in place.",
            category: 'booking'
          },
          {
            id: '12',
            question: "How do I contact support during my stay?",
            answer: "Our 24/7 guest support is available via phone, chat, and in-app messaging. For urgent issues, you'll receive priority assistance. We also provide a comprehensive digital guidebook with property-specific information.",
            category: 'booking'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const currentFAQs = faqs.filter(faq => faq.category === activeTab);

  const toggleQuestion = (id: string) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-14 md:mb-16">
            <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-4 animate-pulse"></div>
            <div className="h-12 bg-gray-300 rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
            <div className="flex justify-center mb-8">
              <div className="h-10 bg-gray-300 rounded w-48 animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-300 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <div className="text-[#9B5CFF] font-medium mb-2">Our Feature</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8 sm:mb-10 md:mb-12">
            <div className="inline-flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <button
                  className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base md:text-lg font-medium transition-colors duration-300 rounded-full cursor-pointer ${
                    activeTab === 'property' 
                      ? 'bg-[#586DF7] text-white' 
                      : 'text-gray-700 hover:bg-gray-100 border border-[#C9D6F3]'
                  }`}
                  onClick={() => setActiveTab('property')}
                >
                  <span className="block sm:inline">Property MGMT with </span>
                  <span className="block sm:inline">Premiere Stays</span>
                </button>
                {activeTab === 'property' && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#586DF7]"></div>
                )}
              </div>
              <div className="relative">
                <button
                  className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base md:text-lg font-medium transition-colors duration-300 rounded-full cursor-pointer ${
                    activeTab === 'booking' 
                      ? 'bg-[#586DF7] text-white' 
                      : 'text-gray-700 hover:bg-gray-100 border border-[#C9D6F3]'
                  }`}
                  onClick={() => setActiveTab('booking')}
                >
                  <span className="block sm:inline">Booking with</span>
                  <span className="block sm:inline">Premiere Stays</span>
                </button>
                {activeTab === 'booking' && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#586DF7]"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="">
          <div className="flex flex-col gap-2 sm:gap-3">
            {currentFAQs.length > 0 ? (
              currentFAQs.map((faq) => (
                <div 
                  key={faq.id} 
                  className={`border border-gray-300 rounded-lg transition-colors duration-300 ${
                    activeQuestion === faq.id ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <button
                    className={`w-full flex justify-between rounded-lg cursor-pointer items-start sm:items-center p-4 sm:p-6 text-left transition-colors duration-300 text-black ${
                      activeQuestion === faq.id 
                        ? 'bg-[#100A55] text-white' 
                        : 'text-black hover:bg-[#100A55] hover:text-white'
                    }`}
                    onClick={() => toggleQuestion(faq.id)}
                  >
                    <h3 className="text-base sm:text-lg md:text-xl font-bold pr-4">{faq.question}</h3>
                    {/* + and - icon */}
                    <div className="flex-shrink-0 mt-1 sm:mt-0">
                      {activeQuestion === faq.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                        </svg>
                      )}
                    </div>
                  </button>
                  <div 
                    className={`overflow-hidden transition-all rounded-b-lg duration-300 bg-white ease-in-out ${
                      activeQuestion === faq.id ? 'max-h-96 opacity-100 pt-4 sm:pt-6' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-gray-600 text-sm sm:text-base md:text-lg">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">No FAQs available for this category</p>
                <p className="text-sm">Please add some FAQs in the admin panel</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;