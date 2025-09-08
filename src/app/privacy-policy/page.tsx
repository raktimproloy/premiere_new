'use client';

import DefaultLayout from '@/components/layout/DefaultLayout'
import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react';

export default function PrivacyPage() {
  const [privacyContent, setPrivacyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch privacy policy data on component mount
  useEffect(() => {
    const fetchPrivacyData = async () => {
      try {
        console.log('Fetching privacy policy data...');
        const response = await fetch('/api/page-settings/privacy/public');
        console.log('Privacy API response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Privacy API result:', result);
          
          if (result.success) {
            console.log('Privacy content received:', result.data.privacyContent);
            setPrivacyContent(result.data.privacyContent || '');
          } else {
            console.error('Privacy API returned error:', result.message);
            setError('Failed to load privacy policy');
          }
        } else {
          console.error('Privacy API failed with status:', response.status);
          setError('Failed to load privacy policy');
        }
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
        setError('Failed to load privacy policy');
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyData();
  }, []);
  
  if (loading) {
    return (
      <DefaultLayout>
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Loading privacy policy...</span>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {privacyContent ? (
              <div 
                className="enhanced-prose"
                dangerouslySetInnerHTML={{ __html: privacyContent }}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Privacy policy content is not available at the moment.</p>
                <p className="text-sm mt-2">Please check back later or contact support.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </DefaultLayout>
  )
}
