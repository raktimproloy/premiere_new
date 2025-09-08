import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uc.orez.io',
        port: '',
        pathname: '/**',
      },      
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    // Add aliases to resolve FullCalendar modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@fullcalendar/core': path.resolve(__dirname, 'node_modules/@fullcalendar/core'),
      '@fullcalendar/daygrid': path.resolve(__dirname, 'node_modules/@fullcalendar/daygrid'),
      '@fullcalendar/timegrid': path.resolve(__dirname, 'node_modules/@fullcalendar/timegrid'),
      '@fullcalendar/list': path.resolve(__dirname, 'node_modules/@fullcalendar/list'),
      '@fullcalendar/interaction': path.resolve(__dirname, 'node_modules/@fullcalendar/interaction'),
      '@fullcalendar/react': path.resolve(__dirname, 'node_modules/@fullcalendar/react'),
    };
    
    return config;
  },
};

export default nextConfig;