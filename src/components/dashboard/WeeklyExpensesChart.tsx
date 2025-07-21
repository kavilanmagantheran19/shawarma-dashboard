import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet } from 'lucide-react';
import { Expense } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface WeeklyExpensesChartProps {
  expenses: Expense[];
  selectedWeek?: string; // Optional: if not provided, use current week
}

const WeeklyExpensesChart: React.FC<WeeklyExpensesChartProps> = ({ expenses, selectedWeek }) => {
  // Use selectedWeek if provided, otherwise use current date
  const weekStartDate = selectedWeek || new Date().toISOString().split('T')[0];

  // Calculate weekly expenses data
  const getWeeklyExpensesData = () => {
    // Use the selected week or current week
    const selectedDate = new Date(weekStartDate);
    const currentDay = selectedDate.getDay();
    
    // Calculate selected week start (Monday)
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday = 0, so Monday = 1
    const selectedWeekStart = new Date(selectedDate);
    selectedWeekStart.setDate(selectedDate.getDate() - daysSinceMonday);
    
    // Calculate selected week end (Sunday)
    const selectedWeekEnd = new Date(selectedWeekStart);
    selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6);
    
    // Calculate previous week
    const previousWeekStart = new Date(selectedWeekStart);
    previousWeekStart.setDate(selectedWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(selectedWeekEnd);
    previousWeekEnd.setDate(selectedWeekEnd.getDate() - 7);
    
    // Filter selected week expenses
    const selectedWeekExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.created_at);
      return expenseDate >= selectedWeekStart && expenseDate <= selectedWeekEnd;
    });
    
    // Filter previous week expenses
    const previousWeekExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.created_at);
      return expenseDate >= previousWeekStart && expenseDate <= previousWeekEnd;
    });
    
    // Calculate totals (convert cents to ringgit)
    const selectedWeekTotal = selectedWeekExpenses.reduce((sum, expense) => sum + expense.amount, 0) / 100;
    const previousWeekTotal = previousWeekExpenses.reduce((sum, expense) => sum + expense.amount, 0) / 100;

    return [
      {
        week: 'This Week',
        expenses: selectedWeekTotal,
      },
      {
        week: 'Last Week',
        expenses: previousWeekTotal,
      }
    ];
  };

  const weeklyExpensesData = getWeeklyExpensesData();
  
  // Debug: Log the data
  console.log('WeeklyExpensesChart - selectedWeek:', weekStartDate);
  console.log('WeeklyExpensesChart - total expenses:', expenses.length);
  console.log('WeeklyExpensesChart - weekly data:', weeklyExpensesData);
  
  // Calculate totals
  const currentWeekTotal = weeklyExpensesData[0].expenses;
  const lastWeekTotal = weeklyExpensesData[1].expenses;
  
  // Calculate percentage change
  const percentageChange = lastWeekTotal > 0 
    ? ((currentWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 
    : 0;

  // Budget context (you can make this configurable)
  const weeklyBudget = 400; // RM 400 weekly budget
  const budgetProgress = (currentWeekTotal / weeklyBudget) * 100;

  // Calculate expense categories breakdown
  const getExpenseCategories = () => {
    // Use the same week filtering as the main calculation
    const selectedDate = new Date(weekStartDate);
    const currentDay = selectedDate.getDay();
    
    // Calculate selected week start (Monday)
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    const selectedWeekStart = new Date(selectedDate);
    selectedWeekStart.setDate(selectedDate.getDate() - daysSinceMonday);
    
    // Calculate selected week end (Sunday)
    const selectedWeekEnd = new Date(selectedWeekStart);
    selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6);

    // Get selected week expenses
    const selectedWeekExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.created_at);
      return expenseDate >= selectedWeekStart && expenseDate <= selectedWeekEnd;
    });

    // Group by category
    const categoryTotals: { [key: string]: number } = {};
    selectedWeekExpenses.forEach(expense => {
      const category = expense.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount / 100;
    });

    return categoryTotals;
  };

  const expenseCategories = getExpenseCategories();

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
          <p className="text-sm text-muted-foreground">
            {payload[0].name}: {formatCurrency(payload[0].value * 100)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'seri_ternak': 'Seri Ternak',
      'balaji': 'Balaji',
      'wraps': 'Wraps',
      'marketing': 'Marketing',
      'other': 'Others'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'seri_ternak': 'bg-purple-500',
      'balaji': 'bg-teal-500',
      'wraps': 'bg-orange-500',
      'marketing': 'bg-blue-500',
      'other': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900">
              <Wallet className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Weekly Expenses</CardTitle>
              <p className="text-sm text-muted-foreground">Track your weekly expenses</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-red-600">
            {formatCurrency(currentWeekTotal * 100)}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              percentageChange >= 0 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}% {percentageChange >= 0 ? 'higher' : 'lower'} than last week
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            From RM {weeklyBudget.toFixed(2)} budget
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-0">
        <div className="space-y-4">
          {/* Budget Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Progress</span>
              <span>{budgetProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className={`h-2 rounded-full ${
                  budgetProgress > 100 ? 'bg-red-500' : 
                  budgetProgress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 border-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={weeklyExpensesData}
                style={{ backgroundColor: 'transparent' }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#374151" 
                  strokeOpacity={0.3}
                />
                <XAxis 
                  dataKey="week" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  domain={[0, 500]}
                  tickFormatter={(value) => `RM ${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="expenses" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Categories */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Expense Categories</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(expenseCategories).map(([category, amount]) => (
                <div key={category} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded ${getCategoryColor(category)}`}></div>
                  <span>{getCategoryLabel(category)}: RM {amount.toFixed(2)}</span>
                </div>
              ))}
              {Object.keys(expenseCategories).length === 0 && (
                <div className="col-span-2 text-center text-muted-foreground">
                  No expenses recorded this week
                </div>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span>Updated at {getCurrentTime()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyExpensesChart; 