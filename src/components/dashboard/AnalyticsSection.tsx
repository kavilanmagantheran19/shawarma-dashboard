import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AnalyticsSection: React.FC = () => {
  // Sample data for charts
  const salesData = [
    { name: 'Mon', sales: 400 },
    { name: 'Tue', sales: 300 },
    { name: 'Wed', sales: 500 },
    { name: 'Thu', sales: 280 },
    { name: 'Fri', sales: 590 },
    { name: 'Sat', sales: 480 },
    { name: 'Sun', sales: 380 },
  ];

  const popularItems = [
    { name: 'Arabic Shawarma', value: 400 },
    { name: 'Turkish Shawarma', value: 300 },
    { name: 'Arabic Platter', value: 200 },
    { name: 'Turkish Platter', value: 150 },
    { name: 'Fries', value: 100 },
    { name: 'Drink', value: 80 },
  ];

  const expenseBreakdown = [
    { name: 'Ingredients', value: 4000, color: '#8884d8' },
    { name: 'Staff', value: 3000, color: '#82ca9d' },
    { name: 'Utilities', value: 2000, color: '#ffc658' },
    { name: 'Rent', value: 1500, color: '#ff7300' },
    { name: 'Equipment', value: 1000, color: '#00C49F' },
    { name: 'Marketing', value: 500, color: '#FFBB28' },
  ];

  const profitData = [
    { name: 'Week 1', profit: 1200 },
    { name: 'Week 2', profit: 1800 },
    { name: 'Week 3', profit: 1400 },
    { name: 'Week 4', profit: 2200 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Analytics & Reports</h2>
        <p className="text-sm text-muted-foreground">Detailed insights into your business performance</p>
      </div>

      {/* Sales Trends Chart */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Weekly Sales Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`RM${value}`, 'Sales']} />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Popular Items Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Quantity Sold']} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`RM${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Analysis */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Monthly Profit Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`RM${value}`, 'Profit']} />
                <Bar dataKey="profit" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection; 