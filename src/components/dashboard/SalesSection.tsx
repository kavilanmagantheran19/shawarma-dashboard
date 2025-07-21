import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { menuItems } from '../../data/menuItems';
import { formatCurrency } from '../../utils/calculations';
import { useOrders } from '../../hooks/useOrders';
import { startOfWeek, format, addWeeks, subWeeks } from 'date-fns';

const SalesSection: React.FC = () => {
  const { orders, loading, error, createOrder, updateOrderStatus, updateOrder } = useOrders();
  const [showForm, setShowForm] = useState(false);
  const [orderItems, setOrderItems] = useState<Array<{ item: string; quantity: number; price: number; total: number }>>([]);
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerDescription: '',
    selectedItem: '',
    quantity: 1,
  });

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

  // Get week start and end dates
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Monday

  // Get Friday and Saturday dates for the selected week
  const getFridayDate = () => {
    const friday = new Date(weekStart);
    friday.setDate(weekStart.getDate() + 4); // Friday is 4 days after Monday
    return friday;
  };

  const getSaturdayDate = () => {
    const saturday = new Date(weekStart);
    saturday.setDate(weekStart.getDate() + 5); // Saturday is 5 days after Monday
    return saturday;
  };

  // Get sales for Friday and Saturday of the selected week
  const getWeeklySales = () => {
    const fridayDate = getFridayDate();
    const saturdayDate = getSaturdayDate();
    
    const fridaySales = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.toDateString() === fridayDate.toDateString();
    });

    const saturdaySales = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.toDateString() === saturdayDate.toDateString();
    });

    return {
      friday: {
        date: fridayDate,
        sales: fridaySales,
        total: fridaySales.reduce((sum, order) => sum + order.order_total, 0),
        orderCount: fridaySales.length,
        itemCount: fridaySales.reduce((sum, order) => sum + order.items.length, 0)
      },
      saturday: {
        date: saturdayDate,
        sales: saturdaySales,
        total: saturdaySales.reduce((sum, order) => sum + order.order_total, 0),
        orderCount: saturdaySales.length,
        itemCount: saturdaySales.reduce((sum, order) => sum + order.items.length, 0)
      }
    };
  };

  const addItemToOrder = () => {
    if (!formData.selectedItem) return;

    const selectedMenuItem = menuItems.find((item: { name: string }) => item.name === formData.selectedItem);
    if (!selectedMenuItem) return;

    const newItem = {
      item: formData.selectedItem,
      quantity: formData.quantity,
      price: selectedMenuItem.defaultPrice,
      total: selectedMenuItem.defaultPrice * formData.quantity,
    };

    setOrderItems([...orderItems, newItem]);
    setFormData(prev => ({ ...prev, selectedItem: '', quantity: 1 }));
  };

  const removeItemFromOrder = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const getOrderTotal = () => {
    return orderItems.reduce((total, item) => total + item.total, 0);
  };

  const handleAddSale = async () => {
    if (orderItems.length === 0) return;

    const newOrderData = {
      date: formData.date,
      customer_description: formData.customerDescription,
      items: orderItems.map(item => ({
        item: item.item,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      order_total: getOrderTotal(),
      status: 'PENDING' as const,
    };

    console.log('Creating order with data:', newOrderData);

    try {
      const result = await createOrder(newOrderData);
      if (result) {
        // Reset form
        setOrderItems([]);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          customerDescription: '',
          selectedItem: '',
          quantity: 1,
        });
        setShowForm(false);
      } else {
        console.error('Failed to create order - no result returned');
      }
    } catch (error) {
      console.error('Error in handleAddSale:', error);
    }
  };

  const handleUpdateOrder = async () => {
    if (orderItems.length === 0 || !editingOrder) return;

    const updatedOrderData = {
      items: orderItems.map(item => ({
        item: item.item,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      order_total: getOrderTotal(),
    };

    try {
      // Update the order in the database
      const success = await updateOrder(editingOrder.toString(), updatedOrderData);
      if (success) {
        // Reset form
        setOrderItems([]);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          customerDescription: '',
          selectedItem: '',
          quantity: 1,
        });
        setShowForm(false);
        setEditingOrder(null);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleEndOfDay = async () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
    
    // Check if it's Friday (5) or Saturday (6)
    if (currentDay !== 5 && currentDay !== 6) {
      alert('Shop is only open on Friday and Saturday!');
      return;
    }

    // Get today's date in YYYY-MM-DD format
    const todayString = today.toISOString().split('T')[0];
    
    // Find all pending orders for today
    const todaysPendingOrders = orders.filter(order => 
      order.status === 'PENDING' && 
      order.date === todayString
    );

    if (todaysPendingOrders.length === 0) {
      alert('No pending orders for today!');
      return;
    }

    // Confirm with user
    const confirmMessage = `Complete all ${todaysPendingOrders.length} pending orders for ${todayString}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Complete all pending orders for today
    try {
      for (const order of todaysPendingOrders) {
        await updateOrderStatus(order.id.toString(), 'COMPLETED');
      }
      alert(`Successfully completed ${todaysPendingOrders.length} orders for ${todayString}!`);
    } catch (error) {
      console.error('Error completing orders:', error);
      alert('Error completing orders. Please try again.');
    }
  };

  const getCurrentDayName = () => {
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[today.getDay()];
  };

  const isShopOpen = () => {
    const today = new Date();
    const currentDay = today.getDay();
    return currentDay === 5 || currentDay === 6; // Friday or Saturday
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sales</h2>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sale
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading orders...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sales</h2>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sale
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sales Management</h2>
          <p className="text-muted-foreground">Track and manage your sales</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isShopOpen() 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {isShopOpen() ? '🟢 Shop Open' : '🔴 Shop Closed'}
            </span>
            <span className="text-xs text-muted-foreground">
              Today: {getCurrentDayName()}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          {isShopOpen() && (
            <Button 
              variant="outline" 
              onClick={handleEndOfDay}
              className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/30"
            >
              End of Day
            </Button>
          )}
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sale
          </Button>
        </div>
      </div>

      {/* Add Sale Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Sale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Customer Description</label>
                <Input
                  value={formData.customerDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerDescription: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Item</label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, selectedItem: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuItems.map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name} - {formatCurrency(item.defaultPrice)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      quantity: Math.max(1, prev.quantity - 1) 
                    }))}
                    className="w-10 h-10"
                  >
                    -
                  </Button>
                  <div className="flex items-center justify-center w-16 h-10 border rounded-md bg-background">
                    <span className="text-sm font-medium">{formData.quantity}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      quantity: prev.quantity + 1 
                    }))}
                    className="w-10 h-10"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={addItemToOrder} disabled={!formData.selectedItem}>
                Add Item to Order
              </Button>
            </div>

            {/* Order Items List */}
            {orderItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Order Items:</h3>
                <div className="space-y-2">
                  {orderItems.map((item: { item: string; quantity: number; price: number; total: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{item.item}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          x{item.quantity} @ {formatCurrency(item.price)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{formatCurrency(item.total)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemFromOrder(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-bold text-lg">Order Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(getOrderTotal())}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button onClick={editingOrder ? handleUpdateOrder : handleAddSale} disabled={orderItems.length === 0}>
                {editingOrder ? 'Update Order' : 'Complete Sale'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setOrderItems([]);
                setEditingOrder(null);
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  customerDescription: '',
                  selectedItem: '',
                  quantity: 1,
                });
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="border-0">
          <div className="flex items-center justify-between">
            <CardTitle>Sales History</CardTitle>
            
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
                {format(weekStart, 'MMM dd')}
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
        </CardHeader>
        <CardContent className="border-0">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading sales...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error: {error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const weeklySales = getWeeklySales();
                const hasSales = weeklySales.friday.sales.length > 0 || weeklySales.saturday.sales.length > 0;
                
                if (!hasSales) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No sales recorded for Friday and Saturday of this week
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Friday Sales */}
                    {weeklySales.friday.sales.length > 0 && (
                      <div className="border border-border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {format(weeklySales.friday.date, 'EEEE - yyyy-MM-dd')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(weeklySales.friday.date, 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              {weeklySales.friday.orderCount} orders • {weeklySales.friday.itemCount} items
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {formatCurrency(weeklySales.friday.total)}
                            </p>
                            <p className="text-sm text-muted-foreground">Total Sales</p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="mt-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/30"
                            >
                              Day Completed
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Saturday Sales */}
                    {weeklySales.saturday.sales.length > 0 && (
                      <div className="border border-border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {format(weeklySales.saturday.date, 'EEEE - yyyy-MM-dd')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(weeklySales.saturday.date, 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              {weeklySales.saturday.orderCount} orders • {weeklySales.saturday.itemCount} items
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {formatCurrency(weeklySales.saturday.total)}
                            </p>
                            <p className="text-sm text-muted-foreground">Total Sales</p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="mt-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/30"
                            >
                              Day Completed
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesSection; 