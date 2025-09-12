import React from 'react'

export default function MapSection({ property }: { property: any }) {
  const latitude = property?.latitude;
  const longitude = property?.longitude;
  
  // Create the Google Maps embed URL with dynamic coordinates
  const mapUrl = `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${latitude},${longitude}&zoom=15&maptype=roadmap`;
  
  // Fallback to a simple iframe with coordinates if no API key
  const fallbackMapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  
  return (
    <div className='max-w-7xl mx-auto rounded-lg overflow-hidden p-4 bg-white shadow-md'>
      {latitude && longitude ? (
        <iframe
          title="Google Map"
          src={fallbackMapUrl}
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      ) : (
        <div className="flex items-center justify-center h-96 bg-gray-100">
          <p className="text-gray-500">Location not available</p>
        </div>
      )}
    </div>
  )
}
