'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
// Using simple SVG icons instead of heroicons

interface BookingConfirmationProps {
  bookingData: {
    bookingId: string;
    propertyName: string;
    propertyImage: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: number;
    guestName: string;
    guestEmail: string;
    guests: number;
    propertyAddress: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
  };
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ bookingData }) => {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleViewBookings = () => {
    router.push('/profile');
  };

  const handleBookAnother = () => {
    router.push('/book-now');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600">Your reservation has been successfully confirmed</p>
          <div className="mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            Booking Reference: <span className="font-mono font-bold">#{bookingData.bookingId}</span>
          </div>
        </div>

        {/* Main Confirmation Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          {/* Property Details Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Property Details
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Property Image */}
              <div className="lg:col-span-1">
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-200">
                  <img 
                    src={bookingData.propertyImage} 
                    alt={bookingData.propertyName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Property Info */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{bookingData.propertyName}</h3>
                <p className="text-gray-600 mb-4">{bookingData.propertyAddress}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{bookingData.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{bookingData.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{bookingData.guests}</div>
                    <div className="text-sm text-gray-600">Guests</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{bookingData.propertyType}</div>
                    <div className="text-sm text-gray-600">Type</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Details Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Stay Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg mr-4 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Check-in</p>
                    <p className="text-lg font-bold text-gray-900">{bookingData.checkInDate}</p>
                    <p className="text-sm text-gray-600">After 3:00 PM</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg mr-4 flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Check-out</p>
                    <p className="text-lg font-bold text-gray-900">{bookingData.checkOutDate}</p>
                    <p className="text-sm text-gray-600">Before 11:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Guest Information
            </h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full mr-4 flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{bookingData.guestName}</h4>
                  <p className="text-gray-600">{bookingData.guestEmail}</p>
                  <p className="text-sm text-gray-500">Primary Guest</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment Summary
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-medium text-gray-700">Total Amount</span>
                <span className="text-3xl font-bold text-blue-600">
                  ${bookingData.totalAmount.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Payment will be processed according to your selected payment method
              </p>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Important Information
            </h3>
            <ul className="text-sm text-yellow-700 space-y-2">
              <li>• A confirmation email has been sent to <strong>{bookingData.guestEmail}</strong></li>
              <li>• Please check your inbox and spam folder for booking details</li>
              <li>• Bring a valid ID for check-in</li>
              <li>• Contact property management for early check-in requests</li>
              <li>• Free cancellation up to 30 days before check-in</li>
            </ul>
          </div>

          {/* Support Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><strong>Email:</strong> support@premiere-stays.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
              <div>
                <p><strong>Hours:</strong> 24/7 Support</p>
                <p><strong>Response:</strong> Within 2 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleBackToHome}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </button>
          
          <button
            onClick={handleBookAnother}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Book Another Stay
          </button>
          
          <button
            onClick={handleViewBookings}
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            View My Bookings
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Thank you for choosing Premiere Stays!</p>
          <p className="mt-1">We look forward to hosting you.</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
