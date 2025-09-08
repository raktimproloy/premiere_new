// components/RevenueDashboard.tsx
'use client';

import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { BsThreeDots } from "react-icons/bs";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);


interface RevenueItem {
  amount: number;
  month: number;
  year: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

const RevenueDashboard = ({ revenueData = [] }: { revenueData: RevenueItem[] }) => {
// const RevenueDashboard = () => {
//   const revenueData = [
//     {
//         "amount": 15034,
//         "month": 8,
//         "year": 2024
//     },
//     {
//         "amount": 16784,
//         "month": 9,
//         "year": 2024
//     },
//     {
//         "amount": 23434,
//         "month": 10,
//         "year": 2024
//     },
//     {
//         "amount": 54644,
//         "month": 11,
//         "year": 2024
//     },
//     {
//         "amount": 35234,
//         "month": 12,
//         "year": 2024
//     },
//     {
//         "amount": 96574,
//         "month": 1,
//         "year": 2025
//     },
//     {
//         "amount": 23453,
//         "month": 2,
//         "year": 2025
//     },
//     {
//         "amount": 43734,
//         "month": 3,
//         "year": 2025
//     },
//     {
//         "amount": 74534,
//         "month": 4,
//         "year": 2025
//     },
//     {
//         "amount": 12543,
//         "month": 5,
//         "year": 2025
//     },
//     {
//         "amount": 32543,
//         "month": 6,
//         "year": 2025
//     },
//     {
//         "amount": 30321,
//         "month": 7,
//         "year": 2025
//     }
//   ]
  // Ensure we have 12 months of data
  const ensureFullYearData = (data: RevenueItem[]): RevenueItem[] => {
    if (data.length === 12) return [...data];
    
    // Create empty data structure for 12 months
    const fullYear: RevenueItem[] = Array(12).fill(null).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 11 + i);
      return {
        amount: 0,
        month: date.getMonth() + 1,
        year: date.getFullYear()
      };
    });
    
    // Merge existing data with empty structure
    return fullYear.map(emptyItem => {
      const foundItem = data.find(item => 
        item.month === emptyItem.month && item.year === emptyItem.year);
      return foundItem || emptyItem;
    });
  };

  // Transform data to chart format
  const transformRevenueData = (data: RevenueItem[]): RevenueData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    return data.map(item => ({
      month: `${months[item.month - 1]} ${item.year.toString().slice(2)}`,
      revenue: item.amount
    }));
  };

  // Get current and previous month data
  const getCurrentAndPreviousMonth = (data: RevenueData[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Find current month in dataset (July 2025)
    const currentMonthData = data.find(item => 
      item.month.startsWith('Jul') && item.month.endsWith('25'));
    
    // Find previous month (June 2025)
    const lastMonthData = data.find(item => 
      item.month.startsWith('Jun') && item.month.endsWith('25'));

    return { currentMonthData, lastMonthData };
  };

  // Process data through pipeline
  const fullYearData = ensureFullYearData(revenueData);
  const transformedData = transformRevenueData(fullYearData);
  const { currentMonthData, lastMonthData } = getCurrentAndPreviousMonth(transformedData);

  // Calculate percentage change
  const calculatePercentageChange = (): number => {
    if (!currentMonthData || !lastMonthData) return 0;
    if (lastMonthData.revenue === 0) return 0;
    return ((currentMonthData.revenue - lastMonthData.revenue) / lastMonthData.revenue) * 100;
  };

  const percentageChange = calculatePercentageChange();

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Chart.js data configuration
  const chartData = {
    labels: transformedData.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: transformedData.map(item => item.revenue),
        backgroundColor: 'rgba(88, 109, 247, 0.1)', // Fill color under line
        borderColor: '#586DF7', // Main line color
        pointBackgroundColor: transformedData.map((item) => {
          if (item.month === currentMonthData?.month) return '#586DF7';
          if (item.month === lastMonthData?.month) return '#FFE09E';
          return '#E0E7FF';
        }),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 6,
        borderWidth: 3,
        tension: 0.4, // Creates curved lines
        fill: true, // Enables area fill
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = { 
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280'
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6'
        },
        ticks: {
          color: '#6b7280',
          callback: (value) => {
            const numValue = Number(value);
            return `$${numValue / 1000}K`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-0">
        <div className='flex justify-between align-middle'>
          <h1 className="text-xl font-bold text-gray-800">Total Revenue</h1>
          <div>
            <div className='flex align-middle gap-3'>
              <p className='h-3 text-sm text-[#969FB7] before:inline-block before:w-3 before:h-3 before:rounded-full before:bg-[#FFE09E] before:mr-2'>Last Month</p>
              <p className='h-3 text-sm text-[#969FB7] before:inline-block before:w-3 before:h-3 before:rounded-full before:bg-[#586DF7] before:mr-2'>Current Month</p>
              <BsThreeDots className='mt-1 mx-3' />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-4">
          <div className="mb-4 sm:mb-0 flex gap-5 align-middle">
            <p className="text-2xl font-semibold text-gray-900">
              {transformedData.length > 0 ? formatCurrency(transformedData.reduce((sum, item) => sum + item.revenue, 0)) : '$0'}
            </p>
            <div className={`flex items-center`}>
              {percentageChange >= 0 ? (
                <FaArrowUp className='p-2 rounded-full w-8 h-8 text-white bg-[#586DF7] mr-2' />
              ) : (
                <FaArrowDown className='p-2 rounded-full w-8 h-8 text-white bg-red-500 mr-2' />
              )}
              <div>
                <p className={`font-bold ${percentageChange >= 0 ? 'text-[#586DF7]' : 'text-red-500'}`}>
                  {Math.abs(percentageChange).toFixed(1)}%
                </p>
                <p className="text-xs text-[#969FB7]">Than last Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <Line 
          data={chartData} 
          options={chartOptions}
        />
      </div>
    </div>
  );
};

export default RevenueDashboard;