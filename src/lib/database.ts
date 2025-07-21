import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, Expense } from '../types';

class Database {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // ===== ORDERS METHODS =====

  // Create new order
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_sales')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating order:', error);
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

  // Delete order
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

  // Get total sales
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

  // ===== EXPENSES METHODS =====

  // Create new expense
  async createExpense(expenseData: Omit<Expense, 'id' | 'created_at'>): Promise<Expense | null> {
    try {
      console.log('Creating expense with data:', expenseData);
      
      const { data, error } = await this.supabase
        .from('shawarma_expenses')
        .insert([expenseData])
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return null;
      }

      console.log('Expense created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating expense:', error);
      return null;
    }
  }

  // Get all expenses
  async getAllExpenses(): Promise<Expense[]> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  }

  // Get expenses by date range
  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_expenses')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses by date range:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching expenses by date range:', error);
      return [];
    }
  }

  // Get expenses by category
  async getExpensesByCategory(category: Expense['category']): Promise<Expense[]> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_expenses')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses by category:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching expenses by category:', error);
      return [];
    }
  }

  // Update expense
  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('shawarma_expenses')
        .update(updates)
        .eq('id', expenseId);

      if (error) {
        console.error('Error updating expense:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating expense:', error);
      return false;
    }
  }

  // Delete expense
  async deleteExpense(expenseId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('shawarma_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.error('Error deleting expense:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  }

  // Get total expenses
  async getTotalExpenses(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_expenses')
        .select('amount');

      if (error) {
        console.error('Error fetching total expenses:', error);
        return 0;
      }

      return data?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    } catch (error) {
      console.error('Error fetching total expenses:', error);
      return 0;
    }
  }

  // Get total expenses by date range
  async getTotalExpensesByDateRange(startDate: string, endDate: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('shawarma_expenses')
        .select('amount')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) {
        console.error('Error fetching total expenses by date range:', error);
        return 0;
      }

      return data?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    } catch (error) {
      console.error('Error fetching total expenses by date range:', error);
      return 0;
    }
  }
}

export const database = new Database(); 