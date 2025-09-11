'use client'
import { useAuth } from './AuthContext';
import { useEffect, useState } from 'react';

const AuthDebugger = () => {
  const { isAuthenticated, user, role, loading, error } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Auth Debug</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-300"
        >
          ×
        </button>
      </div>
      <div className="space-y-1">
        <div>Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated ? 'Yes' : 'No'}</span></div>
        <div>Role: <span className="text-blue-400">{role || 'None'}</span></div>
        <div>Loading: <span className={loading ? 'text-yellow-400' : 'text-gray-400'}>{loading ? 'Yes' : 'No'}</span></div>
        <div>User ID: <span className="text-gray-300">{user?._id || 'None'}</span></div>
        <div>User Name: <span className="text-gray-300">{user?.fullName || 'None'}</span></div>
        {error && <div>Error: <span className="text-red-400">{error}</span></div>}
      </div>
    </div>
  );
};

export default AuthDebugger;
