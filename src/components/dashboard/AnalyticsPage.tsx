import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DollarSign, TrendingUp, Package, Calendar, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import { useOrders } from '../../hooks/useOrders';
import { useExpenses } from '../../hooks/useExpenses';
import WeeklyRevenueChart from './WeeklyRevenueChart';
import WeeklyExpensesChart from './WeeklyExpensesChart';

const AnalyticsPage: React.FC = () => {
  const { orders } = useOrders();
  const { expenses } = useExpenses();

  // Calculate sales by day
  const getSalesByDay = () => {
    const fridaySales = { total: 0, orders: 0, items: {} as { [key: string]: number } };
    const saturdaySales = { total: 0, orders: 0, items: {} as { [key: string]: number } };
    
    // Get current week range (Monday-Sunday)
    const today = new Date();
    const currentDay = today.getDay();
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday = 0, so Monday = 1
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - daysSinceMonday);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    
    // Filter orders for current week only
    const currentWeekOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= currentWeekStart && orderDate <= currentWeekEnd;
    });
    
    currentWeekOrders.forEach(order => {
      const orderDate = new Date(order.date);
      const dayOfWeek = orderDate.getDay();
      
      if (dayOfWeek === 5) { // Friday
        fridaySales.total += order.order_total;
        fridaySales.orders += 1;
        order.items.forEach(item => {
          fridaySales.items[item.item] = (fridaySales.items[item.item] || 0) + item.quantity;
        });
      } else if (dayOfWeek === 6) { // Saturday
        saturdaySales.total += order.order_total;
        saturdaySales.orders += 1;
        order.items.forEach(item => {
          saturdaySales.items[item.item] = (saturdaySales.items[item.item] || 0) + item.quantity;
        });
      }
    });

    return { fridaySales, saturdaySales };
  };

  const { fridaySales, saturdaySales } = getSalesByDay();
  const totalSales = fridaySales.total + saturdaySales.total;
  const totalOrders = fridaySales.orders + saturdaySales.orders;

  // All-time totals
  const allTimeTotal = orders.reduce((sum, order) => sum + order.order_total, 0);
  const allTimeOrders = orders.length;
  const allTimeItems = orders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">All Time Performance</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Time Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(allTimeTotal)}</div>
              <p className="text-xs text-muted-foreground">{allTimeOrders} total orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Time Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allTimeItems}</div>
              <p className="text-xs text-muted-foreground">Total items sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-muted-foreground">{totalOrders} orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-muted-foreground">100% profit margin</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">This Week Breakdown</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Friday Sales</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(fridaySales.total)}</div>
              <p className="text-xs text-muted-foreground">{fridaySales.orders} orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saturday Sales</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(saturdaySales.total)}</div>
              <p className="text-xs text-muted-foreground">{saturdaySales.orders} orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-muted-foreground">{totalOrders} orders completed</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Sales Charts</h2>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          <WeeklyRevenueChart selectedWeek={new Date().toISOString().split('T')[0]} />
          <WeeklyExpensesChart expenses={expenses} selectedWeek={new Date().toISOString().split('T')[0]} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 