'use client'
import React, { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaReply, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ContactMessage {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  property: string;
  message: string;
  status: 'unread' | 'read' | 'responded';
  createdAt: string;
  ipAddress: string;
  userAgent: string;
}
export default function Index() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [showModal, setShowModal] = useState(false);
  
    useEffect(() => {
      fetchMessages();
    }, []);
  
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/contact/admin');
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
        } else {
          toast.error('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };
  
    const updateMessageStatus = async (messageId: string, status: string) => {
      try {
        const response = await fetch(`/api/contact/admin/${messageId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });
  
        if (response.ok) {
          toast.success('Message status updated');
          fetchMessages(); // Refresh the list
        } else {
          toast.error('Failed to update message status');
        }
      } catch (error) {
        console.error('Error updating message status:', error);
        toast.error('Failed to update message status');
      }
    };
  
    const deleteMessage = async (messageId: string) => {
      if (!confirm('Are you sure you want to delete this message?')) return;
  
      try {
        const response = await fetch(`/api/contact/admin/${messageId}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          toast.success('Message deleted');
          fetchMessages(); // Refresh the list
        } else {
          toast.error('Failed to delete message');
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Failed to delete message');
      }
    };
  
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };
  
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'unread':
          return 'bg-red-100 text-red-800';
        case 'read':
          return 'bg-yellow-100 text-yellow-800';
        case 'responded':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
  
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-gray-600 mt-2">
          Manage and respond to customer inquiries and messages
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              All Messages ({messages.length})
            </h2>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {messages.filter(m => m.status === 'unread').length} Unread
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {messages.filter(m => m.status === 'read').length} Read
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {messages.filter(m => m.status === 'responded').length} Responded
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.map((message) => (
                <tr key={message._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {message.firstName} {message.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{message.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {message.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {message.property || 'General Inquiry'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(message.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {message.status === 'unread' && (
                        <button
                          onClick={() => updateMessageStatus(message._id, 'read')}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Mark as Read"
                        >
                          <FaCheck />
                        </button>
                      )}
                      {message.status !== 'responded' && (
                        <button
                          onClick={() => updateMessageStatus(message._id, 'responded')}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Responded"
                        >
                          <FaReply />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMessage(message._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No contact messages found</div>
            <div className="text-gray-400 text-sm mt-2">
              When customers submit contact forms, their messages will appear here.
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Message Detail Modal */}
    {showModal && selectedMessage && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Message Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">From</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedMessage.firstName} {selectedMessage.lastName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedMessage.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Property</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedMessage.property || 'General Inquiry'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Submitted</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(selectedMessage.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <p className="mt-1 text-sm text-gray-900">{selectedMessage.ipAddress}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: Your inquiry about ${selectedMessage.property || 'our services'}`}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  )
}
