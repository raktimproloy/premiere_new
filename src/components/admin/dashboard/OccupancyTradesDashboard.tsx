// components/OccupancyTradesDashboard.tsx
'use client';

import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { BsThreeDots } from "react-icons/bs";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface OccupancyItem {
  amount: number;
  month: number;
  year: number;
}

interface OccupancyData {
  month: string;
  occupancy: number;
}

// Dummy data for testing
// const occupancyData = [
//   { month: "Jan", year: 2025, value: 65.2 },
//   { month: "Feb", year: 2025, value: 68.5 },
//   { month: "Mar", year: 2025, value: 72.1 },
//   { month: "Apr", year: 2025, value: 70.8 },
//   { month: "May", year: 2025, value: 75.3 },
//   { month: "Jun", year: 2025, value: 78.6 },
//   { month: "Jul", year: 2025, value: 82.4 },
//   { month: "Aug", year: 2024, value: 80.9 },
//   { month: "Sep", year: 2024, value: 79.2 },
//   { month: "Oct", year: 2024, value: 77.5 },
//   { month: "Nov", year: 2024, value: 81.3 },
//   { month: "Dec", year: 2024, value: 85.0 },
// ];

const OccupancyTradesDashboard = ({ occupancyData = [] }: { occupancyData?: any[] }) => {
  const convertData = (data: any[]): OccupancyItem[] => {
    const monthMap: Record<string, number> = {
      "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
      "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
    };
    
    return data.map(item => ({
      amount: item.value,
      month: monthMap[item.month],
      year: item.year
    }));
  };

  const ensureFullYearData = (data: OccupancyItem[]): OccupancyItem[] => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const fullYear: OccupancyItem[] = [];
    
    // Create 12 months data
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      fullYear.push({
        amount: 0,
        month: date.getMonth() + 1,
        year: date.getFullYear()
      });
    }
    
    // Merge with actual data
    return fullYear.map(emptyItem => {
      const foundItem = data.find(item => 
        item.month === emptyItem.month && item.year === emptyItem.year
      );
      return foundItem || emptyItem;
    });
  };

  const transformOccupancyData = (data: OccupancyItem[]): OccupancyData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return data.map(item => ({
      month: `${months[item.month - 1]} '${item.year.toString().slice(2)}`,
      occupancy: item.amount
    }));
  };

  const getCurrentAndPreviousMonth = (data: OccupancyData[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const currentMonthLabel = `${months[currentMonth]} '${currentYear.toString().slice(2)}`;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthLabel = `${months[prevMonth]} '${prevYear.toString().slice(2)}`;
    
    const currentMonthData = data.find(item => 
      item.month === currentMonthLabel
    );
    
    const lastMonthData = data.find(item => 
      item.month === prevMonthLabel
    );

    return { 
      currentMonthData: currentMonthData || { month: currentMonthLabel, occupancy: 0 },
      lastMonthData: lastMonthData || { month: prevMonthLabel, occupancy: 0 }
    };
  };

  // Process data with proper conversion
  const convertedData = convertData(occupancyData);
  const fullYearData = ensureFullYearData(convertedData);
  const transformedData = transformOccupancyData(fullYearData);
  const { currentMonthData, lastMonthData } = getCurrentAndPreviousMonth(transformedData);

  // Calculate percentage change
  const calculatePercentageChange = (): number => {
    if (!currentMonthData || !lastMonthData || lastMonthData.occupancy === 0) {
      return 0;
    }
    return ((currentMonthData.occupancy - lastMonthData.occupancy) / lastMonthData.occupancy) * 100;
  };

  const percentageChange = calculatePercentageChange();

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Chart data configuration for bar chart
  const chartData = {
    labels: transformedData.map(item => item.month),
    datasets: [
      {
        label: 'Occupancy Rate',
        data: transformedData.map(item => item.occupancy),
        backgroundColor: transformedData.map(item => {
          if (item.month === currentMonthData?.month) return '#38A169';
          if (item.month === lastMonthData?.month) return '#F6E05E';
          return '#C6F6D5';
        }),
        borderColor: transformedData.map(item => {
          if (item.month === currentMonthData?.month) return '#38A169';
          if (item.month === lastMonthData?.month) return '#F6E05E';
          return '#C6F6D5';
        }),
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  // Chart options for bar chart
  const chartOptions: ChartOptions<'bar'> = {
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
            return `${label}: ${formatPercentage(value)}`;
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
            return `${numValue}%`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-0">
        <div className='flex justify-between align-middle'>
          <h1 className="text-xl font-bold text-gray-800">Occupancy Trades</h1>
          <div>
            <div className='flex align-middle gap-3'>
              <p className='h-3 text-sm text-[#969FB7] before:inline-block before:w-3 before:h-3 before:rounded-full before:bg-[#F6E05E] before:mr-2'>Last Month</p>
              <p className='h-3 text-sm text-[#969FB7] before:inline-block before:w-3 before:h-3 before:rounded-full before:bg-[#38A169] before:mr-2'>Current Month</p>
              <BsThreeDots className='mt-1 mx-3' />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-4">
          <div className="mb-4 sm:mb-0 flex gap-5 align-middle">
            <p className="text-2xl font-semibold text-gray-900">
              {formatPercentage(currentMonthData.occupancy)}
            </p>
            <div className={`flex items-center`}>
              {percentageChange >= 0 ? (
                <FaArrowUp className='p-2 rounded-full w-8 h-8 text-white bg-[#38A169] mr-2' />
              ) : (
                <FaArrowDown className='p-2 rounded-full w-8 h-8 text-white bg-red-500 mr-2' />
              )}
              <div>
                <p className={`font-bold ${percentageChange >= 0 ? 'text-[#38A169]' : 'text-red-500'}`}>
                  {Math.abs(percentageChange).toFixed(1)}%
                </p>
                <p className="text-xs text-[#969FB7]">Than last Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <Bar 
          data={chartData} 
          options={chartOptions}
        />
      </div>
    </div>
  );
};

export default OccupancyTradesDashboard;