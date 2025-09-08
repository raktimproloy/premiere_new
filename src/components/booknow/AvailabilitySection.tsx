'use client'
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { CalendarIcon } from '../../../public/images/svg';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const AvailabilitySection = () => {
  const CalendarImage = "/images/booknow/calendar.png"
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // June 2025
  const [nextMonthDate, setNextMonthDate] = useState(new Date(2025, 6, 1)); // July 2025

  // Month navigation handlers
  const handlePrevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
    setNextMonthDate(new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const handleNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
    setNextMonthDate(new Date(next.getFullYear(), next.getMonth() + 1, 1));
  };

  const handleDateClick = (arg: any) => {
    console.log('Date clicked: ', arg.dateStr);
  };

  return (
    <section className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
        <div className="col-span-1 lg:col-span-3 border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-3 sm:pb-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">Availability</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-600">
              <span>The minimum stay is <span className="font-semibold">2 Nights</span></span>
              <span>The maximum stay is <span className="font-semibold">365 Nights</span></span>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* June Calendar */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-center mb-2">
                {format(currentDate, 'MMMM yyyy')}
              </h3>
              <div className="calendar-container">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  initialDate={format(currentDate, 'yyyy-MM-dd')}
                  headerToolbar={false}
                  height="auto"
                  dayMaxEventRows={0}
                  events={[]}
                  eventContent={() => null}
                  dateClick={handleDateClick}
                  displayEventTime={false}
                  eventDisplay='none'
                  eventRemove={() => {}}
                  fixedWeekCount={false}
                  dayCellContent={(arg) => {
                    return { html: `<div class="fc-daygrid-day-number">${arg.dayNumberText}</div>` };
                  }}
                />
              </div>
            </div>
            {/* July Calendar */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-center mb-2">
                {format(nextMonthDate, 'MMMM yyyy')}
              </h3>
              <div className="calendar-container">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  initialDate={format(nextMonthDate, 'yyyy-MM-dd')}
                  headerToolbar={false}
                  height="auto"
                  dayMaxEventRows={0}
                  events={[]}
                  eventContent={() => null}
                  dateClick={handleDateClick}
                  displayEventTime={false}
                  fixedWeekCount={false}
                  dayCellContent={(arg) => {
                    return { html: `<div class="fc-daygrid-day-number">${arg.dayNumberText}</div>` };
                  }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Buttons - Moved to bottom */}
          <div className="flex items-center justify-center mt-4 sm:mt-6 gap-4">
            <button onClick={handlePrevMonth} className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
              <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <button onClick={handleNextMonth} className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
              <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>

          {/* Calendar Legend */}
          <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-100 border border-green-400 mr-1 sm:mr-2"></div>
              <span className="text-xs text-gray-700">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-100 border border-yellow-400 mr-1 sm:mr-2"></div>
              <span className="text-xs text-gray-700">Pending</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-100 border border-red-400 mr-1 sm:mr-2"></div>
              <span className="text-xs text-gray-700">Booked</span>
            </div>
          </div>
        </div>

        {/* Video Preview Section */}
        <div className="col-span-1 lg:col-span-2 flex items-center justify-center">
          <div className="relative w-full h-60 sm:h-80 rounded-xl overflow-hidden flex items-center justify-center" style={{backgroundImage: `url('/images/profile2.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
            <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.5 5.5v9l8-4.5-8-4.5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .calendar-container :global(.fc-daygrid-day-frame) {
          min-height: auto !important;
          height: auto !important;
        }
        .calendar-container :global(.fc-daygrid-day-events) {
          display: none !important;
        }
        .calendar-container :global(.fc-daygrid-day-bg) {
          display: none !important;
        }
        .calendar-container :global(.fc-daygrid-day) {
          min-height: 2rem !important;
          height: 2rem !important;
        }
        .calendar-container :global(.fc-daygrid-day-number) {
          padding: 0.25rem !important;
          text-align: center !important;
          font-size: 0.875rem !important;
        }
        .calendar-container :global(.fc-daygrid-day.fc-day-today) {
          background-color: #dbeafe !important;
        }
        // .calendar-container :global(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
        //   background-color: #3b82f6 !important;
        //   color: white !important;
        //   border-radius: 50% !important;
        //   width: 1.5rem !important;
        //   height: 1.5rem !important;
        //   display: flex !important;
        //   align-items: center !important;
        //   justify-content: center !important;
        //   margin: 0 auto !important;
        // }
        .calendar-container :global(.fc-daygrid-day:hover) {
          background-color: #f3f4f6 !important;
        }
        .calendar-container :global(.fc-daygrid-day.fc-day-other) {
          background-color: #f9fafb !important;
        }
        .calendar-container :global(.fc-daygrid-day.fc-day-other .fc-daygrid-day-number) {
          color: #9ca3af !important;
        }
        .calendar-container :global(.fc-daygrid-day.fc-day-past) {
          background-color: #f9fafb !important;
        }
        .calendar-container :global(.fc-daygrid-day.fc-day-past .fc-daygrid-day-number) {
          color: #9ca3af !important;
        }
        .calendar-container :global(.fc-daygrid-day.fc-day-future) {
          background-color: white !important;
        }
        .calendar-container :global(.fc-daygrid-day.fc-day-future .fc-daygrid-day-number) {
          color: #374151 !important;
        }
        .calendar-container :global(.fc-daygrid-day.fc-day-future:hover) {
          background-color: #f3f4f6 !important;
        }
        .calendar-container :global(.fc-daygrid-day.fc-day-future:hover .fc-daygrid-day-number) {
          background-color: #e5e7eb !important;
          border-radius: 0.25rem !important;
        }
      `}</style>
    </section>
  );
};

export default AvailabilitySection;