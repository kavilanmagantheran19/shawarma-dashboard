import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { DollarSign, TrendingUp, Package, Receipt, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../utils/dateHelpers';
import { useOrders } from '../../hooks/useOrders';
import { startOfWeek, format, addWeeks, subWeeks } from 'date-fns';

const MetricsCards: React.FC = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Weekly navigation functions
  const goToPreviousWeek = () => {
    setSelectedWeek(prev => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setSelectedWeek(prev => addWeeks(prev, 1));
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  // Get week start date
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Monday

  // Calculate selected week sales (Friday and Saturday of selected week)
  const getCurrentWeekSales = () => {
    const weekStartDate = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Monday
    
    // Get Friday and Saturday dates for the selected week
    const fridayDate = new Date(weekStartDate);
    fridayDate.setDate(weekStartDate.getDate() + 4); // Friday is 4 days after Monday
    
    const saturdayDate = new Date(weekStartDate);
    saturdayDate.setDate(weekStartDate.getDate() + 5); // Saturday is 5 days after Monday
    
    const selectedWeekOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.toDateString() === fridayDate.toDateString() || 
             orderDate.toDateString() === saturdayDate.toDateString();
    });

    const selectedWeekTotal = selectedWeekOrders.reduce((sum, order) => sum + order.order_total, 0);
    const selectedWeekItems = selectedWeekOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    return {
      total: selectedWeekTotal,
      orders: selectedWeekOrders.length,
      items: selectedWeekItems,
      itemBreakdown: selectedWeekOrders.reduce((breakdown, order) => {
        order.items.forEach(item => {
          breakdown[item.item] = (breakdown[item.item] || 0) + item.quantity;
        });
        return breakdown;
      }, {} as { [key: string]: number })
    };
  };

  // All-time totals (all orders ever)
  const allTimeTotal = orders.reduce((sum, order) => sum + order.order_total, 0);
  const allTimeOrders = orders.length;
  const allTimeItems = orders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  // Calculate total expenses (placeholder - you can add expenses later)
  const totalExpenses = 0;
  const netProfit = allTimeTotal - totalExpenses;
  const profitMargin = allTimeTotal > 0 ? (netProfit / allTimeTotal) * 100 : 0;

  const currentWeekSales = getCurrentWeekSales();

  // Group orders by day (Friday/Saturday) for selected week
  const groupOrdersByDay = () => {
    const weekStartDate = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Monday
    
    // Get Friday and Saturday dates for the selected week
    const fridayDate = new Date(weekStartDate);
    fridayDate.setDate(weekStartDate.getDate() + 4); // Friday is 4 days after Monday
    
    const saturdayDate = new Date(weekStartDate);
    saturdayDate.setDate(weekStartDate.getDate() + 5); // Saturday is 5 days after Monday
    
    const groupedOrders: { [key: string]: any[] } = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.date);
      const dayOfWeek = orderDate.getDay();
      
      // Only group Friday (5) and Saturday (6) orders for the selected week
      if ((dayOfWeek === 5 || dayOfWeek === 6) && 
          (orderDate.toDateString() === fridayDate.toDateString() || 
           orderDate.toDateString() === saturdayDate.toDateString())) {
        const dayKey = dayOfWeek === 5 ? 'Friday' : 'Saturday';
        const dateKey = order.date;
        const fullKey = `${dayKey} - ${dateKey}`;
        
        if (!groupedOrders[fullKey]) {
          groupedOrders[fullKey] = [];
        }
        groupedOrders[fullKey].push(order);
      }
    });

    // Convert to array and sort by date (newest first)
    return Object.entries(groupedOrders)
      .map(([dayKey, dayOrders]) => ({
        dayKey,
        date: dayOrders[0].date,
        dayOfWeek: new Date(dayOrders[0].date).getDay(),
        orders: dayOrders,
        totalSales: dayOrders.reduce((sum, order) => sum + order.order_total, 0),
        totalOrders: dayOrders.length,
        totalItems: dayOrders.reduce((sum, order) => 
          sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
        ),
        status: dayOrders.every(order => order.status === 'COMPLETED') ? 'COMPLETED' : 'PENDING'
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const groupedSales = groupOrdersByDay();

  const markOrderAsCompleted = async (orderId: number) => {
    await updateOrderStatus(orderId.toString(), 'COMPLETED');
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* All Time Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Time Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(allTimeTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {allTimeOrders} total orders
            </p>
          </CardContent>
        </Card>

        {/* All Time Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Time Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTimeItems}</div>
            <p className="text-xs text-muted-foreground">
              Total items sold
            </p>
          </CardContent>
        </Card>

        {/* This Week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentWeekSales.total)}</div>
            <p className="text-xs text-muted-foreground">
              {currentWeekSales.orders} orders • {currentWeekSales.items} items
            </p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netProfit)}</div>
            <p className="text-xs text-muted-foreground">
              {profitMargin.toFixed(1)}% profit margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Week Item Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-4">This Week Item Breakdown</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Sold This Week</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {currentWeekSales.items > 0 ? (
                <>
                  <div className="text-2xl font-bold">{currentWeekSales.items}</div>
                  <p className="text-xs text-muted-foreground">
                    {Object.keys(currentWeekSales.itemBreakdown).length} different items
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No items sold this week</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Item This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {Object.keys(currentWeekSales.itemBreakdown).length > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    {Object.entries(currentWeekSales.itemBreakdown)
                      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Object.entries(currentWeekSales.itemBreakdown)
                      .sort(([,a], [,b]) => b - a)[0]?.[1] || 0} units sold
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">No sales</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm font-medium">Item Breakdown</CardTitle>
                
                {/* Week Selector */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousWeek}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <div className="text-xs font-medium min-w-[60px] text-center">
                    {format(weekStart, 'MMM dd')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextWeek}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToCurrentWeek}
                    className="px-2 text-xs"
                  >
                    Today
                  </Button>
                </div>
              </div>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(currentWeekSales.itemBreakdown).map(([itemName, count]) => (
                  <div key={itemName} className="flex justify-between items-center text-sm">
                    <span className="truncate">{itemName}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
                {Object.keys(currentWeekSales.itemBreakdown).length === 0 && (
                  <p className="text-xs text-muted-foreground">No items sold this week</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sales History */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sales History</h3>
        <Card>
          <CardContent className="p-0">
            {groupedSales.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No sales recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {groupedSales.map((dayGroup) => (
                  <div key={dayGroup.dayKey} className="border rounded-lg">
                    {/* Day Group Header */}
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleOrderExpansion(dayGroup.dayKey)}
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-lg">{dayGroup.dayKey}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(dayGroup.date)}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {dayGroup.totalOrders} order{dayGroup.totalOrders !== 1 ? 's' : ''} • {dayGroup.totalItems} items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(dayGroup.totalSales)}</p>
                          <p className="text-sm text-muted-foreground">Total Sales</p>
                        </div>
                        {dayGroup.status === 'PENDING' ? (
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Complete all pending orders for this day
                                dayGroup.orders
                                  .filter(order => order.status === 'PENDING')
                                  .forEach(order => markOrderAsCompleted(order.id));
                              }}
                            >
                              Complete Day
                            </Button>
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                            Day Completed
                          </div>
                        )}
                        {expandedOrders.has(dayGroup.dayKey) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>

                    {/* Day Group Details */}
                    {expandedOrders.has(dayGroup.dayKey) && (
                      <div className="border-t bg-muted/30">
                        <div className="p-4">
                          <h4 className="font-medium mb-3">Orders for {dayGroup.dayKey}:</h4>
                          <div className="space-y-3">
                            {dayGroup.orders.map((order) => (
                              <div key={order.id} className="border rounded-lg p-3 bg-background">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="font-medium">Order #{order.id}</p>
                                    {order.customer_description && (
                                      <p className="text-sm text-blue-600 dark:text-blue-400">
                                        {order.customer_description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{formatCurrency(order.order_total)}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {order.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  {order.items.map((item: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                      <span>{item.item} x{item.quantity}</span>
                                      <span>{formatCurrency(item.total)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricsCards; 