import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { Button } from '../ui/button';
import { startOfWeek, endOfWeek, isWithinInterval, format } from 'date-fns';
import { formatCurrency } from '../../utils/calculations';

interface WeeklyRevenueChartProps {
  selectedWeek?: string; // Optional: if not provided, use current week
}

const WeeklyRevenueChart: React.FC<WeeklyRevenueChartProps> = ({ selectedWeek }) => {
  const { orders } = useOrders();
  
  // Date picker state - default to current week
  const [selectedDate, setSelectedDate] = useState(selectedWeek || new Date().toISOString().split('T')[0]);
  
  // Update selectedDate when selectedWeek prop changes
  useEffect(() => {
    if (selectedWeek) {
      setSelectedDate(selectedWeek);
    }
  }, [selectedWeek]);
  
  // Get the start of the week for the selected date
  const getWeekStart = (dateString: string) => {
    const date = new Date(dateString);
    return startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
  };
  
  // Get the end of the week for the selected date
  const getWeekEnd = (dateString: string) => {
    const date = new Date(dateString);
    return endOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
  };
  
  // Navigation functions
  const goToPreviousWeek = () => {
    const currentDate = new Date(selectedDate);
    const previousWeek = new Date(currentDate);
    previousWeek.setDate(currentDate.getDate() - 7);
    setSelectedDate(previousWeek.toISOString().split('T')[0]);
  };
  
  const goToNextWeek = () => {
    const currentDate = new Date(selectedDate);
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    setSelectedDate(nextWeek.toISOString().split('T')[0]);
  };
  
  const goToCurrentWeek = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Calculate weekly data
  const getWeeklyData = () => {
    // Get the selected week range
    const weekStart = getWeekStart(selectedDate);
    const weekEnd = getWeekEnd(selectedDate);
    
    // Get previous week range
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(weekStart.getDate() - 7);
    const previousWeekEnd = new Date(weekEnd);
    previousWeekEnd.setDate(weekEnd.getDate() - 7);
    
    // Filter orders for the selected week (Friday and Saturday only)
    const selectedWeekOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      const dayOfWeek = orderDate.getDay();
      
      // Only include Friday (5) and Saturday (6) orders
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        return false;
      }
      
      // Check if the order date falls within the selected week
      return isWithinInterval(orderDate, { start: weekStart, end: weekEnd });
    });
    
    // Filter orders for the previous week (Friday and Saturday only)
    const previousWeekOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      const dayOfWeek = orderDate.getDay();
      
      // Only include Friday (5) and Saturday (6) orders
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        return false;
      }
      
      // Check if the order date falls within the previous week
      return isWithinInterval(orderDate, { start: previousWeekStart, end: previousWeekEnd });
    });

    // Calculate totals for each day
    const fridayThisWeek = selectedWeekOrders
      .filter(order => new Date(order.date).getDay() === 5)
      .reduce((sum, order) => sum + order.order_total, 0) / 100;
      
    const saturdayThisWeek = selectedWeekOrders
      .filter(order => new Date(order.date).getDay() === 6)
      .reduce((sum, order) => sum + order.order_total, 0) / 100;
      
    const fridayLastWeek = previousWeekOrders
      .filter(order => new Date(order.date).getDay() === 5)
      .reduce((sum, order) => sum + order.order_total, 0) / 100;
      
    const saturdayLastWeek = previousWeekOrders
      .filter(order => new Date(order.date).getDay() === 6)
      .reduce((sum, order) => sum + order.order_total, 0) / 100;

    return [
      { day: 'Friday', 'This Week': fridayThisWeek, 'Last Week': fridayLastWeek },
      { day: 'Saturday', 'This Week': saturdayThisWeek, 'Last Week': saturdayLastWeek }
    ];
  };

  const weeklyData = getWeeklyData();
  
  // Calculate totals
  const currentWeekTotal = weeklyData.reduce((sum, day) => sum + day['This Week'], 0);
  const lastWeekTotal = weeklyData.reduce((sum, day) => sum + day['Last Week'], 0);
  
  // Debug log
  console.log('Weekly Data:', weeklyData);
  console.log('Current Week Total calculated:', currentWeekTotal);
  
  // Calculate percentage change
  const percentageChange = lastWeekTotal > 0 
    ? ((currentWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 
    : 0;

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Custom tooltip component for dark theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name}: {formatCurrency(entry.value * 100)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
              <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Weekly Sales</CardTitle>
              <p className="text-sm text-muted-foreground">Track your weekly revenue</p>
            </div>
          </div>
          
          {/* Week Selector */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium min-w-[100px] text-center">
              {format(getWeekStart(selectedDate), 'MMM dd')}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentWeek}
              className="px-2"
            >
              Today
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-green-600">
            RM {currentWeekTotal.toFixed(2)}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              percentageChange >= 0 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(0)}% {percentageChange >= 0 ? 'higher' : 'lower'} than last week
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-0">
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-green-500"></div>
              <span className="text-sm text-muted-foreground">This Week</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span className="text-sm text-muted-foreground">Last Week</span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 border-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={weeklyData}
                style={{ backgroundColor: 'transparent' }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#374151" 
                  strokeOpacity={0.3}
                />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  domain={[0, 500]}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="This Week" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#10b981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Last Week" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Updated at {getCurrentTime()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyRevenueChart; 