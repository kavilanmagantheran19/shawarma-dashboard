export interface Sale {
  id: string;
  date: Date;
  item: string;
  quantity: number;
  total: number;
  paymentMethod: string;
  createdAt: Date;
}

export interface Expense {
  id: number;
  category: 'seri_ternak' | 'balaji' | 'wraps' | 'marketing' | 'other' | 'weekly_expense';
  description: string;
  amount: number; // in cents
  created_at: string;
}

export interface Order {
  id: number;
  date: string;
  customer_description: string;
  items: Array<{
    item: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  order_total: number; // in cents
  status: 'PENDING' | 'COMPLETED';
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  defaultPrice: number;
  category: string;
  isActive: boolean;
}

export interface DashboardMetrics {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  itemsSold: number;
  profitMargin: number;
  averageDailySales: number;
  salesTrend: 'up' | 'down' | 'stable';
  expensesTrend: 'up' | 'down' | 'stable';
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
} 