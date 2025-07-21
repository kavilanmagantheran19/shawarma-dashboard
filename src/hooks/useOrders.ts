import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import { database } from '../lib/database';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load orders from database
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await database.getAllOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new order
  const createOrder = useCallback(async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newOrder = await database.createOrder(orderData);
      if (newOrder) {
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
      } else {
        setError('Failed to create order');
        return null;
      }
    } catch (err) {
      setError('Failed to create order');
      console.error('Error creating order:', err);
      return null;
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: 'PENDING' | 'COMPLETED') => {
    try {
      setError(null);
      const success = await database.updateOrderStatus(orderId, status);
      if (success) {
        setOrders(prev => 
          prev.map(order => 
            order.id.toString() === orderId 
              ? { ...order, status }
              : order
          )
        );
        return true;
      } else {
        setError('Failed to update order status');
        return false;
      }
    } catch (err) {
      setError('Failed to update order status');
      console.error('Error updating order status:', err);
      return false;
    }
  }, []);

  // Complete order
  const completeOrder = useCallback(async (orderId: string) => {
    return updateOrderStatus(orderId, 'COMPLETED');
  }, [updateOrderStatus]);

  // Reset order to pending
  const resetOrderToPending = useCallback(async (orderId: string) => {
    return updateOrderStatus(orderId, 'PENDING');
  }, [updateOrderStatus]);

  // Delete order
  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      setError(null);
      const success = await database.deleteOrder(orderId);
      if (success) {
        setOrders(prev => prev.filter(order => order.id.toString() !== orderId));
        return true;
      } else {
        setError('Failed to delete order');
        return false;
      }
    } catch (err) {
      setError('Failed to delete order');
      console.error('Error deleting order:', err);
      return false;
    }
  }, []);

  // Update order details
  const updateOrder = useCallback(async (orderId: string, updates: Partial<Order>) => {
    try {
      setError(null);
      const success = await database.updateOrder(orderId, updates);
      if (success) {
        setOrders(prev => 
          prev.map(order => 
            order.id.toString() === orderId 
              ? { ...order, ...updates }
              : order
          )
        );
        return true;
      } else {
        setError('Failed to update order');
        return false;
      }
    } catch (err) {
      setError('Failed to update order');
      console.error('Error updating order:', err);
      return false;
    }
  }, []);

  // Get orders by date range
  const getOrdersByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setError(null);
      const data = await database.getOrdersByDateRange(startDate, endDate);
      return data;
    } catch (err) {
      setError('Failed to fetch orders by date range');
      console.error('Error fetching orders by date range:', err);
      return [];
    }
  }, []);

  // Get orders by customer
  const getOrdersByCustomer = useCallback(async (customerDescription: string) => {
    try {
      setError(null);
      const data = await database.getOrdersByCustomer(customerDescription);
      return data;
    } catch (err) {
      setError('Failed to fetch orders by customer');
      console.error('Error fetching orders by customer:', err);
      return [];
    }
  }, []);

  // Get total sales
  const getTotalSales = useCallback(async () => {
    try {
      setError(null);
      const total = await database.getTotalSales();
      return total;
    } catch (err) {
      setError('Failed to fetch total sales');
      console.error('Error fetching total sales:', err);
      return 0;
    }
  }, []);

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    completeOrder,
    resetOrderToPending,
    deleteOrder,
    updateOrder,
    loadOrders,
    getOrdersByDateRange,
    getOrdersByCustomer,
    getTotalSales,
  };
}; 