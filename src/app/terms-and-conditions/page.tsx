'use client';

import DefaultLayout from '@/components/layout/DefaultLayout'
import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react';

export default function TermsPage() {
  const [termsContent, setTermsContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch terms & conditions data on component mount
  useEffect(() => {
    const fetchTermsData = async () => {
      try {
        console.log('Fetching terms & conditions data...');
        const response = await fetch('/api/page-settings/terms/public');
        console.log('Terms API response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Terms API result:', result);
          
          if (result.success) {
            console.log('Terms content received:', result.data.termsContent);
            setTermsContent(result.data.termsContent || '');
          } else {
            console.error('Terms API returned error:', result.message);
            setError('Failed to load terms & conditions');
          }
        } else {
          console.error('Terms API failed with status:', response.status);
          setError('Failed to load terms & conditions');
        }
      } catch (error) {
        console.error('Error fetching terms & conditions:', error);
        setError('Failed to load terms & conditions');
      } finally {
        setLoading(false);
      }
    };

    fetchTermsData();
  }, []);
  
  if (loading) {
    return (
      <DefaultLayout>
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Loading terms & conditions...</span>
            </div>
          </div>
        </section>
      </DefaultLayout>
    );
  }
  
  if (error) {
    return (
      <DefaultLayout>
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </section>
      </DefaultLayout>
    );
  }
  
  return (
    <DefaultLayout>
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
            <p className="text-lg text-gray-600">
              Please read these terms and conditions carefully before using our services.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {termsContent ? (
              <div 
                className="enhanced-prose"
                dangerouslySetInnerHTML={{ __html: termsContent }}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Terms & conditions content is not available at the moment.</p>
                <p className="text-sm mt-2">Please check back later or contact support.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </DefaultLayout>
  )
}
