'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BookingConfirmation from '@/components/checkout/BookingConfirmation';
import DefaultLayout from '@/components/layout/DefaultLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get booking data from URL parameters
    const bookingId = searchParams.get('bookingId');
    const propertyName = searchParams.get('propertyName');
    const propertyImage = searchParams.get('propertyImage');
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');
    const totalAmount = searchParams.get('totalAmount');
    const guestName = searchParams.get('guestName');
    const guestEmail = searchParams.get('guestEmail');
    const guests = searchParams.get('guests');
    const propertyAddress = searchParams.get('propertyAddress');
    const propertyType = searchParams.get('propertyType');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');

    // Validate required parameters
    if (!bookingId || !propertyName || !checkInDate || !checkOutDate || !totalAmount || !guestName || !guestEmail) {
      console.error('Missing required booking parameters');
      router.push('/');
      return;
    }

    // Set booking data
    setBookingData({
      bookingId,
      propertyName,
      propertyImage: propertyImage || '/images/property.png',
      checkInDate,
      checkOutDate,
      totalAmount: parseFloat(totalAmount),
      guestName,
      guestEmail,
      guests: parseInt(guests || '1'),
      propertyAddress: propertyAddress || 'Address not available',
      propertyType: propertyType || 'Property',
      bedrooms: parseInt(bedrooms || '1'),
      bathrooms: parseInt(bathrooms || '1')
    });

    setLoading(false);
  }, [searchParams, router]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <LoadingSpinner size="xl" color="blue" />
        </div>
      </DefaultLayout>
    );
  }

  if (!bookingData) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Confirmation</h1>
            <p className="text-gray-600 mb-6">The confirmation link is invalid or has expired.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <BookingConfirmation bookingData={bookingData} />
    </DefaultLayout>
  );
}
