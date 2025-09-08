import React, { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Loader2, Upload, X, Edit2 } from 'lucide-react';

interface Partner {
    id: string;
    name: string;
    image: string;
    website?: string;
}

interface Feature {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export default function Home() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadingImage, setUploadingImage] = useState<string | null>(null);
    const [uploadedImages, setUploadedImages] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load data on component mount
    useEffect(() => {
        loadHomeSettings();
    }, []);

    const loadHomeSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/page-settings/home');
            const result = await response.json();
            
            if (result.success) {
                setPartners(result.data.partners || []);
                setFeatures(result.data.features || []);
            }
        } catch (error) {
            console.error('Error loading home settings:', error);
            setMessage('Error loading settings');
        } finally {
            setLoading(false);
        }
    };

    const saveHomeSettings = async () => {
        try {
            setSaving(true);
            setMessage('');
            
            const response = await fetch('/api/page-settings/home', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    partners,
                    features
                })
            });

            const result = await response.json();
            
            if (result.success) {
                setMessage('Home page settings saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(result.message || 'Error saving settings');
            }
        } catch (error) {
            console.error('Error saving home settings:', error);
            setMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    // Partner management functions
    const addPartner = () => {
        const newPartner: Partner = {
            id: Date.now().toString(),
            name: '',
            image: '',
            website: ''
        };
        setPartners([...partners, newPartner]);
    };

    const updatePartner = (id: string, field: keyof Partner, value: string) => {
        setPartners(partners.map(partner => 
            partner.id === id ? { ...partner, [field]: value } : partner
        ));
    };

    const removePartner = (id: string) => {
        setPartners(partners.filter(partner => partner.id !== id));
    };

    // Feature management functions
    const addFeature = () => {
        const newFeature: Feature = {
            id: Date.now().toString(),
            icon: '',
            title: '',
            description: ''
        };
        setFeatures([...features, newFeature]);
    };

    const updateFeature = (id: string, field: keyof Feature, value: string) => {
        setFeatures(features.map(feature => 
            feature.id === id ? { ...feature, [field]: value } : feature
        ));
    };

    const removeFeature = (id: string) => {
        setFeatures(features.filter(feature => feature.id !== id));
    };

    // Image upload functions
    const uploadImageToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/page-settings/upload-home-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload image');
        }

        const result = await response.json();
        return result.url;
    };

    const handleImageUpload = async (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    setMessage('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
                    return;
                }

                // Validate file size (max 5MB)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    setMessage('File size too large. Maximum size is 5MB.');
                    return;
                }

                setUploadingImage(id);
                setMessage('Uploading image...');
                
                const imageUrl = await uploadImageToCloudinary(file);
                
                // Update the partner with the new image URL
                updatePartner(id, 'image', imageUrl);
                
                // Mark this image as successfully uploaded
                setUploadedImages(prev => new Set([...prev, id]));
                
                setMessage('Image uploaded successfully!');
                setTimeout(() => setMessage(''), 3000);
                
                // Remove the success indicator after 3 seconds
                setTimeout(() => {
                    setUploadedImages(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(id);
                        return newSet;
                    });
                }, 3000);
            } catch (error) {
                console.error('Error uploading image:', error);
                setMessage(error instanceof Error ? error.message : 'Error uploading image');
            } finally {
                setUploadingImage(null);
            }
        }
        
        // Reset the file input
        if (event.target) {
            event.target.value = '';
        }
    };

    const removeImage = (id: string) => {
        updatePartner(id, 'image', '');
    };

    const triggerFileInput = (id: string) => {
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('data-partner-id', id);
            fileInputRef.current.click();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading home page settings...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-800">Home Page Content</h2>
                <button 
                    onClick={saveHomeSettings}
                    disabled={saving}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save All Changes'
                    )}
                </button>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-md ${
                    message.includes('successfully') || message.includes('uploaded successfully')
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {message}
                </div>
            )}

            {/* Hidden file input for image uploads */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const partnerId = e.currentTarget.getAttribute('data-partner-id');
                    if (partnerId) {
                        handleImageUpload(partnerId, e);
                    }
                }}
            />

            {/* Partners Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium text-gray-700">Trusted Partners</h3>
                    <button
                        onClick={addPartner}
                        className="px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Partner
                    </button>
                </div>

                <div className="grid gap-4">
                    {partners.map((partner) => (
                        <div key={partner.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-4">
                                {/* Partner Image */}
                                <div className="w-20 h-20 relative bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {uploadingImage === partner.id ? (
                                        <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                        </div>
                                    ) : partner.image ? (
                                        <div className="relative w-full h-full">
                                            <img 
                                                src={partner.image} 
                                                alt="Partner" 
                                                className={`w-full h-full object-cover rounded-lg ${
                                                    uploadedImages.has(partner.id) ? 'ring-2 ring-green-500' : ''
                                                }`}
                                                onError={(e) => {
                                                    e.currentTarget.src = '';
                                                }}
                                            />
                                            {uploadedImages.has(partner.id) && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
                                                    <span className="text-xs">✓</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-500 text-xs">No Image</span>
                                        </div>
                                    )}
                                    
                                    {/* Upload Button */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                        <button
                                            onClick={() => triggerFileInput(partner.id)}
                                            disabled={uploadingImage === partner.id}
                                            className="opacity-0 hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-lg disabled:opacity-50"
                                        >
                                            {uploadingImage === partner.id ? (
                                                <Loader2 className="w-3 h-3 text-gray-700 animate-spin" />
                                            ) : (
                                                <Upload className="w-3 h-3 text-gray-700" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Remove Image Button */}
                                    {partner.image && (
                                        <button
                                            onClick={() => removeImage(partner.id)}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Partner Details */}
                                <div className="flex-1 space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Partner Name"
                                        value={partner.name}
                                        onChange={(e) => updatePartner(partner.id, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <input
                                        type="url"
                                        placeholder="Website URL (optional)"
                                        value={partner.website || ''}
                                        onChange={(e) => updatePartner(partner.id, 'website', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Remove Partner Button */}
                                <button
                                    onClick={() => removePartner(partner.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium text-gray-700">Features Section</h3>
                    <button
                        onClick={addFeature}
                        className="px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Feature
                    </button>
                </div>

                <div className="grid gap-4">
                    {features.map((feature) => (
                        <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-1 space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Icon (e.g., star, heart, shield)"
                                        value={feature.icon}
                                        onChange={(e) => updateFeature(feature.id, 'icon', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Feature Title"
                                        value={feature.title}
                                        onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <textarea
                                        rows={2}
                                        placeholder="Feature Description"
                                        value={feature.description}
                                        onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                    />
                                </div>

                                <button
                                    onClick={() => removeFeature(feature.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
