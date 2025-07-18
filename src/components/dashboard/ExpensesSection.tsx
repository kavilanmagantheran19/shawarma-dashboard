import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Search, Filter, Download, Upload } from 'lucide-react';
import { Expense } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../utils/dateHelpers';

const expenseCategories = [
  { value: 'ingredients', label: 'Ingredients' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'staff', label: 'Staff Wages' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'rent', label: 'Rent & Insurance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Other' },
];

const ExpensesSection: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: 0,
  });

  const handleAddExpense = () => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amount: formData.amount,
      createdAt: new Date(),
    };

    setExpenses([newExpense, ...expenses]);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: 0,
    });
    setShowForm(false);
  };

  const getCategoryLabel = (category: string) => {
    return expenseCategories.find(cat => cat.value === category)?.label || category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Expenses Management</h2>
          <p className="text-muted-foreground">Track and manage your expenses</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Enter expense description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amount: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Receipt</label>
                <Button variant="outline" className="w-full" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Receipt
                </Button>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddExpense} disabled={!formData.category || !formData.description}>
                Add Expense
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expenses History</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No expenses recorded yet</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setShowForm(true)}
              >
                Add your first expense
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b">
                      <td className="p-2">{formatDate(expense.date)}</td>
                      <td className="p-2">{getCategoryLabel(expense.category)}</td>
                      <td className="p-2">{expense.description}</td>
                      <td className="p-2 font-medium text-red-600">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Summary */}
      {expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expense Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(expenses.reduce((sum, exp) => {
                    const expDate = new Date(exp.date);
                    const now = new Date();
                    if (expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()) {
                      return sum + exp.amount;
                    }
                    return sum;
                  }, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">
                  {new Set(expenses.map(exp => exp.category)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpensesSection; 