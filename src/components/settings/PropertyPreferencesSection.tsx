import React, { useState, useRef, useEffect } from 'react';
import { FaEdit, FaHome, FaTimes, FaSpinner, FaSave, FaMapMarkerAlt, FaStar } from 'react-icons/fa';

interface PropertyPreferences {
  preferredLocation: string;
  maxPrice: number;
  propertyType: string;
  minBedrooms: number;
}

interface PropertyPreferencesSectionProps {
  propertyPreferences: PropertyPreferences;
  onUpdate: (propertyPreferences: PropertyPreferences) => Promise<{ success: boolean; message: string }>;
}

export default function PropertyPreferencesSection({ propertyPreferences, onUpdate }: PropertyPreferencesSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PropertyPreferences>(propertyPreferences);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    if (showModal) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showModal]);

  // Close modal on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    }
    if (showModal) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      const result = await onUpdate(form);

      if (result.success) {
        setSuccess(result.message);
        setShowModal(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to update property preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  return (
    <>
      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
          {error}
        </div>
      )}

      {/* Property Preferences Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-lg mx-auto relative animate-fadeIn">
            <button
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-gray-700 text-lg"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Property Preferences</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Preferred Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Location</label>
                <input
                  type="text"
                  name="preferredLocation"
                  value={form.preferredLocation}
                  onChange={handleChange}
                  placeholder="e.g., Downtown, Beach Area, City Center"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select property type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="condo">Condo</option>
                  <option value="studio">Studio</option>
                </select>
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Price (per night)</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={form.maxPrice}
                  onChange={handleChange}
                  min="0"
                  step="10"
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Min Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Bedrooms</label>
                <select
                  name="minBedrooms"
                  value={form.minBedrooms}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5+</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property Preferences Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaHome className="text-green-600 text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Property Preferences</h3>
              <p className="text-gray-600 text-sm">Manage your property search preferences</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            <FaEdit />
            Edit
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Preferred Location:</span>
            <span className="text-gray-600 ml-2">{propertyPreferences.preferredLocation || 'Not set'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Property Type:</span>
            <span className="text-gray-600 ml-2">{propertyPreferences.propertyType || 'Not set'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Max Price:</span>
            <span className="text-gray-600 ml-2">
              {propertyPreferences.maxPrice ? `$${propertyPreferences.maxPrice}/night` : 'Not set'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Min Bedrooms:</span>
            <span className="text-gray-600 ml-2">{propertyPreferences.minBedrooms || 'Not set'}</span>
          </div>
        </div>
      </div>
    </>
  );
}
