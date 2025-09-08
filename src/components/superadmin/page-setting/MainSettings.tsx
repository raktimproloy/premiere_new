import React, { useState, useEffect } from 'react'
import { Loader2, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

interface MainSettings {
    phone: string;
    email: string;
    address: string;
    facebook: string;
    x: string;
    instagram: string;
    youtube: string;
}

export default function MainSettings() {
    const [settings, setSettings] = useState<MainSettings>({
        phone: '',
        email: '',
        address: '',
        facebook: '',
        x: '',
        instagram: '',
        youtube: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Load data on component mount
    useEffect(() => {
        loadMainSettings();
    }, []);

    const loadMainSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/page-settings/main');
            const result = await response.json();
            
            if (result.success) {
                setSettings(result.data);
            }
        } catch (error) {
            console.error('Error loading main settings:', error);
            setMessage('Error loading settings');
        } finally {
            setLoading(false);
        }
    };

    const saveMainSettings = async () => {
        try {
            setSaving(true);
            setMessage('');
            
            const response = await fetch('/api/page-settings/main', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings)
            });

            const result = await response.json();
            
            if (result.success) {
                setMessage('Main settings saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(result.message || 'Error saving settings');
            }
        } catch (error) {
            console.error('Error saving main settings:', error);
            setMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof MainSettings, value: string) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading main settings...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-800">Main Settings</h2>
                <button 
                    onClick={saveMainSettings}
                    disabled={saving}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Settings'
                    )}
                </button>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-md ${
                    message.includes('successfully') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {message}
                </div>
            )}
            
            <div className="grid gap-6">
                {/* Contact Information Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Information</h3>
                    <div className="grid gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Phone className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+1 (555) 123-4567"
                                    value={settings.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Mail className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="info@premierestays.com"
                                    value={settings.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Enter your business address..."
                                    value={settings.address}
                                    onChange={(e) => updateField('address', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Social Media Links</h3>
                    <div className="grid gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Facebook className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Facebook URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://facebook.com/premierestays"
                                    value={settings.facebook}
                                    onChange={(e) => updateField('facebook', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                                <Twitter className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    X (Twitter) URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://x.com/premierestays"
                                    value={settings.x}
                                    onChange={(e) => updateField('x', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Instagram className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instagram URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://instagram.com/premierestays"
                                    value={settings.instagram}
                                    onChange={(e) => updateField('instagram', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Youtube className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    YouTube URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://youtube.com/@premierestays"
                                    value={settings.youtube}
                                    onChange={(e) => updateField('youtube', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Preview</h3>
                    <div className="grid gap-4 text-sm">
                        {settings.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{settings.phone}</span>
                            </div>
                        )}
                        {settings.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{settings.email}</span>
                            </div>
                        )}
                        {settings.address && (
                            <div className="flex items-start gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 mt-0.5" />
                                <span>{settings.address}</span>
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            {settings.facebook && (
                                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                            {settings.x && (
                                <a href={settings.x} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-800">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            )}
                            {settings.instagram && (
                                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {settings.youtube && (
                                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800">
                                    <Youtube className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
