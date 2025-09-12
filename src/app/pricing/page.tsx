import DefaultLayout from '@/components/layout/DefaultLayout';
import React from 'react';

const PremiereStaysPricing = () => {
  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Premiere Stays Management Pricing
            </h1>
            <p className="text-lg text-gray-600">
              Designed for Miami & South Florida Property Owners
            </p>
          </div>

          {/* Pricing Tiers */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Pricing Tiers</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Basic Tier */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-blue-100 py-4 px-6">
                  <h3 className="text-xl font-bold text-gray-800">Basic – Essential Management</h3>
                  <p className="text-2xl font-bold text-blue-700 mt-2">15% of rental income</p>
                  <p className="text-sm text-gray-600 mt-1">Best for new hosts or budget-conscious owners</p>
                </div>
                <div className="p-6">
                  <h4 className="font-medium text-gray-700 mb-2">Included Services:</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Listing creation & optimization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Guest communication</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Cleaning coordination</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Dynamic pricing (lite)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Basic owner portal</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Standard Tier */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform md:scale-105">
                <div className="bg-blue-200 py-4 px-6">
                  <h3 className="text-xl font-bold text-gray-800">Standard – Enhanced Management</h3>
                  <p className="text-2xl font-bold text-blue-700 mt-2">18% of rental income</p>
                  <p className="text-sm text-gray-600 mt-1">Owners seeking polished presentation & stronger guest support</p>
                </div>
                <div className="p-6">
                  <h4 className="font-medium text-gray-700 mb-2">All Basic services plus:</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Professional photography</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Automated dynamic pricing</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>24/7 guest support</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Monthly financial reports</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Review management</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Premium Tier */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-blue-300 py-4 px-6">
                  <h3 className="text-xl font-bold text-gray-800">Premium – Full-Service Luxury</h3>
                  <p className="text-2xl font-bold text-blue-700 mt-2">20% of rental income</p>
                  <p className="text-sm text-gray-600 mt-1">Luxury homes & investors seeking complete peace of mind</p>
                </div>
                <div className="p-6">
                  <h4 className="font-medium text-gray-700 mb-2">All Standard services plus:</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Design consultation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Revenue forecasting</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Advanced marketing & SEO</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Insurance coordination</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Real-time dashboard</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Concierge guest services</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Quarterly strategy call</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Launch Discount */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Launch Discount</h2>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-700 mb-2">Founding Host Program</h3>
              <p className="text-gray-700 mb-4">For our first 10 clients:</p>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">•</span>
                  <span>Enjoy <span className="font-bold">50% off management fees</span> for the first 3 months.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">•</span>
                  <span>No long-term contracts. Cancel anytime with 30-day notice.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Volume Discounts */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Volume Discounts</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden max-w-md mx-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Portfolio Size</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Discounted Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 text-gray-700">1–2 Units</td>
                    <td className="py-3 px-4 text-gray-700">Standard Rates (15%–20%)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">3–5 Units</td>
                    <td className="py-3 px-4 text-gray-700">–1% (14%–19%)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-700">6–10 Units</td>
                    <td className="py-3 px-4 text-gray-700">–2% (13%–18%)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">10+ Units</td>
                    <td className="py-3 px-4 text-gray-700">–3% (12%–17%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Why Premiere Stays? */}
          <div className="bg-blue-50 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Why Premiere Stays?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Consistently 4.8–5.0 star ratings</h3>
                  <p className="text-gray-600">on Airbnb & VRBO</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Hotel-level standards</h3>
                  <p className="text-gray-600">with every turnover</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Transparent communication</h3>
                  <p className="text-gray-600">& reporting</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Miami market expertise</h3>
                  <p className="text-gray-600">local knowledge for optimal returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PremiereStaysPricing;