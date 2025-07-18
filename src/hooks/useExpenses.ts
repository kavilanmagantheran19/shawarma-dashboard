import { useState, useEffect } from 'react';
import { Expense } from '../types';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Load expenses from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('shawarma-expenses');
    if (savedExpenses) {
      try {
        const parsedExpenses = JSON.parse(savedExpenses);
        setExpenses(parsedExpenses);
      } catch (error) {
        console.error('Error loading expenses from localStorage:', error);
      }
    }
    setLoading(false);
  }, []);

  // Save expenses to localStorage whenever expenses change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('shawarma-expenses', JSON.stringify(expenses));
    }
  }, [expenses, loading]);

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, ...updates } : expense
    ));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const getExpensesByDateRange = (startDate: Date, endDate: Date) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getExpensesByCategory = (category: string) => {
    return expenses.filter(expense => expense.category === category);
  };

  const getExpenseBreakdown = () => {
    const breakdown = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown).map(([category, amount]) => ({
      category,
      amount,
    }));
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByDateRange,
    getTotalExpenses,
    getExpensesByCategory,
    getExpenseBreakdown,
  };
}; 