// components/BookingSourcesChart.tsx
'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Booking {
  id: number;
  arrival: string;
  departure: string;
  status: string;
  listing_site: string;
  property: {
    id: number;
    name: string;
  };
  // Add other booking properties as needed
}

interface BookingSourcesChartProps {
  bookings: Booking[];
}

const BookingSourcesChart = ({ bookings }: BookingSourcesChartProps) => {
  // Process booking data to count sources
  const processBookingData = () => {
    const sourceCounts: Record<string, number> = {};
    
    // Initialize with known sources
    const knownSources = ['Airbnb', 'VRBO', 'Booking.com', 'Direct'];
    knownSources.forEach(source => {
      sourceCounts[source] = 0;
    });

    // Count bookings by source
    bookings.forEach(booking => {
      if (booking.status !== 'active') return;
      
      const source = booking.listing_site || 'Direct';
      const normalizedSource = knownSources.includes(source) 
        ? source 
        : 'Other';
      
      sourceCounts[normalizedSource] = (sourceCounts[normalizedSource] || 0) + 1;
    });

    // Convert to array and filter out sources with 0 bookings
    return Object.entries(sourceCounts)
      .filter(([_, count]) => count > 0)
      .map(([source, count]) => ({
        source,
        count,
        value: count // For compatibility with existing code
      }));
  };

  const bookingSources = processBookingData();
  const totalBookings = bookingSources.reduce((sum, source) => sum + source.count, 0);

  // Color palette for sources
  const sourceColors: Record<string, string> = {
    'Airbnb': '#FF5A5F',
    'VRBO': '#00A699',
    'Booking.com': '#003580',
    'Direct': '#586DF7',
    'Other': '#F7B730'
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const chartData = {
    labels: bookingSources.map(source => source.source),
    datasets: [
      {
        data: bookingSources.map(source => source.count),
        backgroundColor: bookingSources.map(source => sourceColors[source.source] || '#999999'),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '40%',
    plugins: {
      legend: {
        position: 'left',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            family: 'Inter, sans-serif'
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i] as number;
                const percentage = ((value / totalBookings) * 100).toFixed(1);
                const backgroundColor = data.datasets[0].backgroundColor;
                const fillStyle = Array.isArray(backgroundColor) ? backgroundColor[i] : '#000000';
                return {
                  text: `${label}: ${percentage}% (${value} bookings)`,
                  fillStyle: fillStyle,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const percentage = ((value / totalBookings) * 100).toFixed(1);
            return `${label}: ${percentage}% (${value} bookings)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 py-12">
      <h2 className="text-xl font-bold text-gray-800 mb-0">Booking Sources</h2>
      <div className="h-66 w-full">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default BookingSourcesChart;