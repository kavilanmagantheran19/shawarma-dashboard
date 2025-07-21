import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import { Expense } from '../../types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface ExpensesPieChartProps {
  expenses: Expense[];
  onWeekChange?: (weekStart: Date) => void;
}

const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({ expenses, onWeekChange }) => {
  // Date picker state - default to current week
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
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
  
  // Filter expenses for the selected week
  const getFilteredExpenses = () => {
    const weekStart = getWeekStart(selectedDate);
    const weekEnd = getWeekEnd(selectedDate);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.created_at);
      return isWithinInterval(expenseDate, { start: weekStart, end: weekEnd });
    });
  };
  
  const filteredExpenses = getFilteredExpenses();
  const weekStart = getWeekStart(selectedDate);
  const weekEnd = getWeekEnd(selectedDate);
  
  // Notify parent component when week changes
  useEffect(() => {
    if (onWeekChange) {
      onWeekChange(weekStart);
    }
  }, [weekStart, onWeekChange]);

  // Debug: Log when expenses change
  useEffect(() => {
    console.log('Expenses changed in pie chart, count:', expenses.length);
  }, [expenses]);

  // Force re-calculation when expenses change
  const [forceUpdate, setForceUpdate] = useState(0);
  
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [expenses]);

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

  const expenseCategories = [
    { key: 'seri_ternak', label: 'Seri Ternak', color: '#8b5cf6' },
    { key: 'balaji', label: 'Balaji', color: '#14b8a6' },
    { key: 'wraps', label: 'Wraps', color: '#f97316' },
    { key: 'marketing', label: 'Marketing', color: '#3b82f6' },
    { key: 'other', label: 'Other', color: '#6b7280' },
  ];

  // Calculate data for pie chart
  const getPieChartData = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    // Initialize all categories with 0
    expenseCategories.forEach(category => {
      categoryTotals[category.key] = 0;
    });

    // Sum up expenses by category
    filteredExpenses.forEach(expense => {
      if (expense.category === 'weekly_expense') {
        // Parse weekly expense description to extract individual category amounts
        const description = expense.description || '';
        
        // Updated regex to handle category names with spaces
        const categoryMatches = description.match(/([^:]+): RM(\d+(?:\.\d+)?)/g);
        
        if (categoryMatches) {
          categoryMatches.forEach(match => {
            const [categoryName, amountStr] = match.split(': RM');
            const amount = parseFloat(amountStr) * 100; // Convert to cents
            // Clean up category name by removing commas and extra whitespace
            const cleanCategoryName = categoryName.replace(/^[,\s]+/, '').trim();
            
            // Map category names to keys (trim whitespace)
            const categoryKey = expenseCategories.find(cat => 
              cat.label.toLowerCase() === cleanCategoryName.toLowerCase()
            )?.key;
            
            if (categoryKey) {
              categoryTotals[categoryKey] = (categoryTotals[categoryKey] || 0) + amount;
            }
          });
        }
      } else {
        // Handle individual category expenses
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      }
    });

    // Convert to pie chart format
    const pieData = expenseCategories.map(category => ({
      name: category.label,
      value: categoryTotals[category.key] / 100, // Convert cents to ringgit
      color: category.color,
    })).filter(item => item.value > 0); // Only show categories with expenses

    return pieData;
  };

  const pieChartData = getPieChartData();
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / (totalExpenses / 100)) * 100).toFixed(1);
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value * 100)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card key={forceUpdate}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl font-bold">Expenses Breakdown</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
              className="px-2"
            >
              ←
            </Button>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
              className="px-2"
            >
              →
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
        <div className="text-3xl font-bold text-red-600">
          {formatCurrency(totalExpenses)}
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredExpenses.length} expenses recorded for the week of {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd')}
        </p>
      </CardHeader>
      <CardContent>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No expenses recorded for this week</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-64">
              {pieChartData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No category data to display</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key={filteredExpenses.length}>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {expenseCategories.map((category) => {
                let categoryTotal = 0;
                
                // Calculate total for this category
                filteredExpenses.forEach(expense => {
                  if (expense.category === 'weekly_expense') {
                    // Parse weekly expense description
                    const description = expense.description || '';
                    // Updated regex to handle category names with spaces
                    const categoryMatches = description.match(/([^:]+): RM(\d+(?:\.\d+)?)/g);
                    
                    if (categoryMatches) {
                      categoryMatches.forEach(match => {
                        const [categoryName, amountStr] = match.split(': RM');
                        // Clean up category name by removing commas and extra whitespace
                        const cleanCategoryName = categoryName.replace(/^[,\s]+/, '').trim();
                        if (category.label.toLowerCase() === cleanCategoryName.toLowerCase()) {
                          categoryTotal += parseFloat(amountStr) * 100; // Convert to cents
                        }
                      });
                    }
                  } else if (expense.category === category.key) {
                    categoryTotal += expense.amount;
                  }
                });
                
                if (categoryTotal === 0) return null;

                const percentage = ((categoryTotal / totalExpenses) * 100).toFixed(1);
                
                return (
                  <div key={category.key} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="font-medium">{category.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(categoryTotal)}</div>
                      <div className="text-muted-foreground">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesPieChart; 