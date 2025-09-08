import React, { useState, useEffect, useRef } from 'react'
import { Plus, Star, Trash2, Upload, X, Loader2 } from 'lucide-react';

interface Testimonial {
    id: string;
    rating: number;
    description: string;
    profileImage: string;
    name: string;
    publishDate: string;
  }
  
export default function Testimonial() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadingImage, setUploadingImage] = useState<string | null>(null);
    const [uploadedImages, setUploadedImages] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load data on component mount
    useEffect(() => {
        loadTestimonialsSettings();
    }, []);

    const loadTestimonialsSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/page-settings/testimonials');
            const result = await response.json();
            
            if (result.success) {
                setTestimonials(result.data.testimonials || []);
            }
        } catch (error) {
            console.error('Error loading testimonials settings:', error);
            setMessage('Error loading settings');
        } finally {
            setLoading(false);
        }
    };

    const saveTestimonialsSettings = async () => {
        try {
            setSaving(true);
            setMessage('');
            
            const response = await fetch('/api/page-settings/testimonials', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    testimonials
                })
            });

            const result = await response.json();
            
            if (result.success) {
                setMessage('Testimonials saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(result.message || 'Error saving testimonials');
            }
        } catch (error) {
            console.error('Error saving testimonials settings:', error);
            setMessage('Error saving testimonials');
        } finally {
            setSaving(false);
        }
    };

    const uploadImageToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/page-settings/upload-testimonial-image', {
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
                
                console.log('Starting image upload for testimonial:', id);
                const imageUrl = await uploadImageToCloudinary(file);
                console.log('Image uploaded successfully, URL:', imageUrl);
                
                // Update the testimonial with the new image URL
                updateTestimonial(id, 'profileImage', imageUrl);
                console.log('Testimonial updated with new image URL:', imageUrl);
                
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

    const addTestimonial = () => {
        const newTestimonial: Testimonial = {
          id: Date.now().toString(),
          rating: 5,
          description: '',
          profileImage: '/images/profile2.jpg',
          name: '',
          publishDate: new Date().toISOString().split('T')[0]
        };
        setTestimonials([...testimonials, newTestimonial]);
      };
    
      const updateTestimonial = (id: string, field: keyof Testimonial, value: any) => {
        console.log('Updating testimonial:', { id, field, value, currentState: testimonials });
        setTestimonials(prevTestimonials => {
          const updated = prevTestimonials.map(testimonial => 
          testimonial.id === id ? { ...testimonial, [field]: value } : testimonial
          );
          console.log('Updated testimonials state:', updated);
          return updated;
        });
      };
    
      const removeTestimonial = (id: string) => {
        setTestimonials(testimonials.filter(testimonial => testimonial.id !== id));
      };

      const removeImage = (id: string) => {
        updateTestimonial(id, 'profileImage', '/images/profile2.jpg');
      };

      const triggerFileInput = (id: string) => {
        if (fileInputRef.current) {
          fileInputRef.current.setAttribute('data-testimonial-id', id);
          fileInputRef.current.click();
        }
      };
    
      const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ));
      };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading testimonials...</span>
            </div>
        );
    }

  return (
    <div>
        <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-800">Testimonials</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={saveTestimonialsSettings}
                        disabled={saving}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save All Testimonials'
                        )}
                    </button>
        <button
            onClick={addTestimonial}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
            <Plus className="w-4 h-4" />
            Add Testimonial
        </button>
        </div>
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
                    const testimonialId = e.currentTarget.getAttribute('data-testimonial-id');
                    if (testimonialId) {
                        handleImageUpload(testimonialId, e);
                    }
                }}
            />
        
        <div className="grid gap-6">
        {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                                <div className="w-16 h-16 relative bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                    {uploadingImage === testimonial.id ? (
                                        <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                        </div>
                                    ) : testimonial.profileImage && testimonial.profileImage !== '/images/profile2.jpg' ? (
                                        <div className="relative w-full h-full">
                    <img 
                    src={testimonial.profileImage} 
                    alt="Profile" 
                                                className={`w-full h-full object-cover rounded-full ${
                                                    uploadedImages.has(testimonial.id) ? 'ring-2 ring-green-500' : ''
                                                }`}
                                                onError={(e) => {
                                                    console.error('Image failed to load:', testimonial.profileImage);
                                                    e.currentTarget.src = '/images/profile2.jpg';
                                                }}
                                                onLoad={() => {
                                                    console.log('Image loaded successfully:', testimonial.profileImage);
                                                }}
                                            />
                                            {uploadedImages.has(testimonial.id) && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
                                                    <span className="text-xs">✓</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-gray-500 text-xs">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                        <button
                                            onClick={() => triggerFileInput(testimonial.id)}
                                            disabled={uploadingImage === testimonial.id}
                                            className="opacity-0 hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-lg disabled:opacity-50"
                                        >
                                            {uploadingImage === testimonial.id ? (
                                                <Loader2 className="w-3 h-3 text-gray-700 animate-spin" />
                                            ) : (
                                                <Upload className="w-3 h-3 text-gray-700" />
                                            )}
                                        </button>
                                    </div>
                                    {testimonial.profileImage !== '/images/profile2.jpg' && testimonial.profileImage && (
                                        <button
                                            onClick={() => removeImage(testimonial.id)}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                </div>
                <div className="flex-1">
                    <input
                    type="text"
                    placeholder="Name"
                    value={testimonial.name}
                    onChange={(e) => updateTestimonial(testimonial.id, 'name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                    />
                    <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rating:</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => updateTestimonial(testimonial.id, 'rating', star)}
                            className="text-gray-300 hover:text-yellow-400 transition-colors"
                        >
                            <Star className={`w-4 h-4 ${star <= testimonial.rating ? 'text-yellow-400 fill-current' : ''}`} />
                        </button>
                        ))}
                    </div>
                    </div>
                                    {testimonial.profileImage && testimonial.profileImage !== '/images/profile2.jpg' && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            <span className="font-medium">Image URL:</span>
                                            <div className="truncate max-w-xs" title={testimonial.profileImage}>
                                                {testimonial.profileImage}
                                            </div>
                                        </div>
                                    )}
                </div>
                </div>
                <button
                onClick={() => removeTestimonial(testimonial.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                <Trash2 className="w-4 h-4" />
                </button>
            </div>
            
            <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Testimonial
                </label>
                <textarea
                    rows={3}
                    placeholder="Enter testimonial content..."
                    value={testimonial.description}
                    onChange={(e) => updateTestimonial(testimonial.id, 'description', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-vertical"
                />
                </div>
                
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publish Date
                </label>
                <input
                    type="date"
                    value={testimonial.publishDate}
                    onChange={(e) => updateTestimonial(testimonial.id, 'publishDate', e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                </div>
            </div>
            </div>
        ))}
        </div>
    </div>
  )
}
