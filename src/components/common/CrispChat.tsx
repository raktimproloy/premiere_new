'use client';
import { useEffect } from 'react';
import { useAuth } from './AuthContext';

// Crisp types
declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || "549f16a7-988a-4df9-b3d8-b694fe274009";

const CrispChat = () => {
  const { user, isAuthenticated, role } = useAuth();
  
  useEffect(() => {
    // Only run on client side and for admin users
    if (typeof window === 'undefined' || !isAuthenticated || role !== 'admin') {
      // Hide Crisp if it exists
      if (window?.$crisp) {
        window.$crisp.push(['do', 'chat:hide']);
      }
      return;
    }

    // Load Crisp
    (function() {
      const script = document.createElement('script');
      script.src = 'https://client.crisp.chat/l.js';
      script.async = true;
      document.head.appendChild(script);

      window.$crisp = [];
      window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID || '';

      // Configure Crisp
      window.$crisp.push(['safe', true]); // Enable safe mode
      window.$crisp.push(['do', 'chat:show']); // Show chat on load
      
      // Set user information if available
      if (user) {
        window.$crisp.push(['set', 'user:email', user.email]); // Set user email
        window.$crisp.push(['set', 'user:nickname', user.fullName]); // Set user name
        if (user.phone) {
          window.$crisp.push(['set', 'user:phone', user.phone]); // Set user phone if available
        }
      }

      window.$crisp.push(['on', 'session:loaded', () => {
        console.log('Crisp chat loaded');
        
        // Configure chat position and styling
        window.$crisp.push(['config', 'position:reverse', true]); // Align to the right
        window.$crisp.push(['config', 'container:fluid', false]); // Fixed width container
        window.$crisp.push(['config', 'container:toggle', false]); // Disable container toggle
        window.$crisp.push(['config', 'container:position', 'bottom-right']); // Position in bottom right
        
        // Set custom colors to match your theme
        window.$crisp.push(['config', 'color:theme', '#EBA83A']); // Primary color

        // Hide user info form since we're providing it
        window.$crisp.push(['do', 'user:show']);
      }]);
    })();

    // Add custom styles for Crisp
    const style = document.createElement('style');
    style.innerHTML = `
      .crisp-client {
        z-index: 1000 !important;
      }
      .crisp-client .crisp-1rjpbb7 {
        bottom: 50px !important;
        right: 50px !important;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        // Remove the script and styles
        const script = document.querySelector('script[src="https://client.crisp.chat/l.js"]');
        if (script) {
          script.remove();
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }

        // Reset Crisp
        if (window.$crisp) {
          window.$crisp = [];
        }
      }
    };
  }, [isAuthenticated, role, user]); // Re-run when auth state changes

  return null;
};

export default CrispChat;
