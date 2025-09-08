'use client'
import React from 'react';
import { useNotificationHelpers } from './NotificationContext';

const NotificationDemo: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotificationHelpers();

  const handleShowSuccess = () => {
    showSuccess(
      'Success!',
      'Your action was completed successfully.',
      {
        label: 'View Details',
        onClick: () => console.log('View details clicked')
      }
    );
  };

  const handleShowError = () => {
    showError(
      'Error!',
      'Something went wrong. Please try again.',
      {
        label: 'Retry',
        onClick: () => console.log('Retry clicked')
      }
    );
  };

  const handleShowWarning = () => {
    showWarning(
      'Warning!',
      'Please check your input before proceeding.',
      {
        label: 'Review',
        onClick: () => console.log('Review clicked')
      }
    );
  };

  const handleShowInfo = () => {
    showInfo(
      'Information',
      'This is an informational message.',
      {
        label: 'Learn More',
        onClick: () => console.log('Learn more clicked')
      }
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Notification Demo</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleShowSuccess}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Show Success
        </button>
        <button
          onClick={handleShowError}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Show Error
        </button>
        <button
          onClick={handleShowWarning}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
        >
          Show Warning
        </button>
        <button
          onClick={handleShowInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Show Info
        </button>
      </div>
    </div>
  );
};

export default NotificationDemo;
