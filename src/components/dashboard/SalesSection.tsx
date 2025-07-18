import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { menuItems } from '../../data/menuItems';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../utils/dateHelpers';
import { useOrders } from '../../hooks/useOrders';

const SalesSection: React.FC = () => {
  const { orders, loading, error, createOrder, updateOrderStatus } = useOrders();
  const [showForm, setShowForm] = useState(false);
  const [orderItems, setOrderItems] = useState<Array<{ item: string; quantity: number; price: number; total: number }>>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerDescription: '',
    selectedItem: '',
    quantity: 1,
  });

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
        pricePerItem: item.price,
        total: item.total,
      })),
      order_total: getOrderTotal(),
      status: 'PENDING' as const,
      created_at: new Date(),
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

  const markOrderAsCompleted = async (orderId: number) => {
    await updateOrderStatus(orderId.toString(), 'COMPLETED');
  };

  const toggleOrderExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId.toString())) {
      newExpanded.delete(orderId.toString());
    } else {
      newExpanded.add(orderId.toString());
    }
    setExpandedOrders(newExpanded);
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
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sale
        </Button>
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
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    quantity: parseInt(e.target.value) || 1 
                  }))}
                />
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
              <Button onClick={handleAddSale} disabled={orderItems.length === 0}>
                Complete Sale
              </Button>
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setOrderItems([]);
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sales History</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                {/* Search icon removed as per new_code */}
                Search
              </Button>
              <Button variant="outline" size="sm">
                {/* Filter icon removed as per new_code */}
                Filter
              </Button>
              <Button variant="outline" size="sm">
                {/* Download icon removed as per new_code */}
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sales recorded yet</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setShowForm(true)}
              >
                Add your first sale
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg">
                  {/* Order Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
                        {order.customer_description && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {order.customer_description}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(order.order_total)}</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                      {order.status === 'PENDING' ? (
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            markOrderAsCompleted(order.id);
                          }}
                        >
                          Finish
                        </Button>
                      ) : (
                        <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                          Completed
                        </div>
                      )}
                      {expandedOrders.has(order.id.toString()) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Order Details */}
                  {expandedOrders.has(order.id.toString()) && (
                    <div className="border-t bg-muted/30">
                      <div className="p-4">
                        <h4 className="font-medium mb-3">Order Items:</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2">
                              <div>
                                <span className="font-medium">{item.item}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  x{item.quantity} @ {formatCurrency(item.pricePerItem)}
                                </span>
                              </div>
                              <span className="font-medium">{formatCurrency(item.total)}</span>
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
  );
};

export default SalesSection; 