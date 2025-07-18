import { Sale, Expense, DashboardMetrics, ChartData } from '../types';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export const calculateTotalSales = (sales: Sale[], dateRange?: { from: Date; to: Date }): number => {
  if (dateRange) {
    return sales
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return isWithinInterval(saleDate, { start: dateRange.from, end: dateRange.to });
      })
      .reduce((sum, sale) => sum + sale.total, 0);
  }
  return sales.reduce((sum, sale) => sum + sale.total, 0);
};

export const calculateTotalExpenses = (expenses: Expense[], dateRange?: { from: Date; to: Date }): number => {
  if (dateRange) {
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return isWithinInterval(expenseDate, { start: dateRange.from, end: dateRange.to });
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateNetProfit = (sales: Sale[], expenses: Expense[], dateRange?: { from: Date; to: Date }): number => {
  const totalSales = calculateTotalSales(sales, dateRange);
  const totalExpenses = calculateTotalExpenses(expenses, dateRange);
  return totalSales - totalExpenses;
};

export const calculateItemsSold = (sales: Sale[], dateRange?: { from: Date; to: Date }): number => {
  if (dateRange) {
    return sales
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return isWithinInterval(saleDate, { start: dateRange.from, end: dateRange.to });
      })
      .reduce((sum, sale) => sum + sale.quantity, 0);
  }
  return sales.reduce((sum, sale) => sum + sale.quantity, 0);
};

export const calculateProfitMargin = (sales: Sale[], expenses: Expense[], dateRange?: { from: Date; to: Date }): number => {
  const totalSales = calculateTotalSales(sales, dateRange);
  if (totalSales === 0) return 0;
  const netProfit = calculateNetProfit(sales, expenses, dateRange);
  return (netProfit / totalSales) * 100;
};

export const calculateAverageDailySales = (sales: Sale[], days: number = 7): number => {
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  const recentSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return isWithinInterval(saleDate, { start: startDate, end: endDate });
  });
  
  const totalSales = recentSales.reduce((sum, sale) => sum + sale.total, 0);
  return totalSales / days;
};

export const getSalesTrend = (sales: Sale[]): 'up' | 'down' | 'stable' => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const twoDaysAgo = subDays(today, 2);
  
  const todaySales = calculateTotalSales(sales, { from: startOfDay(today), to: endOfDay(today) });
  const yesterdaySales = calculateTotalSales(sales, { from: startOfDay(yesterday), to: endOfDay(yesterday) });
  
  if (todaySales > yesterdaySales) return 'up';
  if (todaySales < yesterdaySales) return 'down';
  return 'stable';
};

export const getExpensesTrend = (expenses: Expense[]): 'up' | 'down' | 'stable' => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  
  const todayExpenses = calculateTotalExpenses(expenses, { from: startOfDay(today), to: endOfDay(today) });
  const yesterdayExpenses = calculateTotalExpenses(expenses, { from: startOfDay(yesterday), to: endOfDay(yesterday) });
  
  if (todayExpenses > yesterdayExpenses) return 'up';
  if (todayExpenses < yesterdayExpenses) return 'down';
  return 'stable';
};

export const calculateDashboardMetrics = (sales: Sale[], expenses: Expense[]): DashboardMetrics => {
  const totalSales = calculateTotalSales(sales);
  const totalExpenses = calculateTotalExpenses(expenses);
  const netProfit = calculateNetProfit(sales, expenses);
  const itemsSold = calculateItemsSold(sales);
  const profitMargin = calculateProfitMargin(sales, expenses);
  const averageDailySales = calculateAverageDailySales(sales);
  const salesTrend = getSalesTrend(sales);
  const expensesTrend = getExpensesTrend(expenses);

  return {
    totalSales,
    totalExpenses,
    netProfit,
    itemsSold,
    profitMargin,
    averageDailySales,
    salesTrend,
    expensesTrend,
  };
};

export const getPopularItems = (sales: Sale[], limit: number = 5): ChartData[] => {
  const itemCounts = sales.reduce((acc, sale) => {
    acc[sale.item] = (acc[sale.item] || 0) + sale.quantity;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(itemCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

export const getExpenseBreakdown = (expenses: Expense[]): ChartData[] => {
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const formatCurrency = (amount: number): string => {
  // Convert cents to ringgit (divide by 100)
  const ringgitAmount = amount / 100;
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(ringgitAmount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
}; 