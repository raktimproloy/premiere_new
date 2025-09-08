import React, { useState, useRef, useEffect } from 'react';
import { FaEdit, FaShareAlt, FaTimes, FaSpinner, FaSave } from 'react-icons/fa';

interface SocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

interface SocialMediaSectionProps {
  socialMedia: SocialMedia;
  onUpdate: (socialMedia: SocialMedia) => Promise<{ success: boolean; message: string }>;
}

export default function SocialMediaSection({ socialMedia, onUpdate }: SocialMediaSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<SocialMedia>(socialMedia);
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
      setError('Failed to update social media profiles');
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

      {/* Social Media Modal */}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Social Media Profiles</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Profile</label>
                <input
                  type="url"
                  name="facebook"
                  value={form.facebook || ''}
                  onChange={handleChange}
                  placeholder="https://facebook.com/username"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter Profile</label>
                <input
                  type="url"
                  name="twitter"
                  value={form.twitter || ''}
                  onChange={handleChange}
                  placeholder="https://twitter.com/username"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Profile</label>
                <input
                  type="url"
                  name="instagram"
                  value={form.instagram || ''}
                  onChange={handleChange}
                  placeholder="https://instagram.com/username"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedin"
                  value={form.linkedin || ''}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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

      {/* Social Media Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FaShareAlt className="text-purple-600 text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Social Media Profiles</h3>
              <p className="text-gray-600 text-sm">Manage your social media profiles for verification</p>
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
            <span className="font-medium text-gray-700">Facebook:</span>
            <span className="text-gray-600 ml-2">{socialMedia.facebook || 'Not set'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Twitter:</span>
            <span className="text-gray-600 ml-2">{socialMedia.twitter || 'Not set'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Instagram:</span>
            <span className="text-gray-600 ml-2">{socialMedia.instagram || 'Not set'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">LinkedIn:</span>
            <span className="text-gray-600 ml-2">{socialMedia.linkedin || 'Not set'}</span>
          </div>
        </div>
      </div>
    </>
  );
}
