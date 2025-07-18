export interface Sale {
  id: string;
  date: string;
  item: string;
  quantity: number;
  pricePerItem: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'online';
  createdAt: Date;
}

export interface Order {
  id: number; // bigint in database
  date: string;
  customer_description: string;
  items: {
    item: string;
    quantity: number;
    pricePerItem: number;
    total: number;
  }[];
  order_total: number;
  status: 'PENDING' | 'COMPLETED';
  created_at: Date;
  updated_at?: Date;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  receiptUrl?: string;
  createdAt: Date;
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