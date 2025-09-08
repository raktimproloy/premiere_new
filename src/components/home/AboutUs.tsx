// components/AboutSection.tsx
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';


const AboutSection = () => {
    const AboutImage = "/images/about_section.jpg"
  return (
    <section className="py-20 bg-[#F9F9F9] ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-md aspect-square">
              <Image
                src={AboutImage}
                alt="Luxury Property"
                layout="fill"
                objectFit="cover"
                className="z-0"
              />
            </div>
          </div>
          
          {/* Right Column - Content */}
          <div className="lg:pl-12">
            <div className="mb-8">
              <span className="inline-block text-[#A020F0] font-bold tracking-wider mb-3">
                ABOUT US
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                We offerUnique Places
                <br />
                Suitable for your Comfort
              </h2>
            </div>
            
            <div className="space-y-6">
              <p className="text-lg text-gray-600 leading-relaxed">
              At Premierestays Miami, our mission is to deliver exceptional property management services that exceed guest expectations through Careful attention to detail and unwavering commitment to quality. We strive to maintain the highest standards in the industry, ensuring every property we manage is not only maintained but elevated, creating seamless and memorable guest experiences that reflect our dedication to excellence.
              </p>
              <div className="mt-10">
                <Link 
                  href="/about" 
                  className="inline-block px-8 py-4 bg-[#F7B730] text-black font-bold rounded-full shadow-md transition-all duration-300 transform hover:-translate-y-1 items-center gap-2"
                >
                    <span className="flex items-center gap-2">
                    Learn More
                    <FaArrowRight />
                    </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;