import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { FiArrowRight } from 'react-icons/fi'

export default function CardOne({service}: {service: any}) {
  console.log(service)
  return (
    <div 
    key={service.id}
    className="bg-[#272266] rounded-xl shadow-lg p-8 relative overflow-hidden transition-all duration-300 hover:shadow-xl"
  >
    {/* Quarter red and green circles at top-right */}
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#11DBFA0A] rounded-full z-20"></div>
    <div className="absolute -top-35 -right-35 w-70 h-70 bg-[#11DBFA0F] rounded-full z-10"></div>

    {/* Service image and content */}
    <div className={`w-20 h-20 object-cover bg-[${service.imageBg}] p-2 rounded-full flex items-center justify-center mb-4`}>
      <Image src={service.image} alt={service.title} width={100} height={100} className="w-10 h-10 object-cover" />
    </div>
    <h3 className="text-xl font-bold text-white mb-4 pr-8">{service.title}</h3>
    <p className="text-gray-200 mb-6">{service.description}</p>
    {
        service.link && (
            <div className="flex justify-between items-center">
                <Link 
                    href={service.link} 
                    className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
                >
                    Learn More <span><FiArrowRight className="w-4 h-4 ml-2" /></span>
                </Link>
            </div>
        )
    }
    {/* <div className="flex justify-between items-center">
      <Link 
        href="/" 
        className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
      >
        Learn More <span><FiArrowRight className="w-4 h-4 ml-2" /></span>
      </Link>
    </div> */}
  </div>
  )
}
