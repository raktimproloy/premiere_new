// components/NightlyRateChart.tsx
'use client';

import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { BsThreeDots } from "react-icons/bs";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

interface RateDataItem {
  month: string;
  year: number;
  rate: number;
}

interface FormattedData {
  monthLabel: string;
  rate: number;
}

// const rateData = 
// [
//   {
//     "monthName": "Aug",
//     "year": 2024,
//     "totalNights": 12,
//     "ratePerNight": 125
//   },
//   {
//     "monthName": "Sep",
//     "year": 2024,
//     "totalNights": 18,
//     "ratePerNight": 135
//   },
//   {
//     "monthName": "Oct",
//     "year": 2024,
//     "totalNights": 22,
//     "ratePerNight": 145
//   },
//   {
//     "monthName": "Nov",
//     "year": 2024,
//     "totalNights": 15,
//     "ratePerNight": 160
//   },
//   {
//     "monthName": "Dec",
//     "year": 2024,
//     "totalNights": 28,
//     "ratePerNight": 210
//   },
//   {
//     "monthName": "Jan",
//     "year": 2025,
//     "totalNights": 20,
//     "ratePerNight": 175
//   },
//   {
//     "monthName": "Feb",
//     "year": 2025,
//     "totalNights": 18,
//     "ratePerNight": 165
//   },
//   {
//     "monthName": "Mar",
//     "year": 2025,
//     "totalNights": 25,
//     "ratePerNight": 155
//   },
//   {
//     "monthName": "Apr",
//     "year": 2025,
//     "totalNights": 22,
//     "ratePerNight": 145
//   },
//   {
//     "monthName": "May",
//     "year": 2025,
//     "totalNights": 30,
//     "ratePerNight": 135
//   },
//   {
//     "monthName": "Jun",
//     "year": 2025,
//     "totalNights": 35,
//     "ratePerNight": 150
//   },
//   {
//     "monthName": "Jul",
//     "year": 2025,
//     "totalNights": 49,
//     "ratePerNight": 180
//   }
// ];


const NightlyRateChart = ({ rateData = [] }: { rateData?: any[] }) => {
// const NightlyRateChart = () => {
  // Convert data to standardized format
  const convertData = (data: any[]): RateDataItem[] => {
    const monthMap: Record<string, number> = {
      "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
      "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
    };
    
    return data.map(item => ({
      month: item.monthName,
      year: item.year,
      rate: item.ratePerNight
    }));
  };

  // Ensure we have 12 months of data
  const ensureFullYearData = (data: RateDataItem[]): RateDataItem[] => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const fullYear: RateDataItem[] = [];
    
    // Create 12 months data (last 12 months)
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const monthIndex = date.getMonth();
      fullYear.push({
        month: months[monthIndex],
        year: date.getFullYear(),
        rate: 0
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

  // Format data for chart display
  const formatData = (data: RateDataItem[]): FormattedData[] => {
    return data.map(item => ({
      monthLabel: `${item.month} '${item.year.toString().slice(2)}`,
      rate: item.rate
    }));
  };

  // Get current and previous month data
  const getCurrentAndPreviousMonth = (data: FormattedData[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const currentMonthLabel = `${months[currentMonth]} '${currentYear.toString().slice(2)}`;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthLabel = `${months[prevMonth]} '${prevYear.toString().slice(2)}`;
    
    const currentMonthData = data.find(item => 
      item.monthLabel === currentMonthLabel
    );
    
    const lastMonthData = data.find(item => 
      item.monthLabel === prevMonthLabel
    );

    return { 
      currentMonthData: currentMonthData || { monthLabel: currentMonthLabel, rate: 0 },
      lastMonthData: lastMonthData || { monthLabel: prevMonthLabel, rate: 0 }
    };
  };

  // Process data
  const convertedData = convertData(rateData);
  const fullYearData = ensureFullYearData(convertedData);
  const formattedData = formatData(fullYearData);
  const { currentMonthData, lastMonthData } = getCurrentAndPreviousMonth(formattedData);

  // Calculate percentage change
  const calculatePercentageChange = (): number => {
    if (!currentMonthData || !lastMonthData || lastMonthData.rate === 0) {
      return 0;
    }
    return ((currentMonthData.rate - lastMonthData.rate) / lastMonthData.rate) * 100;
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

  // Chart data configuration
  const chartData = {
    labels: formattedData.map(item => item.monthLabel),
    datasets: [
      {
        label: 'Nightly Rate',
        data: formattedData.map(item => item.rate),
        borderColor: '#3182CE',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        tension: 0.4,
        pointBackgroundColor: formattedData.map(item => {
          if (item.monthLabel === currentMonthData?.monthLabel) return '#38A169';
          if (item.monthLabel === lastMonthData?.monthLabel) return '#F6E05E';
          return '#3182CE';
        }),
        pointRadius: formattedData.map(item => 
          (item.monthLabel === currentMonthData?.monthLabel || 
           item.monthLabel === lastMonthData?.monthLabel) ? 6 : 4
        ),
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        fill: true,
      }
    ]
  };

  // Chart options
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
            const value = context.raw as number;
            return `Nightly Rate: ${formatCurrency(value)}`;
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
            return formatCurrency(numValue);
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-0">
        <div className='flex justify-between align-middle'>
          <h1 className="text-xl font-bold text-gray-800">Nightly Rate</h1>
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
              {formatCurrency(currentMonthData.rate)}
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
        <Line 
          data={chartData} 
          options={chartOptions}
        />
      </div>
    </div>
  );
};

export default NightlyRateChart;