import { useState, useEffect, useCallback } from 'react';
import { database } from '../lib/database';
import { Expense } from '../types';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load expenses
  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await database.getAllExpenses();
      setExpenses(data);
    } catch (err) {
      setError('Failed to load expenses');
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create expense
  const createExpense = useCallback(async (expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      console.log('Creating expense in hook with data:', expenseData);
      const newExpense = await database.createExpense(expenseData);
      if (newExpense) {
        console.log('New expense created:', newExpense);
        setExpenses(prev => {
          console.log('Previous expenses count:', prev.length);
          const updated = [newExpense, ...prev];
          console.log('Updated expenses count:', updated.length);
          return updated;
        });
        return newExpense;
      } else {
        setError('Failed to create expense');
        return null;
      }
    } catch (err) {
      setError('Failed to create expense');
      console.error('Error creating expense:', err);
      return null;
    }
  }, []);

  // Update expense
  const updateExpense = useCallback(async (expenseId: string, updates: Partial<Expense>) => {
    try {
      setError(null);
      const success = await database.updateExpense(expenseId, updates);
      if (success) {
        setExpenses(prev => 
          prev.map(expense => 
            expense.id.toString() === expenseId 
              ? { ...expense, ...updates }
              : expense
          )
        );
        return true;
      } else {
        setError('Failed to update expense');
        return false;
      }
    } catch (err) {
      setError('Failed to update expense');
      console.error('Error updating expense:', err);
      return false;
    }
  }, []);

  // Delete expense
  const deleteExpense = useCallback(async (expenseId: string) => {
    try {
      setError(null);
      const success = await database.deleteExpense(expenseId);
      if (success) {
        setExpenses(prev => prev.filter(expense => expense.id.toString() !== expenseId));
        return true;
      } else {
        setError('Failed to delete expense');
        return false;
      }
    } catch (err) {
      setError('Failed to delete expense');
      console.error('Error deleting expense:', err);
      return false;
    }
  }, []);

  // Get expenses by date range
  const getExpensesByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setError(null);
      const data = await database.getExpensesByDateRange(startDate, endDate);
      return data;
    } catch (err) {
      setError('Failed to fetch expenses by date range');
      console.error('Error fetching expenses by date range:', err);
      return [];
    }
  }, []);

  // Get expenses by category
  const getExpensesByCategory = useCallback(async (category: Expense['category']) => {
    try {
      setError(null);
      const data = await database.getExpensesByCategory(category);
      return data;
    } catch (err) {
      setError('Failed to fetch expenses by category');
      console.error('Error fetching expenses by category:', err);
      return [];
    }
  }, []);

  // Get total expenses
  const getTotalExpenses = useCallback(async () => {
    try {
      setError(null);
      const total = await database.getTotalExpenses();
      return total;
    } catch (err) {
      setError('Failed to fetch total expenses');
      console.error('Error fetching total expenses:', err);
      return 0;
    }
  }, []);

  // Get total expenses by date range
  const getTotalExpensesByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setError(null);
      const total = await database.getTotalExpensesByDateRange(startDate, endDate);
      return total;
    } catch (err) {
      setError('Failed to fetch total expenses by date range');
      console.error('Error fetching total expenses by date range:', err);
      return 0;
    }
  }, []);

  // Load expenses on component mount
  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    loadExpenses,
    getExpensesByDateRange,
    getExpensesByCategory,
    getTotalExpenses,
    getTotalExpensesByDateRange,
  };
}; 