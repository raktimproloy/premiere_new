import React from 'react'

export default function WorkRating() {
  return (
    <div className="p-8 mb-12 max-w-7xl mx-auto">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    <div className="text-center border-r-2 border-gray-200 border-dashed">
      <div className=" text-4xl font-bold text-black mb-2">99<span className='text-[#586DF7]'>%</span></div>
      <div className="text-black font-medium">Customer Satisfaction</div>
    </div>
    <div className="text-center border-r-2 border-gray-200 border-dashed">
      <div className=" text-4xl font-bold text-black mb-2">06<span className='text-[#586DF7]'>Y</span></div>
      <div className="text-black font-medium">Years Experience</div>
    </div>
    <div className="text-center border-r-2 border-gray-200 border-dashed">
      <div className=" text-4xl font-bold text-black mb-2">35<span className='text-[#586DF7]'>+</span></div>
      <div className="text-black font-medium">Amazing team members</div>
    </div>
    <div className="text-center">
      <div className=" text-4xl font-bold text-black mb-2">1.5k<span className='text-[#586DF7]'>+</span></div>
      <div className="text-black font-medium">Our Happy Clients</div>
    </div>
    </div>
  </div>
  )
}
