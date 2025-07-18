import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order } from '../types';

class Database {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
    
    console.log('Database: Initializing with URL:', supabaseUrl ? 'Set' : 'Not set');
    console.log('Database: Initializing with Key:', supabaseKey ? 'Set' : 'Not set');
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Create a new order
  async insertOrder(orderData: Omit<Order, 'id'>): Promise<Order | null> {
    try {
      console.log('Database: Attempting to insert order:', orderData);
      
      const { data, error } = await this.supabase
        .from('shawarma_sales')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Database: Error inserting order:', error);
        return null;
      }

      console.log('Database: Successfully inserted order:', data);
      return data;
    } catch (error) {
      console.error('Database: Exception inserting order:', error);
      return null;
    }
  }

  // Get all orders
  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  // Get pending orders
  async getPendingOrders(): Promise<Order[]> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_sales')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      return [];
    }
  }

  // Get completed orders
  async getCompletedOrders(): Promise<Order[]> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_sales')
        .select('*')
        .eq('status', 'COMPLETED')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      return [];
    }
  }

  // Get orders by date range
  async getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_sales')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders by date range:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching orders by date range:', error);
      return [];
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: 'PENDING' | 'COMPLETED'): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('shawarma_sales')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  // Complete an order
  async completeOrder(orderId: string): Promise<boolean> {
    return this.updateOrderStatus(orderId, 'COMPLETED');
  }

  // Reset order to pending
  async resetOrderToPending(orderId: string): Promise<boolean> {
    return this.updateOrderStatus(orderId, 'PENDING');
  }

  // Update order details
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('shawarma_sales')
        .update(updates)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      return false;
    }
  }

  // Delete an order
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('shawarma_sales')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Error deleting order:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_sales')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      return null;
    }
  }

  // Get orders by customer description
  async getOrdersByCustomer(customerDescription: string): Promise<Order[]> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_sales')
        .select('*')
        .ilike('customer_description', `%${customerDescription}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders by customer:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching orders by customer:', error);
      return [];
    }
  }

  // Get total sales amount
  async getTotalSales(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_sales')
        .select('order_total');

      if (error) {
        console.error('Error fetching total sales:', error);
        return 0;
      }

      return data?.reduce((sum, order) => sum + order.order_total, 0) || 0;
    } catch (error) {
      console.error('Error fetching total sales:', error);
      return 0;
    }
  }

  // Get total sales by date range
  async getTotalSalesByDateRange(startDate: string, endDate: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_sales')
        .select('order_total')
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        console.error('Error fetching total sales by date range:', error);
        return 0;
      }

      return data?.reduce((sum, order) => sum + order.order_total, 0) || 0;
    } catch (error) {
      console.error('Error fetching total sales by date range:', error);
      return 0;
    }
  }
}

// Create and export a singleton instance
export const database = new Database(); 