'use client';

import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { X, Info, Calendar, Grid } from 'react-feather';

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
  type?: string; // Add type field
}

interface BookingSourcesChartProps {
  bookings: Booking[];
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

// Color palette for different properties
const propertyColors = [
  '#00CC91', // green
  '#586DF7', // blue
  '#FFC107', // yellow
  '#FF5252', // red
  '#9C27B0', // purple
  '#FF9800', // orange
  '#4CAF50', // dark green
  '#2196F3', // light blue
  '#607D8B', // blue gray
  '#795548', // brown
];

const getPropertyColor = (propertyId: number) => {
  // Use modulo to cycle through colors if there are more properties than colors
  return propertyColors[propertyId % propertyColors.length];
};

const BookingCalendar = ({ bookings }: BookingSourcesChartProps) => {
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

  const getVisibleRange = () => {
    if (!events.length) return { start: new Date(), end: new Date() };
    
    const eventStarts = events.map(e => new Date(e.start).getTime());
    const eventEnds = events.map(e => new Date(e.end).getTime());
    
    const minDate = new Date(Math.min(...eventStarts));
    const maxDate = new Date(Math.max(...eventEnds));
    
    // Add buffer days for better visibility
    minDate.setDate(minDate.getDate() - 1);
    maxDate.setDate(maxDate.getDate() + 1);
    
    return {
      start: minDate,
      end: maxDate
    };
  };

  // Transform bookings data into calendar events
  const events: CalendarEvent[] = bookings.map((booking) => {
    const isBlocked = booking.is_block || booking.type !== 'booking';
    const baseColor = isBlocked 
      ? '#FF5252' // red for blocked
      : getPropertyColor(booking.property.id);
    
    return {
      id: `event-${booking.id}`,
      title: isBlocked ? 'Blocked' : booking.property.name,
      start: booking.arrival,
      end: booking.departure,
      color: baseColor,
      textColor: '#ffffff', // white text for better contrast
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
        color: '#FF5252',
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
          className="flex flex-col" 
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
              <span className="ml-2">
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
          className={`fc-event-main-frame w-full h-full flex items-center justify-center transition-all duration-200 ${
            isHovered ? 'transform scale-105' : ''
          }`}
          onClick={() => handleEventClick({ event: eventInfo.event })}
          onMouseEnter={() => setHoveredEventId(eventInfo.event.id)}
          onMouseLeave={() => setHoveredEventId(null)}
        >
          <div className="fc-event-title-container px-1">
            <div className="fc-event-title text-xs font-medium text-center leading-tight">
              {truncatedTitle}
            </div>
          </div>
        </div>
      );
    }
  };
  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-5">
      <div className="flex flex-col sm:flex-row justify-start items-center mb-4 gap-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {/* <Calendar size={20} /> */}
          Booking Calendar
        </h2>
        <div className='flex'>
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-sm font-medium text-gray-700 px-2 min-w-[180px] text-center">
            {currentDateTitle}
          </div>
          <button
            onClick={handleNext}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 sm:mt-0 mb-4">
        
        <div className="ml-2 flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleViewChange('dayGridMonth')}
            className={`px-2.5 py-1.5 text-xs rounded-md flex items-center ${currentView === 'dayGridMonth' ? 'bg-white shadow text-[#586DF7]' : 'text-gray-600'}`}
          >
            <Grid size={14} className="mr-1" />
            Month
          </button>
          <button
            onClick={() => handleViewChange('timeGridWeek')}
            className={`px-2.5 py-1.5 text-xs rounded-md flex items-center ${currentView === 'timeGridWeek' ? 'bg-white shadow text-[#586DF7]' : 'text-gray-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Week
          </button>
          <button
            onClick={() => handleViewChange('listWeek')}
            className={`px-2.5 py-1.5 text-xs rounded-md flex items-center ${currentView === 'listWeek' ? 'bg-white shadow text-[#586DF7]' : 'text-gray-600'}`}
          >
            List
          </button>
        </div>
      </div>

      <div className="calendar-container">
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
          height={350}
          datesSet={(arg) => setCurrentDateTitle(arg.view.title)}
          eventDisplay="block"
          nowIndicator={true}
          dayMaxEvents={3}
          dayMaxEventRows={3}
          views={{
            dayGridMonth: {
              dayMaxEventRows: 3,
            },
            timeGridWeek: {
              dayHeaderFormat: { weekday: 'short', day: 'numeric' }
            },
            listCustom: {
              type: 'list',
              duration: { days: 7 }, // Default duration if no events
              visibleRange: getVisibleRange(), // Custom visible range
              buttonText: 'List'
            }
          }}
          eventClassNames="cursor-pointer"
          dayHeaderClassNames="bg-gray-50 font-medium text-gray-700 text-xs"
        />
      </div>

      {/* Modern Modal */}
      {modalOpen && modalData && (
        <div className="fixed inset-0 bg-[#00000087] backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-500 ease-in-out" style={{opacity: modalOpen ? 1 : 0}} onClick={() => setModalOpen(false)}>
          <div className="relative">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all" onClick={(e) => e.stopPropagation()}>
              <div className={`p-5 ${modalData.isBlock ? 'bg-red-50' : modalData.status === 'active' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {modalData.propertyName}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {format(new Date(modalData.start), 'MMM d, yyyy')} - {format(new Date(modalData.end), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <button 
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                    onClick={() => setModalOpen(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  modalData.isBlock ? 'bg-red-100 text-red-800' : 
                  modalData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {modalData.isBlock ? 'Blocked' : modalData.status}
                </div>
              </div>
              
              {!modalData.isBlock && (
                <div className="p-5 border-t border-gray-100">
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="bg-gray-100 rounded-lg p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</h4>
                        <p className="text-gray-800">{modalData.source}</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="bg-gray-100 rounded-lg p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reservation #</h4>
                        <p className="text-gray-800 font-mono break-words">{modalData.reservationNumber}</p>
                      </div>
                    </div>
                    
                    {/* {modalData.notes && (
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="bg-gray-100 rounded-lg p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</h4>
                          <p className="text-gray-800">{modalData.notes}</p>
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              )}
              
              {modalData.isBlock && (
                <div className="p-5 border-t border-gray-100">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="bg-gray-100 rounded-lg p-2">
                        <Info size={20} className="text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</h4>
                      <p className="text-gray-800">{modalData.title}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

 <style jsx global>{`
        .fc .fc-toolbar-title {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }
        
        .fc .fc-button {
          display: none;
        }
        
        .fc .fc-daygrid-day-number {
          color: #4b5563;
          font-weight: 500;
          padding: 4px;
          font-size: 0.75rem;
        }
        
        .fc .fc-col-header-cell-cushion {
          padding: 4px;
          font-size: 0.75rem;
        }
        
        .fc .fc-day-today {
          background-color: #f0f4ff !important;
        }
        
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          color: #586DF7;
          font-weight: 700;
        }
        
        .fc-event {
          border-radius: 6px;
          border: none;
          padding: 0;
          margin: 1px;
          cursor: pointer;
          box-shadow: 0 1px 1px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          opacity: 0.9;
        }
        
        .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
          z-index: 10;
          opacity: 1;
        }
        
        .fc-daygrid-event {
          margin: 1px 2px;
        }
        
        .fc-daygrid-block-event .fc-event-time, 
        .fc-daygrid-block-event .fc-event-title {
          padding: 0;
        }
        
        .fc .fc-daygrid-body-natural .fc-daygrid-day-events {
          margin-bottom: 1px;
        }
        
        .fc .fc-scrollgrid {
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        
        .fc .fc-scrollgrid-section > * {
          border-left: 1px solid #e5e7eb;
          border-top: 1px solid #e5e7eb;
        }
        
        .fc .fc-daygrid-day-frame {
          min-height: 4rem;
        }
        
        .calendar-container {
          height: 350px;
        }

        /* Highlight all days in a booking range when hovering */
        .fc-event-highlight {
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default BookingCalendar;