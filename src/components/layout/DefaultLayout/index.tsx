import React from 'react';
import Navbar from './Navbar';
import FooterSection from './Footer';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="">
        {children}
      </main>
      <FooterSection />
    </div>
  );
};

export default DefaultLayout;
