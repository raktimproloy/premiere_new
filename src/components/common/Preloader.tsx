'use client';

import { useEffect, useState } from 'react';

interface PreloaderProps {
  minDisplayTime?: number;
  showProgress?: boolean;
  customText?: string;
  customSubtext?: string;
}

const Preloader = ({ 
  minDisplayTime = 1000, 
  showProgress = true, 
  customText = "Loading...",
  customSubtext = "Please wait"
}: PreloaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress
    if (showProgress) {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 100);

      return () => clearInterval(progressInterval);
    }

    // Hide preloader after minimum time
    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setIsLoading(false), 300);
    }, minDisplayTime);

    // Also hide when page is fully loaded
    const handleLoad = () => {
      setProgress(100);
      setTimeout(() => setIsLoading(false), 300);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', handleLoad);
    };
  }, [minDisplayTime, showProgress]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="relative text-center">
        {/* Main loading spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          
          {/* Center logo/brand placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full animate-pulse shadow-lg"></div>
          </div>
        </div>
        
        {/* Progress bar */}
        {showProgress && (
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-gray-700 text-xl font-semibold mb-2">{customText}</p>
          <p className="text-gray-500 text-sm">{customSubtext}</p>
          
          {/* Progress percentage */}
          {showProgress && (
            <p className="text-blue-600 text-lg font-medium mt-3">
              {Math.round(progress)}%
            </p>
          )}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-200 rounded-full animate-ping opacity-75"></div>
        <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-blue-300 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};

export default Preloader;
