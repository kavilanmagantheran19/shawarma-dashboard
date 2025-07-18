import { useState, useEffect } from 'react';
import { Sale } from '../types';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sales from localStorage on mount
  useEffect(() => {
    const savedSales = localStorage.getItem('shawarma-sales');
    if (savedSales) {
      try {
        const parsedSales = JSON.parse(savedSales);
        setSales(parsedSales);
      } catch (error) {
        console.error('Error loading sales from localStorage:', error);
      }
    }
    setLoading(false);
  }, []);

  // Save sales to localStorage whenever sales change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('shawarma-sales', JSON.stringify(sales));
    }
  }, [sales, loading]);

  const addSale = (sale: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setSales(prev => [newSale, ...prev]);
    return newSale;
  };

  const updateSale = (id: string, updates: Partial<Sale>) => {
    setSales(prev => prev.map(sale => 
      sale.id === id ? { ...sale, ...updates } : sale
    ));
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
  };

  const getSalesByDateRange = (startDate: Date, endDate: Date) => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  };

  const getTotalSales = () => {
    return sales.reduce((sum, sale) => sum + sale.total, 0);
  };

  const getSalesByItem = (itemName: string) => {
    return sales.filter(sale => sale.item === itemName);
  };

  return {
    sales,
    loading,
    addSale,
    updateSale,
    deleteSale,
    getSalesByDateRange,
    getTotalSales,
    getSalesByItem,
  };
}; 