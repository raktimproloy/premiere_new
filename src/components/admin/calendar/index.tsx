'use client';

import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { X, Info, Calendar, Grid, ChevronLeft, ChevronRight, Plus } from 'react-feather';
import BookingCalendar from '../dashboard/BookingCalendar';

interface RevenueItem {
  amount: number;
  month: number;
  year: number;
}

interface OccupancyTrend {
  month: string; 
  year: number;
  value: number;
}

interface HistoricalData {
  role: string;
  previousRevenue: RevenueItem[];
  occupancyTrends: OccupancyTrend[];
  nightlyRates: OccupancyTrend[];
  bookingSources: {
    total: number;
    sources: {
      name: string;
      count: number;
    }[];
  };
  bookings: Booking[];
}
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

  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [currentDateTitle, setCurrentDateTitle] = useState('');
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const calendarRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    occupancyRate: "0%",
    revenueGenerated: 0,
    totalBookings: 0,
    totalCustomers: "1,200+"
  });

  // Pagination state for booking list
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16; // Show 6 items per page (2 rows of 3 items each)

  // Update date title when view changes
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      setCurrentDateTitle(calendarApi.view.title);
    }
  }, [currentView]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsLoadingProperties(true)
      setError(null);
      
      try {
        const [currentMonthRes, historicalRes] = await Promise.all([
          fetch('/api/bookings/current-month'),
          fetch('/api/bookings/historical')
        ]);

        // Handle API errors
        if (!currentMonthRes.ok) throw new Error('Failed to fetch current month bookings');
        if (!historicalRes.ok) throw new Error('Failed to fetch historical bookings');

        const currentMonthData = await currentMonthRes.json();
        const historicalData = await historicalRes.json();

        setHistoricalData(historicalData);

        // Set stats from current month data
        setStats({
          occupancyRate: `${currentMonthData.occupancyRate.toFixed(2)}%`,
          revenueGenerated: currentMonthData.totalRevenue,
          totalBookings: currentMonthData.totalBookings,
          totalCustomers: "1,200+"
        });

      } catch (err) {
        console.error('API Error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
        setIsLoadingProperties(false)
      }
    };

    fetchData();
  }, []);

  const [events, setEvents] = useState([])
  useEffect(() => {

    if(historicalData?.bookings){
      // Transform bookings data into calendar events
      const events: any = historicalData?.bookings.map((booking) => {
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
      setEvents(events)
    }
  }, [historicalData])

  const updateDateTitle = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      setCurrentDateTitle(calendarApi.view.title);
    }
  };

  // Pagination logic for booking list
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = events.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when events change
  useEffect(() => {
    setCurrentPage(1);
  }, [events.length]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <BookingCalendar bookings={historicalData?.bookings || []} height={400} />

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
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Booking List</h3>
            {totalPages > 1 && (
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {currentEvents.map((event:any, index:any) => (
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
            {currentEvents.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                No bookings found
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
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