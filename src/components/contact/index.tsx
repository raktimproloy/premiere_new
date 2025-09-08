'use client'
import Image from 'next/image';
import React, { useState } from 'react'
import { FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Index() {
    const contactImage = '/images/contact.jpg';
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      property: '',
      message: ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
          // Show success toast
          toast.success(result.message, {
            duration: 5000,
            position: 'top-right',
            style: {
              background: '#10B981',
              color: '#fff',
              borderRadius: '8px',
              padding: '16px',
            },
          });
          
          // Reset form
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            property: '',
            message: ''
          });
        } else {
          // Show error toast
          toast.error(result.message || 'Failed to send message. Please try again.', {
            duration: 5000,
            position: 'top-right',
            style: {
              background: '#EF4444',
              color: '#fff',
              borderRadius: '8px',
              padding: '16px',
            },
          });
        }
      } catch (error) {
        console.error('Contact form submission error:', error);
        toast.error('Network error. Please check your connection and try again.', {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '8px',
            padding: '16px',
          },
        });
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 mb-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4md text-[#586DF7] mb-4">Contact Us</h1>
          <p className="text-4xl font-bold text-gray-600 mb-6">Get in Touch With Us</p>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-600">
              Have questions, need support, or want to know more about our property listings? Our
              team is here to help you every step of the way. Fill out the form below or reach us
              directly—we'd love to hear from you!
            </p>
          </div>
        </div>

        <div className="">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left side - Image */}
            <div className="lg:w-1/2">
              <div className="h-full flex items-center justify-center">
                <div className="text-white text-center w-full h-full">
                  <Image src={contactImage} alt="contact" width={1500} height={1500} className='w-full h-full object-cover rounded-lg min-h-[600px]' />
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="lg:w-1/2 px-4 py-6 bg-white rounded-xl shadow-md min-h-[600px] flex flex-col justify-center">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-1">
                    Property (Optional)
                  </label>
                  <input
                    type="text"
                    id="property"
                    name="property"
                    value={formData.property}
                    onChange={handleChange}
                    placeholder="Property name or ID (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Write your message..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-[#586DF7] text-white font-semibold py-3 px-10 rounded-full shadow-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 px-10 ${
                    isSubmitting 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Submit Message
                      <FaArrowRight/>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
