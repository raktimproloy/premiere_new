// src/app/create-property/page.tsx
"use client";

import { useState } from 'react';
import CreateModal from './createModal';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('@/components/common/Editor'), { ssr: false });
import { useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePropertyPage() {
  const router = useRouter();
  // State for form fields
  const [propertyName, setPropertyName] = useState('');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [totalBathroom, setTotalBathroom] = useState('');
  const [totalBedroom, setTotalBedroom] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [details, setDetails] = useState(''); // was fullName
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [editorValue, setEditorValue] = useState('');


  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateNewProperty = () => {
    // Navigate to create property page in a real app
    // router.push('/create-property');
    setIsModalOpen(false);
  };

  const handleBackToList = () => {
    // Navigate to property list page in a real app
    router.push('/admin/properties');
    setIsModalOpen(false);
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const propertyData = {
      name: propertyName,
      propertyLocation: propertyLocation,
      totalBathroom: totalBathroom,
      totalBedroom: totalBedroom,
      propertyType: propertyType,
      capacity: capacity,
      details: details,
      editorValue: editorValue,
    };

    try {
      // Create FormData to send both property data and images
      const formData = new FormData();
      formData.append('propertyData', JSON.stringify(propertyData));
      
      console.log('FormData created:', {
        propertyData: propertyData,
        uploadedFilesCount: uploadedFiles.length,
        uploadedFiles: uploadedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });
      
      // Append all uploaded images
      uploadedFiles.forEach((file, index) => {
        formData.append('images', file);
        console.log(`Appended image ${index}:`, file.name, file.size, file.type);
      });

      console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => [key, typeof value === 'string' ? value : `${value.name} (${value.size} bytes)`]));

      const res = await fetch('/api/properties/create', {
        method: 'POST',
        body: formData, // Don't set Content-Type header for FormData
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create property');
        setLoading(false);
        return;
      }
      
      // Reset all form fields after successful creation
      setPropertyName("");
      setPropertyLocation("");
      setTotalBathroom("");
      setTotalBedroom("");
      setPropertyType("");
      setCapacity("");
      setDetails("");
      setUploadedFiles([]);
      setFileUrls([]);
      setEditorValue("");
      setIsModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Property</h1>
          {/* Submit Button */}
          <div className="w-full md:w-1/6 text-right">
            <button
              onClick={handleSubmit}
              className="w-full flex justify-center items-center gap-2 py-3 px-6 bg-[#40C557] hover:bg-[#40C557]/80 text-white font-semibold rounded-full shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Property"}
              <img src="/images/icons/done.png" alt="arrow-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
        {error && (
          <div className="mb-4 text-red-600 font-semibold">{error}</div>
        )}
        <form>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <div className="bg-white shadow rounded-lg p-6 sm:p-8">
              {/* Property Name */}
              <div className="mb-6">
                <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Name
                </label>
                <input
                  type="text"
                  id="propertyName"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="Type Property Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              {/* Property Location */}
              <div className="mb-6">
                <label htmlFor="propertyLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Location
                </label>
                <input
                  type="text"
                  id="propertyLocation"
                  value={propertyLocation}
                  onChange={(e) => setPropertyLocation(e.target.value)}
                  placeholder="Type your Property Location"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              {/* Bathroom and Bedroom Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="totalBathroom" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Total Bathroom
                  </label>
                  <select
                    id="totalBathroom"
                    value={totalBathroom}
                    onChange={(e) => setTotalBathroom(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  >
                    <option value="">Select Bathroom</option>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="totalBedroom" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Total Bedroom
                  </label>
                  <select
                    id="totalBedroom"
                    value={totalBedroom}
                    onChange={(e) => setTotalBedroom(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  >
                    <option value="">Select Bedroom</option>
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
                    required
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
                    Select Capacity
                  </label>
                  <select
                    id="capacity"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  >
                    <option value="">Select Capacity</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
            <div className="bg-white shadow rounded-lg p-6 sm:p-8">
            {/* Upload Room Photo */}
            <div className="mb-6">
              {/* File Upload */}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-12 h-12 mb-4 bg-[#1C88FF0F] rounded-full p-2 text-[#1C88FF]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Upload Room Photo</span> 
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
              
              {/* Photo Preview */}
              {fileUrls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Photos:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {fileUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Uploaded photo ${index + 1}`}
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
          </div>


          {/* Full Name (now Details) */}
          {/* <div className="bg-white shadow rounded-lg p-6 sm:p-8">
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
              Enter property details
            </label>
            <input
              type="text"
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Type property details"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div> */}
          <RichTextEditor onChange={setEditorValue} />

          
        </form>
      </div>
      <CreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPrimaryButtonClick={handleCreateNewProperty}
          onSecondaryButtonClick={handleBackToList}
        />
    </div>
  );
}