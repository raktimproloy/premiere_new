'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Trash2 } from 'lucide-react';
import { useNotifications } from './NotificationContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationDropdownProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications = [],
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
  onClearAll,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use notification context if no props are provided
  const contextNotifications = useNotifications();
  const hasContext = !onMarkAsRead && !onDelete && !onMarkAllAsRead && !onClearAll;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sample notifications (you can replace with real data)
  const sampleNotifications: Notification[] = [
    {
      id: '1',
      title: 'New Booking Request',
      message: 'You have a new booking request for Property #123 from John Doe',
      type: 'success',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      action: {
        label: 'View Details',
        onClick: () => console.log('View booking details')
      }
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Payment of $1,200 has been received for booking #456',
      type: 'success',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      action: {
        label: 'View Receipt',
        onClick: () => console.log('View receipt')
      }
    },
    {
      id: '3',
      title: 'Maintenance Alert',
      message: 'Scheduled maintenance for Property #789 tomorrow at 10:00 AM',
      type: 'warning',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true
    },
    {
      id: '4',
      title: 'System Update',
      message: 'Your account has been updated with new features and improvements',
      type: 'info',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true
    },
    {
      id: '5',
      title: 'Guest Review',
      message: 'New 5-star review received for Property #456 from Sarah Wilson',
      type: 'success',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      read: false,
      action: {
        label: 'Read Review',
        onClick: () => console.log('Read review')
      }
    },
    {
      id: '6',
      title: 'Property Inquiry',
      message: 'New inquiry received for Property #789 from Mike Johnson',
      type: 'info',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      read: false,
      action: {
        label: 'Respond',
        onClick: () => console.log('Respond to inquiry')
      }
    },
    {
      id: '7',
      title: 'Booking Cancelled',
      message: 'Booking #123 has been cancelled by the guest',
      type: 'error',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true
    },
    {
      id: '8',
      title: 'Monthly Report',
      message: 'Your monthly property management report is ready for review',
      type: 'info',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      action: {
        label: 'View Report',
        onClick: () => console.log('View monthly report')
      }
    }
  ];

  // Always use sample notifications for now since context might be empty
  const displayNotifications = sampleNotifications;
  const unreadCount = displayNotifications.filter((n: Notification) => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'warning':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  // For sample notifications, we'll just log the actions
  const handleMarkAsRead = (id: string) => {
    console.log('Mark as read:', id);
    // In a real implementation, you would update the notification state
  };

  const handleDelete = (id: string) => {
    console.log('Delete notification:', id);
    // In a real implementation, you would remove the notification
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read');
    // In a real implementation, you would mark all notifications as read
  };

  const handleClearAll = () => {
    console.log('Clear all notifications');
    // In a real implementation, you would clear all notifications
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all read
                </button>
              )}
              {displayNotifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {displayNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                                 {displayNotifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors duration-200 border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <div className="flex items-center gap-1">
                              {/* {notification.action && (
                                <button
                                  onClick={notification.action.onClick}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  {notification.action.label}
                                </button>
                              )} */}
                              {/* {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  title="Mark as read"
                                >
                                  <Check size={12} />
                                </button>
                              )} */}
                              {/* <button
                                onClick={() => handleDelete(notification.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete notification"
                              >
                                <Trash2 size={12} />
                              </button> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
