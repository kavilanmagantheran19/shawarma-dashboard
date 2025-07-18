import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Package,
  Users,
  Clock,
  Target
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/calculations';

interface MetricsCardsProps {
  metrics?: {
    totalSales: number;
    totalExpenses: number;
    itemsSold: number;
    averageDailySales: number;
    averageOrderValue: number;
    customerSatisfaction: number;
    salesTrend: 'up' | 'down' | 'stable';
    expensesTrend: 'up' | 'down' | 'stable';
  };
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  // Default metrics for demo - removed redundant ones
  const defaultMetrics = {
    totalSales: 12500,
    totalExpenses: 8500,
    itemsSold: 1250,
    averageDailySales: 625,
    averageOrderValue: 10.00,
    customerSatisfaction: 4.8,
    salesTrend: 'up' as const,
    expensesTrend: 'down' as const,
  };

  const data = metrics || defaultMetrics;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Total Sales */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{formatCurrency(data.totalSales)}</div>
          <div className={`flex items-center text-xs ${getTrendColor(data.salesTrend)} mt-1`}>
            {getTrendIcon(data.salesTrend)}
            <span className="ml-1">
              {data.salesTrend === 'up' ? '+12%' : data.salesTrend === 'down' ? '-8%' : '0%'} from last month
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{formatCurrency(data.totalExpenses)}</div>
          <div className={`flex items-center text-xs ${getTrendColor(data.expensesTrend)} mt-1`}>
            {getTrendIcon(data.expensesTrend)}
            <span className="ml-1">
              {data.expensesTrend === 'up' ? '+5%' : data.expensesTrend === 'down' ? '-3%' : '0%'} from last month
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Items Sold */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{data.itemsSold.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total quantity sold
          </p>
        </CardContent>
      </Card>

      {/* Average Daily Sales */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Daily Sales</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{formatCurrency(data.averageDailySales)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Last 7 days average
          </p>
        </CardContent>
      </Card>

      {/* Average Order Value */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{formatCurrency(data.averageOrderValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Per transaction
          </p>
        </CardContent>
      </Card>

      {/* Customer Satisfaction */}
      <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{data.customerSatisfaction}/5.0</div>
          <p className="text-xs text-muted-foreground mt-1">
            Average rating
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsCards; 