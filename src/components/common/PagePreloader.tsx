'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PagePreloaderProps {
  children: React.ReactNode;
}

const PagePreloader = ({ children }: PagePreloaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const pathname = usePathname();

  useEffect(() => {
    // Show preloader on route change
    setIsLoading(true);
    setLoadingText('Loading page...');
    
    // Hide preloader after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return <>{children}</>;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          {/* Compact loading spinner */}
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="w-12 h-12 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            </div>
          </div>
          
          {/* Loading text */}
          <p className="text-gray-600 text-sm font-medium">{loadingText}</p>
        </div>
      </div>
      {children}
    </>
  );
};

export default PagePreloader;
