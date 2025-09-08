'use client'
// components/FooterSection.tsx
import React from 'react';
import { useMainSettings } from '@/hooks/useMainSettings';
import { BlueCallIcon } from '../../../../public/images/svg';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';


const FooterSection = () => {

  const pathname = usePathname();
  const router = useRouter();
  console.log(pathname)
  const { settings, loading } = useMainSettings();
      const CTAImage = "/images/cta_image.png"
    const Logo = "/images/logo.png"
  // Fallback values if settings are not loaded yet
  const phone = settings.phone || '(123) 757-2069';
  const email = settings.email || 'info@premierestayamiami.com';
  const address = settings.address || '#1 Dealing Street, St. Thomas Village, Chagastons, Trinidad & Tobago';
  const facebook = settings.facebook || 'https://facebook.com';
  const x = settings.x || 'https://x.com';
  const instagram = settings.instagram || 'https://instagram.com';
  const youtube = settings.youtube || 'https://youtube.com';


  return (
    // <div className="bg-[#1A1A1A] text-white">
    //   <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
    //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 ">
    //       {/* Company Info */}
    //       <div className="sm:col-span-2 lg:col-span-1">
    //         <div className="flex items-center mb-4 sm:mb-6">
    //           <img 
    //             src="/images/logo.png" 
    //             alt="PremierestaysMiami Logo" 
    //             className="h-8 sm:h-10 w-auto"
    //           />
    //         </div>
    //         <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 leading-relaxed">
    //           PremierestaysMiami offers exceptional property management services, 
    //           ensuring your properties are maintained to the highest standards 
    //           while maximizing your returns.
    //         </p>
    //         <div className="flex gap-3 sm:gap-4">
    //           {settings.facebook && (
    //             <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors">
    //               <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z"/></svg>
    //             </a>
    //           )}
    //           {settings.x && (
    //             <a href={settings.x} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors">
    //               <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path d="M17.53 6.47a.75.75 0 0 0-1.06 0L12 10.94 7.53 6.47a.75.75 0 1 0-1.06 1.06L10.94 12l-4.47 4.47a.75.75 0 1 0 1.06 1.06L12 13.06l4.47 4.47a.75.75 0 0 0 1.06-1.06L13.06 12l4.47-4.47a.75.75 0 0 0 0-1.06z"/></svg>
    //             </a>
    //           )}
    //           {settings.instagram && (
    //             <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors">
    //               <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="white"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
    //             </a>
    //           )}
    //           {settings.youtube && (
    //             <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors">
    //               <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="white"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M10 15l5.19-3L10 9v6z"/></svg>
    //             </a>
    //           )}
    //         </div>
    //       </div>

    //       {/* Quick Links */}
    //       <div className="sm:col-span-2 lg:col-span-1 border-l-0 sm:border-l lg:border-l border-gray-600 pl-0 sm:pl-4 lg:pl-8">
    //         <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wider">Quick Links</h3>
    //         <ul className="space-y-1 sm:space-y-2">
    //           {[
    //             { name: 'Home', path: '/' },
    //             { name: 'About Us', path: '/about' },
    //             { name: 'Services', path: '/services' },
    //             { name: 'Properties', path: '/properties' },
    //             { name: 'Contact', path: '/contact' },
    //             { name: 'FAQs', path: '/faqs' }
    //           ].map((item) => (
    //             <li key={item.name}>
    //               <a href={item.path} className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">{item.name}</a>
    //             </li>
    //           ))}
    //         </ul>
    //       </div>

    //       {/* For Sale and Rent */}
    //       <div className="sm:col-span-2 lg:col-span-2 border-l-0 sm:border-l lg:border-l border-gray-600 pl-0 sm:pl-4 lg:pl-8">
    //         <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wider">For Sale and Rent</h3>
    //         <ul className="space-y-1 sm:space-y-2">
    //           {[
    //             { name: 'Owner Services', path: '/services' },
    //             { name: 'Manage Your Rental', path: '/profile' },
    //             { name: 'Grow Your Portfolio', path: '/profile' },
    //             { name: 'Owner Login', path: '/login' },
    //             { name: 'Privacy Policy', path: '/privacy' },
    //             { name: 'Terms and Conditions', path: '/terms' }
    //           ].map((item) => (
    //             <li key={item.name}>
    //               <a href={item.path} className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">{item.name}</a>
    //             </li>
    //           ))}
    //         </ul>
    //       </div>

    //       {/* Contact Information */}
    //       <div className="sm:col-span-2 lg:col-span-2 border-l-0 sm:border-l lg:border-l border-gray-600 pl-0 sm:pl-4 lg:pl-8">
    //         <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wider">Contact Information</h3>
    //         <ul className="space-y-2 sm:space-y-3">
    //           <li className="flex items-start">
    //             <span className='mr-2 bg-[#35A7A124] rounded-full p-2 sm:p-3'>
    //               <BlueCallIcon/>
    //             </span>
    //             <span className="text-sm sm:text-base text-gray-400">Phone: <br/> 
    //               <a 
    //                 href={`tel:${phone}`}
    //                 className="text-white hover:text-[#F7B730] transition-colors cursor-pointer"
    //               >
    //                 {phone}
    //               </a>
    //             </span>
    //           </li>
    //           <li className="flex items-start">
    //             <span className='mr-2 bg-[#35A7A124] rounded-full p-2 sm:p-3'>
    //               <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    //               <path d="M18.2083 4.146H7.79158C4.66659 4.146 2.58325 5.7085 2.58325 9.35433V16.646C2.58325 20.2918 4.66659 21.8543 7.79158 21.8543H18.2083C21.3333 21.8543 23.4166 21.8543 23.4166 16.646V9.35433C23.4166 5.7085 21.3333 4.146 18.2083 4.146ZM18.6978 10.4897L15.4374 13.0939C14.7499 13.646 13.8749 13.9168 12.9999 13.9168C12.1249 13.9168 11.2395 13.646 10.5624 13.0939L7.302 10.4897C6.96867 10.2189 6.91658 9.71891 7.177 9.38558C7.44783 9.05225 7.93742 8.98975 8.27075 9.26058L11.5312 11.8647C12.3228 12.5002 13.6666 12.5002 14.4583 11.8647L17.7187 9.26058C18.052 8.98975 18.552 9.04183 18.8124 9.38558C19.0833 9.71891 19.0312 10.2189 18.6978 10.4897Z" fill="#38C6F9"/>
    //               </svg>
    //             </span>
    //             <span className="text-sm sm:text-base text-gray-400">Email: 
    //               <a 
    //                 href={`mailto:${email}`}
    //                 className="text-white hover:text-[#F7B730] transition-colors cursor-pointer"
    //               >
    //                 {email}
    //               </a>
    //             </span>
    //           </li>
    //           <li className="flex items-start">
    //             <span className='mr-2 bg-[#35A7A124] rounded-full p-2 sm:p-3'>
    //               <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    //               <g clipPath="url(#clip0_33596_7361)">
    //               <path d="M21.9791 9.30192C20.8854 4.48942 16.6875 2.32275 13 2.32275C13 2.32275 13 2.32275 12.9896 2.32275C9.31248 2.32275 5.10414 4.479 4.01039 9.2915C2.79164 14.6665 6.08331 19.2186 9.06248 22.0832C10.1666 23.1457 11.5833 23.6769 13 23.6769C14.4166 23.6769 15.8333 23.1457 16.9271 22.0832C19.9062 19.2186 23.1979 14.6769 21.9791 9.30192ZM13 14.5207C11.1875 14.5207 9.71873 13.0519 9.71873 11.2394C9.71873 9.42692 11.1875 7.95817 13 7.95817C14.8125 7.95817 16.2812 9.42692 16.2812 11.2394C16.2812 13.0519 14.8125 14.5207 13 14.5207Z" fill="#38C6F9"/>
    //               </g>
    //               <defs>
    //               <clipPath id="clip0_33596_7361">
    //               <rect width="25" height="25" fill="white" transform="translate(0.5 0.5)"/>
    //               </clipPath>
    //               </defs>
    //               </svg>
    //             </span>
    //             <span className="text-sm sm:text-base text-gray-400 wrap-normal">{address}</span>
    //           </li>
    //         </ul>
    //       </div>
    //     </div>

    //     {/* Copyright */}
    //     <div className="border-t border-gray-800 pt-6 sm:pt-8">
    //       <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0'>
    //         <p className="text-sm sm:text-base text-gray-400 text-center sm:text-left">
    //           ©2025. PremierestaysMiami. All Rights Reserved.
    //         </p>
    //         <div className="flex gap-3 sm:gap-4">
    //           {settings.facebook && (
    //             <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors">
    //               <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z"/></svg>
    //             </a>
    //           )}
    //           {settings.x && (
    //             <a href={settings.x} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors">
    //               <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path d="M17.53 6.47a.75.75 0 0 0-1.06 0L12 10.94 7.53 6.47a.75.75 0 1 0-1.06 1.06L10.94 12l-4.47 4.47a.75.75 0 1 0 1.06 1.06L12 13.06l4.47 4.47a.75.75 0 0 0 1.06-1.06L13.06 12l4.47-4.47a.75.75 0 0 0 0-1.06z"/></svg>
    //             </a>
    //           )}
    //           {settings.instagram && (
    //             <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors">
    //               <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="white"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
    //             </a>
    //           )}
    //           {settings.youtube && (
    //             <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors">
    //               <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="white"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M10 15l5.19-3L10 9v6z"/></svg>
    //             </a>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </footer>
    // </div>
<div className="relative pt-40">
      {/* Footer */}
      <footer className="bg-[#100A55] text-white pt-44 sm:pt-50 md:pt-64 pb-8 sm:pb-12 relative">

        {
          pathname !== "/book-now" ? 

        <div className="absolute top-0 left-0 right-0 z-10 max-w-7xl mx-auto px-4 pt-4 sm:px-6 lg:px-8 -mt-40 sm:-mt-36 md:-mt-32">
          <div className="bg-[#586DF7] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 items-center">
                <div className='col-span-1 lg:col-span-3 px-6 sm:px-8 lg:pl-16 pt-6 sm:pt-8 lg:pt-4 pb-8'>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                    Ready to Experience Comfort, Convenience, and Quality?
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-blue-100 max-w-xl mb-4 sm:mb-6">
                    Browse our available rentals and secure your stay with just a few clicks. Whether you're planning a weekend getaway or a longer stay, we've got the perfect space waiting for you.
                  </p>
                  <button onClick={() => router.push("/book-now")} className=" bg-[#F7B730] text-black hover:bg-[#F7B730]/80 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-base lg:text-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center">
                    Book A Property
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="hidden lg:flex col-span-1 lg:col-span-2 justify-end px-0">
                  <Image src={CTAImage} alt="Hero Section" width={500} height={500} className='w-full h-auto max-w-sm lg:max-w-none object-cover relative -right-3' />
                </div>
              </div>
            </div>
          </div>
        </div>
          : ""
        }


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1 flex justify-center sm:justify-start items-start">
              <Image src={Logo} alt="Logo" width={175} height={175} className="text-center w-32 sm:w-40 lg:w-auto" />
            </div>

            {/* Company Links */}
            <div className="sm:col-span-2 lg:col-span-2 border-l-0 sm:border-l lg:border-l border-gray-600 pl-0 sm:pl-4 lg:pl-8">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wider">Company</h3>
              <ul className="space-y-1 sm:space-y-2">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'About Us', path: '/about' },
                  // { name: 'Services', path: '/services' },
                  { name: 'FAQs', path: '/faqs' },
                  { name: 'Terms and Condition', path: '/terms-and-conditions' },
                  { name: 'Privacy Policy', path: '/privacy-policy' }
                  // { name: 'Contact Us', path: '/contact' }
                ].map((item) => (
                  <li key={item.name}>
                    <a href={item.path} className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">{item.name}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Sale and Rent */}
            <div className="sm:col-span-2 lg:col-span-2 border-l-0 sm:border-l lg:border-l border-gray-600 pl-0 sm:pl-4 lg:pl-8">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wider">For Sale and Rent</h3>
              <ul className="space-y-1 sm:space-y-2">
                {[
                  // { name: 'Owner Services', path: '/services' },
                  { name: 'Pricing', path: '/pricing' },
                  { name: 'Book Now', path: '/book-now' },
                  { name: 'Manage Your Rental', path: '/profile' },
                  { name: 'Manage Your Profile', path: '/profile' },
                  // { name: 'Grow Your Portfolio', path: '/profile' },
                  // { name: 'Owner Login', path: '/login' },

                ].map((item) => (
                  <li key={item.name}>
                    <a href={item.path} className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">{item.name}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div className="sm:col-span-2 lg:col-span-2 border-l-0 sm:border-l lg:border-l border-gray-600 pl-0 sm:pl-4 lg:pl-8">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-wider">Contact Information</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start">
                  <span className='mr-2 bg-[#35A7A124] rounded-full p-2 sm:p-3'>
                    <BlueCallIcon/>
                  </span>
                  <span className="text-sm sm:text-base text-gray-400">Phone: <br/> 
                    <a 
                      href="tel:(123) 757-2069" 
                      className="text-white hover:text-[#F7B730] transition-colors cursor-pointer"
                    >
                      {" "}{phone}
                    </a>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className='mr-2 bg-[#35A7A124] rounded-full p-2 sm:p-3'>
                    <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.2083 4.146H7.79158C4.66659 4.146 2.58325 5.7085 2.58325 9.35433V16.646C2.58325 20.2918 4.66659 21.8543 7.79158 21.8543H18.2083C21.3333 21.8543 23.4166 20.2918 23.4166 16.646V9.35433C23.4166 5.7085 21.3333 4.146 18.2083 4.146ZM18.6978 10.4897L15.4374 13.0939C14.7499 13.646 13.8749 13.9168 12.9999 13.9168C12.1249 13.9168 11.2395 13.646 10.5624 13.0939L7.302 10.4897C6.96867 10.2189 6.91658 9.71891 7.177 9.38558C7.44783 9.05225 7.93742 8.98975 8.27075 9.26058L11.5312 11.8647C12.3228 12.5002 13.6666 12.5002 14.4583 11.8647L17.7187 9.26058C18.052 8.98975 18.552 9.04183 18.8124 9.38558C19.0833 9.71891 19.0312 10.2189 18.6978 10.4897Z" fill="#38C6F9"/>
                    </svg>
                  </span>
                  <span className="text-sm sm:text-base text-gray-400">Email: 
                    <a 
                      href={`mailto:${email}`} 
                      className="text-white hover:text-[#F7B730] transition-colors cursor-pointer"
                    >
                       {" "}{email}
                    </a>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className='mr-2 bg-[#35A7A124] rounded-full p-2 sm:p-3'>
                    <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_33596_7361)">
                    <path d="M21.9791 9.30192C20.8854 4.48942 16.6875 2.32275 13 2.32275C13 2.32275 13 2.32275 12.9896 2.32275C9.31248 2.32275 5.10414 4.479 4.01039 9.2915C2.79164 14.6665 6.08331 19.2186 9.06248 22.0832C10.1666 23.1457 11.5833 23.6769 13 23.6769C14.4166 23.6769 15.8333 23.1457 16.9271 22.0832C19.9062 19.2186 23.1979 14.6769 21.9791 9.30192ZM13 14.5207C11.1875 14.5207 9.71873 13.0519 9.71873 11.2394C9.71873 9.42692 11.1875 7.95817 13 7.95817C14.8125 7.95817 16.2812 9.42692 16.2812 11.2394C16.2812 13.0519 14.8125 14.5207 13 14.5207Z" fill="#38C6F9"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_33596_7361">
                    <rect width="25" height="25" fill="white" transform="translate(0.5 0.5)"/>
                    </clipPath>
                    </defs>
                    </svg>
                  </span>
                  <span className="text-sm sm:text-base text-gray-400">{address}</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0'>
            <p className="text-sm sm:text-base text-gray-400 text-center sm:text-left">
              ©2025. PremierestaysMiami. All Rights Reserved.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors">
                <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z"/></svg>
              </a>
              <a href={x} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors">
                <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path d="M17.53 6.47a.75.75 0 0 0-1.06 0L12 10.94 7.53 6.47a.75.75 0 1 0-1.06 1.06L10.94 12l-4.47 4.47a.75.75 0 1 0 1.06 1.06L12 13.06l4.47 4.47a.75.75 0 0 0 1.06-1.06L13.06 12l4.47-4.47a.75.75 0 0 0 0-1.06z"/></svg>
              </a>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors">
                <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="white"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href={youtube} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors">
                <svg width="16" height="16" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="white"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M10 15l5.19-3L10 9v6z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FooterSection;