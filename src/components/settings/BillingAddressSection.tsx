import React, { useState, useRef, useEffect } from 'react';
import { FaEdit, FaMapMarkerAlt, FaTimes, FaSpinner, FaSave } from 'react-icons/fa';

interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface BillingAddressSectionProps {
  billingAddress: BillingAddress;
  onUpdate: (billingAddress: BillingAddress) => Promise<{ success: boolean; message: string }>;
}

export default function BillingAddressSection({ billingAddress, onUpdate }: BillingAddressSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<BillingAddress>(billingAddress);
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
    
    // Validate required fields
    if (!form.street.trim() || !form.city.trim() || !form.state.trim() || !form.zipCode.trim() || !form.country.trim()) {
      setError('All fields are required');
      return;
    }

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
      setError('Failed to update billing address');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

      {/* Billing Address Modal */}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Billing Address</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
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

      {/* Billing Address Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaMapMarkerAlt className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
              <p className="text-gray-600 text-sm">Manage your billing and shipping address</p>
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
            <span className="font-medium text-gray-700">Street:</span>
            <span className="text-gray-600 ml-2">{billingAddress.street || 'Not set'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">City:</span>
            <span className="text-gray-600 ml-2">{billingAddress.city || 'Not set'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">State:</span>
            <span className="text-gray-600 ml-2">{billingAddress.state || 'Not set'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">ZIP Code:</span>
            <span className="text-gray-600 ml-2">{billingAddress.zipCode || 'Not set'}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="font-medium text-gray-700">Country:</span>
            <span className="text-gray-600 ml-2">{billingAddress.country || 'Not set'}</span>
          </div>
        </div>
      </div>
    </>
  );
}
