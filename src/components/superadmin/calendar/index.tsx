'use client';

import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { X, Info, Calendar, Grid, ChevronLeft, ChevronRight, Plus } from 'react-feather';

interface Booking {
  id: number;
  arrival: string;
  departure: string;
  property: {
    id: number;
    name: string;
  };
  listing_site: string;
  status: string;
  platform_reservation_number: string;
  is_block: boolean;
  notes?: string;
  type?: string;
}

interface CalendarPageProps {
  bookings?: Booking[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  textColor?: string;
  extendedProps: {
    source: string;
    status: string;
    reservationNumber: string;
    notes?: string;
    isBlock: boolean;
    propertyName: string;
    propertyId: number;
    type?: string;
  };
}

// Enhanced color palette for different properties
const propertyColors = [
  '#586DF7', // Primary blue
  '#00CC91', // Emerald green
  '#FF6B6B', // Coral red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky blue
  '#96CEB4', // Mint green
  '#FECA57', // Golden yellow
  '#FF9FF3', // Pink
  '#54A0FF', // Light blue
  '#5F27CD', // Purple
];

const getPropertyColor = (propertyId: number) => {
  return propertyColors[propertyId % propertyColors.length];
};

// Sample booking data for demonstration
const sampleBookings: Booking[] = [
    // ... existing bookings (1-4) ...
    {
      id: 5,
      arrival: '2025-08-05',
      departure: '2025-08-12',
      property: { id: 4, name: 'Forest Lodge' },
      listing_site: 'Expedia',
      status: 'confirmed',
      platform_reservation_number: 'EXP-555555',
      is_block: false,
      type: 'booking'
    },
    {
      id: 6,
      arrival: '2025-07-22',
      departure: '2025-07-29',
      property: { id: 1, name: 'Ocean View Villa' },
      listing_site: 'VRBO',
      status: 'confirmed',
      platform_reservation_number: 'VRBO-222222',
      is_block: false,
      type: 'booking'
    },
    {
      id: 7,
      arrival: '2025-08-18',
      departure: '2025-08-21',
      property: { id: 2, name: 'Mountain Retreat' },
      listing_site: 'Direct',
      status: 'pending',
      platform_reservation_number: 'DIR-777777',
      is_block: false,
      type: 'booking'
    },
    {
      id: 8,
      arrival: '2025-09-01',
      departure: '2025-09-10',
      property: { id: 5, name: 'Desert Oasis' },
      listing_site: 'Booking.com',
      status: 'confirmed',
      platform_reservation_number: 'BDC-888888',
      is_block: false,
      type: 'booking'
    },
    {
      id: 9,
      arrival: '2025-07-26',
      departure: '2025-07-28',
      property: { id: 3, name: 'City Apartment' },
      listing_site: 'Airbnb',
      status: 'cancelled',
      platform_reservation_number: 'AIR-999999',
      is_block: false,
      type: 'booking'
    },
    {
      id: 10,
      arrival: '2025-08-15',
      departure: '2025-08-20',
      property: { id: 4, name: 'Forest Lodge' },
      listing_site: 'Vrbo',
      status: 'confirmed',
      platform_reservation_number: 'VRBO-101010',
      is_block: false,
      type: 'booking'
    }
  ];
const CalendarPage = ({ bookings = sampleBookings }: CalendarPageProps) => {
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'listWeek'>('dayGridMonth');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [currentDateTitle, setCurrentDateTitle] = useState('');
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const calendarRef = useRef<any>(null);

  // Update date title when view changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      setCurrentDateTitle(calendarApi.view.title);
    }
  }, [currentView]);

  // Transform bookings data into calendar events
  const events: CalendarEvent[] = bookings.map((booking) => {
    const isBlocked = booking.is_block || booking.type !== 'booking';
    const baseColor = isBlocked 
      ? '#FF6B6B' // Coral red for blocked
      : getPropertyColor(booking.property.id);
    
    return {
      id: `event-${booking.id}`,
      title: isBlocked ? 'Blocked' : booking.property.name,
      start: booking.arrival,
      end: booking.departure,
      color: baseColor,
      textColor: '#ffffff',
      extendedProps: {
        source: booking.listing_site,
        status: booking.status,
        reservationNumber: booking.platform_reservation_number,
        notes: booking.notes,
        isBlock: isBlocked,
        propertyName: booking.property.name,
        propertyId: booking.property.id,
        type: booking.type
      }
    };
  });

  const handleDateSelect = (selectInfo: any) => {
    const title = prompt('Enter a reason for blocking these dates:');
    const calendarApi = selectInfo.view.calendar;

    if (title) {
      calendarApi.addEvent({
        id: `new-block-${Date.now()}`,
        title: 'Blocked',
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        color: '#FF6B6B',
        textColor: '#ffffff',
        allDay: selectInfo.allDay,
        extendedProps: {
          isBlock: true,
          propertyName: 'Blocked Dates',
          type: 'blocked'
        }
      });
    }
  };

  const handlePrev = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
      updateDateTitle();
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
      updateDateTitle();
    }
  };

  const updateDateTitle = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      setCurrentDateTitle(calendarApi.view.title);
    }
  };

  const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'listWeek') => {
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
    setCurrentView(view);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    setModalData({
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      source: event.extendedProps.source,
      status: event.extendedProps.status,
      reservationNumber: event.extendedProps.reservationNumber,
      notes: event.extendedProps.notes,
      isBlock: event.extendedProps.isBlock,
      propertyName: event.extendedProps.propertyName,
      type: event.extendedProps.type
    });
    setModalOpen(true);
  };

  const renderEventContent = (eventInfo: any) => {
    const viewType = eventInfo.view?.type || '';
    const title = eventInfo.event.title;
    const isBlocked = eventInfo.event.extendedProps.isBlock || eventInfo.event.extendedProps.type !== 'booking';
    const isHovered = hoveredEventId === eventInfo.event.id;

    if (viewType.startsWith('list')) {
      return (
        <div 
          className="flex flex-col p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => handleEventClick({ event: eventInfo.event })}
          onMouseEnter={() => setHoveredEventId(eventInfo.event.id)}
          onMouseLeave={() => setHoveredEventId(null)}
        >
          <div className="text-sm font-semibold text-gray-900">
            {isBlocked ? 'Blocked' : title}
          </div>
          <div className="text-xs text-gray-600">
            {eventInfo.event.extendedProps.source}
            {!isBlocked && (
              <span className="ml-2 text-gray-500">
                {format(new Date(eventInfo.event.start), 'MMM d')} - {format(new Date(eventInfo.event.end), 'MMM d')}
              </span>
            )}
          </div>
        </div>
      );
    } else {
      const truncatedTitle = isBlocked ? 'Blocked' : title;
      return (
        <div 
          className={`fc-event-main-frame w-full h-full flex items-center justify-center transition-all duration-200 rounded-md ${
            isHovered ? 'transform scale-105 shadow-lg' : ''
          }`}
          onClick={() => handleEventClick({ event: eventInfo.event })}
          onMouseEnter={() => setHoveredEventId(eventInfo.event.id)}
          onMouseLeave={() => setHoveredEventId(null)}
        >
          <div className="fc-event-title-container px-2 py-1">
            <div className="fc-event-title text-xs font-medium text-center leading-tight truncate">
              {truncatedTitle}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Main Calendar Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sm:p-4 md:p-6">
          {/* Calendar Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6">
            {/* Navigation */}
            <div className="flex items-center gap-2 sm:gap-4 justify-center md:justify-start">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 min-w-[120px] sm:min-w-[200px] text-center">
                {currentDateTitle}
              </h2>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>
            </div>

            {/* View Selector */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto justify-center md:justify-start">
              <button
                onClick={() => handleViewChange('dayGridMonth')}
                className={`px-3 sm:px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  currentView === 'dayGridMonth' 
                    ? 'bg-white shadow-sm text-blue-600 font-medium' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid size={16} />
                Month
              </button>
              <button
                onClick={() => handleViewChange('timeGridWeek')}
                className={`px-3 sm:px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  currentView === 'timeGridWeek' 
                    ? 'bg-white shadow-sm text-blue-600 font-medium' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Calendar size={16} />
                Week
              </button>
              <button
                onClick={() => handleViewChange('listWeek')}
                className={`px-3 sm:px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  currentView === 'listWeek' 
                    ? 'bg-white shadow-sm text-blue-600 font-medium' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="calendar-container overflow-x-auto rounded-lg" style={{ WebkitOverflowScrolling: 'touch' }}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView={currentView}
              headerToolbar={false}
              events={events}
              selectable={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              height={window.innerWidth < 640 ? 400 : 600}
              datesSet={(arg) => setCurrentDateTitle(arg.view.title)}
              eventDisplay="block"
              nowIndicator={true}
              dayMaxEvents={4}
              dayMaxEventRows={4}
              views={{
                dayGridMonth: {
                  dayMaxEventRows: 4,
                },
                timeGridWeek: {
                  dayHeaderFormat: { weekday: 'short', day: 'numeric' }
                },
                listWeek: {
                  listDayFormat: { weekday: 'long', day: 'numeric', month: 'long' }
                }
              }}
              eventClassNames="cursor-pointer"
              dayHeaderClassNames="bg-gray-50 font-medium text-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Booking Details Modal */}
        {modalOpen && modalData && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 transition-opacity duration-300"
            onClick={() => setModalOpen(false)}
          >
            <div className="relative w-full max-w-md sm:max-w-lg mx-auto">
              <div 
                className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className={`p-6 ${
                  modalData.isBlock ? 'bg-red-50' : 
                  modalData.status === 'confirmed' ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {modalData.propertyName}
                      </h3>
                      <p className="text-gray-600 mt-2">
                        {format(new Date(modalData.start), 'EEEE, MMM d, yyyy')} - {format(new Date(modalData.end), 'EEEE, MMM d, yyyy')}
                      </p>
                    </div>
                    <button 
                      className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-white hover:bg-opacity-50 rounded-lg"
                      onClick={() => setModalOpen(false)}
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    modalData.isBlock ? 'bg-red-100 text-red-800' : 
                    modalData.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {modalData.isBlock ? 'Blocked' : modalData.status.charAt(0).toUpperCase() + modalData.status.slice(1)}
                  </div>
                </div>
                
                {/* Modal Content */}
                {!modalData.isBlock && (
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="bg-blue-100 rounded-lg p-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-2 0h-6m6 0H9m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Platform</h4>
                          <p className="text-gray-900 font-medium text-lg">{modalData.source}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Reservation Number</h4>
                          <p className="text-gray-900 font-mono text-lg break-words">{modalData.reservationNumber}</p>
                        </div>
                      </div>
                      
                      {modalData.notes && (
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          <div className="bg-yellow-100 rounded-lg p-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Notes</h4>
                            <p className="text-gray-900">{modalData.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {modalData.isBlock && (
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="bg-red-100 rounded-lg p-3">
                        <Info size={20} className="text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Reason</h4>
                        <p className="text-gray-900 text-lg">{modalData.title}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Booking List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Booking List</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {events.map((event, index) => (
              <div key={event.id} className="flex items-center gap-3 text-sm">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: event.color }}
                ></div>
                <span className="text-gray-600 font-medium">
                  {format(new Date(event.start), 'dd LLL, yyyy')}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-800 font-medium">
                  {event.extendedProps.isBlock ? '(Blocked)' : '(Booked)'}
                </span>
              </div>
            ))}
            {events.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                No bookings found
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
        }
        
        .fc .fc-button {
          display: none;
        }
        
        .fc .fc-daygrid-day-number {
          color: #374151;
          font-weight: 600;
          padding: 8px;
          font-size: 0.875rem;
        }
        
        .fc .fc-col-header-cell-cushion {
          padding: 12px 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }
        
        .fc .fc-day-today {
          background-color: #eff6ff !important;
        }
        
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          color: #2563eb;
          font-weight: 700;
          background-color: #dbeafe;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .fc-event {
          border-radius: 8px !important;
          border: none !important;
          padding: 2px 0 !important;
          margin: 2px 1px !important;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
          opacity: 0.95;
          font-weight: 500;
        }
        
        .fc-event:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10;
          opacity: 1;
        }
        
        .fc-daygrid-event {
          margin: 2px 4px;
          min-height: 24px;
        }
        
        .fc-daygrid-block-event .fc-event-time, 
        .fc-daygrid-block-event .fc-event-title {
          padding: 4px 8px;
        }
        
        .fc .fc-daygrid-body-natural .fc-daygrid-day-events {
          margin-bottom: 2px;
        }
        
        .fc .fc-scrollgrid {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .fc .fc-scrollgrid-section > * {
          border-left: 1px solid #f3f4f6;
          border-top: 1px solid #f3f4f6;
        }
        
        .fc .fc-daygrid-day-frame {
          min-height: 5rem;
          position: relative;
        }
        
        .calendar-container {
          min-width: 320px;
          height: 400px;
        }
        @media (min-width: 640px) {
          .calendar-container {
            height: 600px;
          }
        }

        .fc .fc-list {
          border: none;
        }
        
        .fc .fc-list-day-cushion {
          background-color: #f9fafb;
          color: #374151;
          font-weight: 600;
        }
        
        .fc .fc-list-event:hover td {
          background-color: #f3f4f6;
        }
        
        .fc .fc-list-event-dot {
          border-radius: 50%;
          width: 10px;
          height: 10px;
        }
        
        .fc-theme-standard .fc-scrollgrid {
          border-color: #e5e7eb;
        }
        
        .fc-theme-standard .fc-scrollgrid-section table th {
          border-color: #e5e7eb;
        }
        
        .fc-theme-standard .fc-scrollgrid-section table td {
          border-color: #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;