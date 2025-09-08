import React from 'react'

export default function MapSection() {
  return (
    <div className='max-w-7xl mx-auto rounded-lg overflow-hidden p-4 bg-white shadow-md'>
      <iframe
        title="Google Map"
        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3650.650876433352!2d90.4125183153632!3d23.7935129845677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v1680000000000!5m2!1sen!2sbd"
        width="100%"
        height="400"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  )
}
