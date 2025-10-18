'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import DefaultLayout from '@/components/layout/DefaultLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function ConfirmBookingPage() {
  const searchParams = useSearchParams();
  const [propertyKey, setPropertyKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Prefer key from query param, fallback to sessionStorage
    const keyFromQuery = searchParams.get('key');
    if (keyFromQuery) {
      const sanitized = keyFromQuery.replace(/-/g, '');
      console.log("sanitized" , sanitized)
      setPropertyKey(sanitized);
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('selectedPropertyKey', sanitized);
        }
      } catch {}
    } else {
      try {
        if (typeof window !== 'undefined') {
          const stored = sessionStorage.getItem('selectedPropertyKey');
          const sanitizedStored = stored ? stored.replace(/-/g, '') : null;
          if (sanitizedStored && sanitizedStored !== stored) {
            sessionStorage.setItem('selectedPropertyKey', sanitizedStored);
          }
          setPropertyKey(sanitizedStored);
        }
      } catch {
        setPropertyKey(null);
      }
    }
    setIsReady(true);
  }, [searchParams]);

  if (!isReady) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-gray-600">Preparing booking confirmation...</p>
      </div>
    );
  }

  if (!propertyKey) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Missing property key</h1>
        <p className="text-gray-600">Go back and select a property to continue.</p>
      </div>
    );
  }


  return (
    <ProtectedRoute >
      <DefaultLayout>
      <section className="w-full min-h-screen">
        {/* Full-bleed container so it feels native to the site */}
        <div className="w-full">
          <iframe
            title="OwnerRez Booking/Inquiry"
            src={`https://app.ownerrez.com/widgets/703dd940f3ae4ca9b059cf72e95297d1?view=form&propertyKey=${propertyKey}`}
            className="w-full h-[calc(100vh-0px)] md:h-[calc(100vh-0px)]"
            style={{ border: 'none', display: 'block' }}
            loading="eager"
            allow="clipboard-write; accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </section>
      </DefaultLayout>
    </ProtectedRoute>
  );
}


