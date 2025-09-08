"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EditModal from './editModal';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('@/components/common/Editor'), { ssr: false });

interface Property {
  id: number;
  name: string;
  address: {
    street1: string;
    street2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  bathrooms: number;
  bathrooms_full: number;
  bathrooms_half: number;
  bedrooms: number;
  max_guests: number;
  property_type: string;
  active: boolean;
  check_in: string;
  check_out: string;
  thumbnail_url?: string;
  [key: string]: any;
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;

  // Form state
  const [propertyName, setPropertyName] = useState('');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [totalBathroom, setTotalBathroom] = useState('');
  const [totalBedroom, setTotalBedroom] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [checkIn, setCheckIn] = useState('15:00');
  const [checkOut, setCheckOut] = useState('11:00');
  const [isActive, setIsActive] = useState(true);
  const [editorValue, setEditorValue] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // File upload state
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ url: string; publicId?: string; alt?: string; isPrimary?: boolean }>>([]);
  const [removedExistingPublicIds, setRemovedExistingPublicIds] = useState<string[]>([]);
  const [localPropertyId, setLocalPropertyId] = useState<string | null>(null);

  // Fetch property data on component mount
  useEffect(() => {
    if (propertyId) {
      fetchPropertyData();
    } else {
      setError('Property ID is required');
      setFetching(false);
    }
  }, [propertyId]);

  const fetchPropertyData = async () => {
    try {
      setFetching(true);
      setError(null);

      const response = await fetch(`/api/properties/${propertyId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch property data');
      }

      const property: Property = data.property;
      
      // Populate form fields
      setPropertyName(property.name || '');
      setPropertyLocation(property.address?.street1 || '');
      setCity(property.address?.city || '');
      setState(property.address?.state || '');
      setPostalCode(property.address?.postal_code || '');
      setCountry(property.address?.country || '');
      setTotalBathroom(property.bathrooms?.toString() || '');
      setTotalBedroom(property.bedrooms?.toString() || '');
      setPropertyType(property.property_type || '');
      setCapacity(property.max_guests?.toString() || '');
      setCheckIn(property.check_in || '15:00');
      setCheckOut(property.check_out || '11:00');
      setIsActive(property.active !== false);
      // Prefill editor with local description if available
      const localDescription = (property as any)?.localData?.description || (property as any)?.description || '';
      setEditorValue(localDescription);
      // Capture local Mongo _id for image operations
      setLocalPropertyId(data.localId || (property as any)?.localData?._id || null);
      
      // Set existing images
      const localImagesFromMerged: Array<{ url: string; publicId?: string; alt?: string; isPrimary?: boolean }> = (property as any)?.localData?.images || [];
      const localImagesOnly: Array<{ url: string; publicId?: string; alt?: string; isPrimary?: boolean }> = (data?.source === 'local_only' ? (property as any)?.images : []) || [];
      if (localImagesFromMerged.length > 0) {
        setExistingImages(localImagesFromMerged);
      } else if (localImagesOnly.length > 0) {
        setExistingImages(localImagesOnly);
      } else if (property.thumbnail_url) {
        setExistingImages([{ url: property.thumbnail_url }]);
      }

    } catch (err) {
      console.error('Error fetching property:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch property data');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!propertyName.trim()) {
      setError('Property name is required');
      return;
    }

    if (!propertyLocation.trim()) {
      setError('Property location is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, handle image deletions (local DB + Cloudinary)
      if (localPropertyId && removedExistingPublicIds.length > 0) {
        try {
          const delRes = await fetch('/api/properties/upload-images', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ propertyId: localPropertyId, imagePublicIds: removedExistingPublicIds })
          });
          if (!delRes.ok) {
            const delErr = await delRes.json();
            console.warn('Failed to delete some images:', delErr);
          }
        } catch (imgDelErr) {
          console.warn('Image deletion error:', imgDelErr);
        }
      }

      // Then, handle new image uploads
      if (localPropertyId && uploadedFiles.length > 0) {
        try {
          const formData = new FormData();
          formData.append('propertyId', localPropertyId);
          uploadedFiles.forEach(f => formData.append('images', f));
          const upRes = await fetch('/api/properties/upload-images', { method: 'POST', body: formData });
          if (!upRes.ok) {
            const upErr = await upRes.json();
            console.warn('Failed to upload some images:', upErr);
          }
        } catch (imgUpErr) {
          console.warn('Image upload error:', imgUpErr);
        }
      }

      const payload = {
        name: propertyName,
        address: {
          street1: propertyLocation,
          street2: "",
          city: city,
          state: state,
          postal_code: postalCode,
          country: country,
        },
        bathrooms: parseInt(totalBathroom) || 0,
        bathrooms_full: parseInt(totalBathroom) || 0,
        bathrooms_half: 0,
        bedrooms: parseInt(totalBedroom) || 0,
        max_guests: parseInt(capacity) || 0,
        property_type: propertyType,
        active: isActive,
        check_in: checkIn,
        check_out: checkOut,
        // Include rich text for local DB mapping
        editorValue: editorValue,
        details: editorValue,
        calendar_color: "FF0000",
        days_before_arrival_for_check: 5,
        days_before_arrival_for_custom: 1,
        min_hours_before_arrival: 2,
        min_nights: 1,
        pending_action: "cancel",
        pending_for: "payment",
        pending_hours_for_check: 1,
        pending_hours_for_credit_card: 1,
        pending_hours_for_custom: 1,
        quote_expiration_days: 7,
        require_confirmation_for_online_bookings: true,
        second_payment_rule: "schedule_never",
        security_deposit_rule: "take_if",
        security_deposit_type: "hold",
        send_payment_reminder: true,
        send_security_deposit_reminder: true,
        travel_insurance_rule: "disabled",
        user_id: 1,
      };

      console.log('Updating property with payload:', payload);

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update property');
      }

      setSuccess('Property updated successfully!');
      setIsModalOpen(true);

    } catch (err) {
      console.error('Error updating property:', err);
      setError(err instanceof Error ? err.message : 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewProperty = () => {
    router.push('/superadmin/properties/create');
    setIsModalOpen(false);
  };

  const handleBackToList = () => {
    router.push('/superadmin/properties');
    setIsModalOpen(false);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
      setFileUploaded(true);
      
      // Create URLs for preview
      const newUrls = files.map(file => URL.createObjectURL(file));
      setFileUrls(prev => [...prev, ...newUrls]);
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFileUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
    
    if (uploadedFiles.length <= 1) {
      setFileUploaded(false);
    }
  };

  // Remove existing image
  const removeExistingImage = (index: number) => {
    setExistingImages(prev => {
      const img = prev[index];
      if (img?.publicId) {
        setRemovedExistingPublicIds(ids => Array.from(new Set([...ids, img.publicId as string])));
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property data...</p>
        </div>
      </div>
    );
  }

  if (error && !propertyName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/admin/properties')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
            <p className="text-gray-600 mt-1">Update property information and settings</p>
            {propertyId && (
              <p className="text-sm text-gray-500 mt-1">Property ID: {propertyId}</p>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="w-full md:w-auto">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full md:w-auto flex justify-center items-center gap-2 py-3 px-6 bg-[#40C557] hover:bg-[#40C557]/80 disabled:bg-gray-400 text-white font-semibold rounded-full shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  Update Property
                  <img src="/images/icons/done.png" alt="check" className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
              
              {/* Property Name */}
              <div className="mb-6">
                <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Name *
                </label>
                <input
                  type="text"
                  id="propertyName"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="Enter property name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              {/* Property Location */}
              <div className="mb-6">
                <label htmlFor="propertyLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="propertyLocation"
                  value={propertyLocation}
                  onChange={(e) => setPropertyLocation(e.target.value)}
                  placeholder="Enter street address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              {/* City, State, Postal Code, Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postal Code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Bathroom and Bedroom Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="totalBathroom" className="block text-sm font-medium text-gray-700 mb-2">
                    Total Bathrooms
                  </label>
                  <select
                    id="totalBathroom"
                    value={totalBathroom}
                    onChange={(e) => setTotalBathroom(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Select Bathrooms</option>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="totalBedroom" className="block text-sm font-medium text-gray-700 mb-2">
                    Total Bedrooms
                  </label>
                  <select
                    id="totalBedroom"
                    value={totalBedroom}
                    onChange={(e) => setTotalBedroom(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Select Bedrooms</option>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property Type and Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    id="propertyType"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Select Property Type</option>
                    <option value="villa">Villa</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Guests
                  </label>
                  <select
                    id="capacity"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Select Capacity</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Check-in/Check-out Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    id="checkIn"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    id="checkOut"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Property is active and available for bookings</span>
                </label>
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-white shadow rounded-lg p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Property Images</h3>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Current Images:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {existingImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.url}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className="mb-6">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-12 h-12 mb-4 bg-[#1C88FF0F] rounded-full p-2 text-[#1C88FF]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Upload New Images</span> 
                      </p>
                    </div>
                    <input 
                      id="dropzone-file" 
                      type="file" 
                      multiple
                      accept="image/*"
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
              
              {/* New Photo Preview */}
              {fileUrls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">New Images to Upload:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {fileUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`New image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white shadow rounded-lg p-6 sm:p-8 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Property Description</h3>
            <RichTextEditor onChange={setEditorValue} />
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPrimaryButtonClick={handleCreateNewProperty}
        onSecondaryButtonClick={handleBackToList}
        title="Property Updated Successfully!"
        description="Your property has been updated successfully. You can create a new property or return to the property list."
        primaryButtonText="Create New Property"
        secondaryButtonText="Back to Property List"
      />
    </div>
  );
}