// app/dashboard/page.tsx
'use client';
import AdminLayout from "@/components/layout/AdminLayout";
import Image from "next/image";
import RevenueChart from "./RevenueDashboard";
import BookingSourcesChart from "./BookingSourcesChart";
import BookingCalendar from "./BookingCalendar";
import OwnerStatementsTable from "./OwnerStatementsTable";
import OccupancyTradesDashboard from "./OccupancyTradesDashboard";
import NightlyRateChart from "./NightlyRateChart";
import { useEffect, useState } from "react";
import PropertiesTable from "./PropertiesTable";

const BookingImage = "/images/booking.png";
const RevenueImage = "/images/revenue.png";
const RateImage = "/images/rate.png";
const CustomerImage = "/images/customer.png";

interface Booking {
  id: number;
  arrival: string;
  departure: string;
  status: string;
  property: {
    id: number;
    name: string;
  };
  currency_code: string;
  platform_reservation_number: string;
  listing_site: string;
  is_block: boolean;
  notes?: string;
}

interface OwnerStatement {
  Key: string;
  OwnerId: number;
  StatementDate: string;
  IncludedBookings: number;
  Total: number;
  Paid: number;
  Unpaid: number;
  Status: number;
  Note?: string;
  downloadUrl: string;
}

interface CurrentMonthData {
  role: string;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
}
interface RevenueItem {
  amount: number;
  month: number;
  year: number;
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

// Supporting interfaces
interface OccupancyTrend {
  month: string; 
  year: number;
  value: number;
}

interface StatementsData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  statements: OwnerStatement[];
  payout: {
    amount: number;
    date: string;
    monthName: number;
    year: number
  }
}

interface Property {
  active: boolean;
  address: {
    city: string;
    country: string;
    id: number;
    is_default: boolean;
    postal_code: string;
    state: string;
    street1?: string;
    street2?: string;
  };
  bathrooms: number;
  bathrooms_full: number;
  bathrooms_half: number;
  bedrooms: number;
  check_in: string;
  check_out: string;
  currency_code: string;
  id: number;
  key: string;
  latitude: number;
  longitude: number;
  max_children: number;
  max_guests: number;
  max_pets: number;
  name: string;
  property_type: string;
  thumbnail_url: string;
  thumbnail_url_large: string;
  thumbnail_url_medium: string;
}

interface PropertiesData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  properties: Property[];
}

export default function Index() {
  const [currentMonthData, setCurrentMonthData] = useState<CurrentMonthData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [statementsData, setStatementsData] = useState<StatementsData | null>(null);
  const [propertiesData, setPropertiesData] = useState<PropertiesData | any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    occupancyRate: "0%",
    revenueGenerated: 0,
    totalBookings: 0,
    totalCustomers: "1,200+"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageProperties, setCurrentPageProperties] = useState(1);

  const fetchStatements = async (page: number) => {
    try {
      const response = await fetch(`/api/ownerstatements?page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch owner statements');
      const data = await response.json();
      setStatementsData(data);
    } catch (err) {
      console.error('Error fetching statements:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statements');
    }
  };
    const fetchProperties = async (page: number) => {
    try {
      const response = await fetch(`/api/properties/admin?page=${page}&pageSize=4`);
      if (!response.ok) throw new Error('Failed to fetch owner statements');
      const data = await response.json();
      setPropertiesData(data);
    } catch (err) {
      console.error('Error fetching statements:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statements');
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsLoadingProperties(true)
      setError(null);
      
      try {
        const [currentMonthRes, historicalRes] = await Promise.all([
          fetch('/api/admin/dashboard/current-month'),
          fetch('/api/admin/dashboard/historical')
        ]);

        // Handle API errors
        if (!currentMonthRes.ok) throw new Error('Failed to fetch current month bookings');
        if (!historicalRes.ok) throw new Error('Failed to fetch historical bookings');

        const currentMonthData = await currentMonthRes.json();
        const historicalData = await historicalRes.json();

        setCurrentMonthData(currentMonthData);
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
    fetchStatements(currentPage);
    fetchProperties(currentPageProperties);
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchStatements(newPage);
  };
  const handlePageChangeProperties = (newPage: number) => {
    setCurrentPage(newPage);
    fetchStatements(newPage);
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Owner Dashboard</h1>
  
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Bookings (This Monthly)" 
            value={isLoading ? "Loading..." : `${stats.totalBookings}`} 
            icon={BookingImage} 
            background="#475BE81A" 
          />
          <StatCard 
            title="Revenue Generated (This Monthly)" 
            value={isLoading ? "Loading..." : `$${stats.revenueGenerated.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} 
            icon={RevenueImage} 
            background="#FD85391A" 
          />
          <StatCard 
            title="Occupancy Rate (This Monthly)" 
            value={isLoading ? "Loading..." : stats.occupancyRate} 
            icon={RateImage} 
            background="#2ED4801A" 
          />
          <StatCard 
            title="Upcoming Payout (This Monthly)" 
            // value={statementsData?.payout?.amount.toString() || "$0"} 
            value={isLoading ? "Loading..." : `$${statementsData?.payout?.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
            date={`${statementsData?.payout?.date} ${statementsData?.payout?.monthName} ${statementsData?.payout?.year}`} 
            icon={CustomerImage} 
            background="#FE6D8E1A" 
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p className="font-medium">Data Loading Error</p>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reload Data
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 space-y-6">
            <div className="md:col-span-2">
              <RevenueChart revenueData={historicalData?.previousRevenue || []} />
              {/* <RevenueChart /> */}
            </div>
            <div className="md:col-span-2 mb-6">
              <OccupancyTradesDashboard occupancyData={historicalData?.occupancyTrends || []} />
              
            </div>
          </div>
          <div className="space-y-6">
            <BookingCalendar bookings={historicalData?.bookings || []} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-6 mt-6">
            <div className="md:col-span-1 mt-6 md:mt-0">
              {/* <NightlyRateChart rateData={historicalData?.nightlyRates || []} /> */}
              <NightlyRateChart />
            </div>
            <div className="md:col-span-1">
              <BookingSourcesChart bookings={historicalData?.bookings || []} />
            </div>
          </div>
          {/* <div className="space-y-6 md:mt-0 mt-6">
            <OwnerStatementsTable 
                data={statementsData}
                isLoading={isLoading && !statementsData}
                error={error}
                onPageChange={handlePageChange}
              />
          </div> */}
          <div className="space-y-6 mt-6">
            <PropertiesTable 
                data={propertiesData}
                isLoading={isLoadingProperties && !propertiesData}
                error={error}
                onPageChange={handlePageChangeProperties}
              />
            
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// StatCard component remains the same
function StatCard({ title, value, icon, background, date }: { 
  title: string; 
  value: string; 
  date?: string;
  icon: string; 
  background: string 
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex justify-between items-center">
      <div className="">
        <h3 className="text-[#4E5258] text-sm font-medium mb-3">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {
          date && 
          (<p className="text-sm text-blue-400">Payout Date: {date}</p>)

        }
      </div>
      <div 
        className="w-14 h-14 flex items-center justify-center rounded-full" 
        style={{ backgroundColor: background }} 
      >
        <Image 
          src={icon} 
          alt={title} 
          width={28} 
          height={28} 
          quality={100} 
          className="object-contain"
        />
      </div>
    </div>
  );
}