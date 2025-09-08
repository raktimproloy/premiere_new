'use client'
import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import BillingAddressSection from './BillingAddressSection';
import PropertyPreferencesSection from './PropertyPreferencesSection';
import SocialMediaSection from './SocialMediaSection';
import SettingsHeader from './SettingsHeader';

interface UserSettings {
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  propertyPreferences: {
    preferredLocation: string;
    maxPrice: number;
    propertyType: string;
    minBedrooms: number;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/settings');
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      } else {
        setError(data.message || 'Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(updatedSettings as UserSettings);
        return { success: true, message: 'Settings updated successfully' };
      } else {
        return { success: false, message: data.message || 'Failed to update settings' };
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, message: 'Failed to update settings' };
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F8F9FB] min-h-screen py-6 sm:py-8 px-2 sm:px-4 md:px-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <FaSpinner className="animate-spin text-blue-600 text-xl" />
          <span className="text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F8F9FB] min-h-screen py-6 sm:py-8 px-2 sm:px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-[#F8F9FB] min-h-screen py-6 sm:py-8 px-2 sm:px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No settings found</p>
          <button 
            onClick={fetchSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FB] min-h-screen py-6 sm:py-8 px-2 sm:px-4 md:px-8">
      <SettingsHeader />
      
      <div className="max-w-7xl mx-auto space-y-6">
        <BillingAddressSection 
          billingAddress={settings.billingAddress}
          onUpdate={(billingAddress) => updateSettings({ billingAddress })}
        />
        
        <PropertyPreferencesSection 
          propertyPreferences={settings.propertyPreferences}
          onUpdate={(propertyPreferences) => updateSettings({ propertyPreferences })}
        />
        
        <SocialMediaSection 
          socialMedia={settings.socialMedia}
          onUpdate={(socialMedia) => updateSettings({ socialMedia })}
        />
      </div>
    </div>
  );
}
