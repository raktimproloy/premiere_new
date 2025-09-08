import React, { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Loader2, Upload, X } from 'lucide-react'

export default function About() {
    const [title, setTitle] = useState('');
    const [aboutText, setAboutText] = useState('');
    const [items, setItems] = useState<string[]>([]);
    const [newItem, setNewItem] = useState('');
    const [mainMedia, setMainMedia] = useState('');
    const [mainMediaType, setMainMediaType] = useState<'image' | 'video'>('image');
    const [smallImages, setSmallImages] = useState<string[]>(['', '', '']);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadingMedia, setUploadingMedia] = useState<string | null>(null);
    const [uploadedMedia, setUploadedMedia] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load data on component mount
    useEffect(() => {
        loadAboutSettings();
    }, []);

    const loadAboutSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/page-settings/about');
            const result = await response.json();
            
            if (result.success) {
                setTitle(result.data.title || '');
                setAboutText(result.data.aboutText || '');
                setItems(result.data.items || []);
                setMainMedia(result.data.mainMedia || result.data.mainImage || '');
                setMainMediaType(result.data.mainMediaType || 'image');
                setSmallImages(result.data.smallImages || ['', '', '']);
            }
        } catch (error) {
            console.error('Error loading about settings:', error);
            setMessage('Error loading settings');
        } finally {
            setLoading(false);
        }
    };

    const saveAboutSettings = async () => {
        try {
            setSaving(true);
            setMessage('');
            
            const response = await fetch('/api/page-settings/about', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    aboutText,
                    items,
                    mainMedia,
                    mainMediaType,
                    smallImages
                })
            });

            const result = await response.json();
            
            if (result.success) {
                setMessage('Settings saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(result.message || 'Error saving settings');
            }
        } catch (error) {
            console.error('Error saving about settings:', error);
            setMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const addItem = () => {
        if (newItem.trim()) {
            setItems([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addItem();
        }
    };

    // Image upload functions
    const uploadImageToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/page-settings/upload-about-image', {
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

    const handleImageUpload = async (imageType: 'main' | 'small', index?: number, event?: React.ChangeEvent<HTMLInputElement>) => {
        const file = event?.target.files?.[0];
        if (file) {
            try {
                let allowedTypes: string[];
                let maxSize: number;
                
                if (imageType === 'main' && mainMediaType === 'video') {
                    // Video validation for main media
                    allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
                    maxSize = 50 * 1024 * 1024; // 50MB for videos
                } else {
                    // Image validation
                    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                    maxSize = 5 * 1024 * 1024; // 5MB for images
                }
                
                if (!allowedTypes.includes(file.type)) {
                    const mediaType = imageType === 'main' && mainMediaType === 'video' ? 'video' : 'image';
                    setMessage(`Invalid file type. Only ${mediaType === 'video' ? 'MP4, WebM, and OGV' : 'JPEG, PNG, and WebP'} files are allowed.`);
                    return;
                }

                if (file.size > maxSize) {
                    const maxSizeMB = maxSize / (1024 * 1024);
                    setMessage(`File size too large. Maximum size is ${maxSizeMB}MB.`);
                    return;
                }

                const imageId = imageType === 'main' ? 'main' : `small-${index}`;
                setUploadingMedia(imageId);
                setMessage(`Uploading ${imageType === 'main' && mainMediaType === 'video' ? 'video' : 'image'}...`);
                
                const imageUrl = await uploadImageToCloudinary(file);
                
                if (imageType === 'main') {
                    setMainMedia(imageUrl);
                } else if (index !== undefined) {
                    const newSmallImages = [...smallImages];
                    newSmallImages[index] = imageUrl;
                    setSmallImages(newSmallImages);
                }
                
                // Mark this media as successfully uploaded
                setUploadedMedia(prev => new Set([...prev, imageId]));
                
                setMessage(`${imageType === 'main' && mainMediaType === 'video' ? 'Video' : 'Image'} uploaded successfully!`);
                setTimeout(() => setMessage(''), 3000);
                
                // Remove the success indicator after 3 seconds
                setTimeout(() => {
                    setUploadedMedia(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(imageId);
                        return newSet;
                    });
                }, 3000);
            } catch (error) {
                console.error('Error uploading media:', error);
                setMessage(error instanceof Error ? error.message : 'Error uploading media');
            } finally {
                setUploadingMedia(null);
            }
        }
        
        // Reset the file input
        if (event?.target) {
            event.target.value = '';
        }
    };

    const removeImage = (imageType: 'main' | 'small', index?: number) => {
        if (imageType === 'main') {
            setMainMedia('');
        } else if (index !== undefined) {
            const newSmallImages = [...smallImages];
            newSmallImages[index] = '';
            setSmallImages(newSmallImages);
        }
    };

    const triggerFileInput = (imageType: 'main' | 'small', index?: number) => {
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('data-image-type', imageType);
            if (index !== undefined) {
                fileInputRef.current.setAttribute('data-image-index', index.toString());
            }
            fileInputRef.current.click();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading settings...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-800">About Page Content</h2>
                <button 
                    onClick={saveAboutSettings}
                    disabled={saving}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-md ${
                    message.includes('successfully') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-green-200'
                }`}>
                    {message}
                </div>
            )}
            
            <div className="space-y-6">
                {/* Main Media Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main About Media
                    </label>
                    
                    {/* Media Type Toggle */}
                    <div className="flex gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => setMainMediaType('image')}
                            className={`px-3 py-2 text-sm rounded-md transition-colors ${
                                mainMediaType === 'image' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Image
                        </button>
                        <button
                            type="button"
                            onClick={() => setMainMediaType('video')}
                            className={`px-3 py-2 text-sm rounded-md transition-colors ${
                                mainMediaType === 'video' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Video
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-32 h-32 relative bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {uploadingMedia === 'main' ? (
                                <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                            ) : mainMedia ? (
                                <div className="relative w-full h-full">
                                    {mainMediaType === 'image' ? (
                                        <img 
                                            src={mainMedia} 
                                            alt="Main About" 
                                            className={`w-full h-full object-cover rounded-lg ${
                                                uploadedMedia.has('main') ? 'ring-2 ring-green-500' : ''
                                            }`}
                                            onError={(e) => {
                                                e.currentTarget.src = '';
                                            }}
                                        />
                                    ) : (
                                        <video 
                                            src={mainMedia} 
                                            className={`w-full h-full object-cover rounded-lg ${
                                                uploadedMedia.has('main') ? 'ring-2 ring-green-500' : ''
                                            }`}
                                            controls
                                            muted
                                        />
                                    )}
                                    {uploadedMedia.has('main') && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                                            <span className="text-xs">✓</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">No {mainMediaType}</span>
                                </div>
                            )}
                            
                            {/* Upload Button */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                <button
                                    onClick={() => triggerFileInput('main')}
                                    disabled={uploadingMedia === 'main'}
                                    className="opacity-0 hover:opacity-100 transition-opacity p-2 bg-white rounded-full shadow-lg disabled:opacity-50"
                                >
                                    {uploadingMedia === 'main' ? (
                                        <Loader2 className="w-4 h-4 text-gray-700 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4 text-gray-700" />
                                    )}
                                </button>
                            </div>

                            {/* Remove Media Button */}
                            {mainMedia && (
                                <button
                                    onClick={() => removeImage('main')}
                                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">
                                {mainMediaType === 'image' 
                                    ? 'Upload a high-quality image for the main about section. Recommended size: 800x600px or larger.'
                                    : 'Upload a video for the main about section. Supported formats: MP4, WebM, OGV. Recommended duration: 10-30 seconds.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Small Images Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Small About Images (3 images)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {smallImages.map((image, index) => (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <div className="w-24 h-24 relative bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                    {uploadingMedia === `small-${index}` ? (
                                        <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                        </div>
                                    ) : image ? (
                                        <div className="relative w-full h-full">
                                            <img 
                                                src={image} 
                                                alt={`Small About ${index + 1}`} 
                                                className={`w-full h-full object-cover rounded-lg ${
                                                    uploadedMedia.has(`small-${index}`) ? 'ring-2 ring-green-500' : ''
                                                }`}
                                                onError={(e) => {
                                                    e.currentTarget.src = '';
                                                }}
                                            />
                                            {uploadedMedia.has(`small-${index}`) && (
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
                                            onClick={() => triggerFileInput('small', index)}
                                            disabled={uploadingMedia === `small-${index}`}
                                            className="opacity-0 hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-lg disabled:opacity-50"
                                        >
                                            {uploadingMedia === `small-${index}` ? (
                                                <Loader2 className="w-3 h-3 text-gray-700 animate-spin" />
                                            ) : (
                                                <Upload className="w-3 h-3 text-gray-700" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Remove Image Button */}
                                    {image && (
                                        <button
                                            onClick={() => removeImage('small', index)}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">Image {index + 1}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        Upload 3 small images for the about section. Recommended size: 400x300px or larger.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        placeholder="Enter page title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        About Text
                    </label>
                    <textarea
                        rows={8}
                        placeholder="Enter your about page content here..."
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-vertical"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Press Enter to add line breaks. These will be preserved in the backend.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        About Items
                    </label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Add new item..."
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        />
                        <button
                            onClick={addItem}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>
                    
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                                <span className="text-gray-700">{item}</span>
                                <button
                                    onClick={() => removeItem(index)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hidden file input for media uploads */}
            <input
                ref={fileInputRef}
                type="file"
                accept={mainMediaType === 'image' ? 'image/*' : 'video/*'}
                className="hidden"
                onChange={(e) => {
                    const imageType = e.currentTarget.getAttribute('data-image-type') as 'main' | 'small';
                    const imageIndex = e.currentTarget.getAttribute('data-image-index');
                    if (imageType === 'main') {
                        handleImageUpload('main', undefined, e);
                    } else if (imageType === 'small' && imageIndex) {
                        handleImageUpload('small', parseInt(imageIndex), e);
                    }
                }}
            />
        </div>
    )
}
