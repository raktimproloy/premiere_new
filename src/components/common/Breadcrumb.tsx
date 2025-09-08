import React from 'react';
import Image from 'next/image';

interface BreadcrumbProps {
  bgImage: string; // URL or import for background image
  path: string[]; // e.g. ['Home', 'Services Page']
  title: string;
  description: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ bgImage, path, title, description }) => {
  return (
    <section className="relative w-full h-[350px] flex items-center justify-center">
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full">
        <Image src={bgImage} alt="breadcrumb background" fill sizes="100vw" className="object-cover w-full h-full" />
      </div>
      {/* Fade overlay */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none" />
      {/* Content */}
      <div className="relative z-10 text-center w-full px-4">
        <div className="mb-2 text-sm text-gray-200 flex justify-center gap-1">
          {path.map((item, idx) => (
            <span key={item} className="inline-flex items-center">
              {item}
              {idx < path.length - 1 && <span className="mx-1">&gt;</span>}
            </span>
          ))}
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{title}</h1>
        <p className="text-white text-base md:text-lg max-w-2xl mx-auto opacity-90">{description}</p>
      </div>
    </section>
  );
};

export default Breadcrumb;