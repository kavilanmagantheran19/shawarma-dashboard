import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Search, Filter, Download, Plus, Edit, Trash2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import { formatDate } from '../../utils/dateHelpers';
import { useExpenses } from '../../hooks/useExpenses';
import ExpensesPieChart from './ExpensesPieChart';

const ExpensesSection: React.FC = () => {
  const { expenses, loading, error, createExpense, deleteExpense } = useExpenses();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  const [expandedExpenses, setExpandedExpenses] = useState<Set<string>>(new Set());
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0]);
  const [quickAddData, setQuickAddData] = useState({
    seri_ternak: '',
    balaji: '',
    wraps: '',
    marketing: '',
    other: '',
    description: '',
  });

  // Filter expenses for the selected week
  const getFilteredExpenses = () => {
    const weekStart = new Date(selectedWeek);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.created_at);
      return expenseDate >= weekStart && expenseDate <= weekEnd;
    });
  };

  const filteredExpenses = getFilteredExpenses();

  const expenseCategories = [
    { key: 'seri_ternak', label: 'Seri Ternak', color: 'bg-purple-500' },
    { key: 'balaji', label: 'Balaji', color: 'bg-teal-500' },
    { key: 'wraps', label: 'Wraps', color: 'bg-orange-500' },
    { key: 'marketing', label: 'Marketing', color: 'bg-blue-500' },
    { key: 'other', label: 'Other', color: 'bg-gray-500' },
  ];

  const handleQuickAdd = async () => {
    // Calculate total amount from all categories
    const totalAmount = expenseCategories.reduce((sum, category) => {
      const amount = quickAddData[category.key as keyof typeof quickAddData];
      return sum + (amount ? parseFloat(amount) : 0);
    }, 0);

    if (totalAmount <= 0) {
      alert('Please enter at least one amount');
      return;
    }

    // Create a single expense entry with all categories combined
    const expenseData = {
      category: 'weekly_expense' as const,
      description: quickAddData.description || `Weekly expenses: ${expenseCategories.map(cat => {
        const amount = quickAddData[cat.key as keyof typeof quickAddData];
        return amount ? `${cat.label}: RM${amount}` : null;
      }).filter(Boolean).join(', ')}`,
      amount: Math.round(totalAmount * 100), // Convert to cents
    };

    try {
      console.log('Creating expense with data:', expenseData);
      const result = await createExpense(expenseData);
      
      if (result) {
        console.log('Expense created successfully:', result);
        
        // Reset form
        setQuickAddData({
          seri_ternak: '',
          balaji: '',
          wraps: '',
          marketing: '',
          other: '',
          description: '',
        });
        setShowQuickAdd(false);
      } else {
        console.error('Failed to create expense');
        alert('Error adding expense. Please try again.');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense. Please try again.');
    }
  };

  const resetQuickAddForm = () => {
    setQuickAddData({
      seri_ternak: '',
      balaji: '',
      wraps: '',
      marketing: '',
      other: '',
      description: '',
    });
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense.id);
    setQuickAddData({
      seri_ternak: expense.category === 'seri_ternak' ? (expense.amount / 100).toString() : '',
      balaji: expense.category === 'balaji' ? (expense.amount / 100).toString() : '',
      wraps: expense.category === 'wraps' ? (expense.amount / 100).toString() : '',
      marketing: expense.category === 'marketing' ? (expense.amount / 100).toString() : '',
      other: expense.category === 'other' ? (expense.amount / 100).toString() : '',
      description: expense.description,
    });
    setShowQuickAdd(true);
  };

  const handleDelete = async (expenseId: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(expenseId.toString());
    }
  };

  const toggleExpenseExpansion = (expenseId: string) => {
    setExpandedExpenses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(expenseId)) {
        newSet.delete(expenseId);
      } else {
        newSet.add(expenseId);
      }
      return newSet;
    });
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'weekly_expense') {
      return 'Weekly Expenses';
    }
    return expenseCategories.find(cat => cat.key === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    if (category === 'weekly_expense') {
      return 'bg-green-500';
    }
    return expenseCategories.find(cat => cat.key === category)?.color || 'bg-gray-500';
  };

  // Calculate total for quick add
  const quickAddTotal = expenseCategories.reduce((sum, category) => {
    const amount = quickAddData[category.key as keyof typeof quickAddData];
    return sum + (amount ? parseFloat(amount) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses Management</h1>
          <p className="text-muted-foreground">Track and manage your expenses</p>
        </div>
        <Button onClick={() => setShowQuickAdd(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Quick Add Expenses</span>
        </Button>
      </div>

      {/* Quick Add Expenses Form */}
      {showQuickAdd && (
        <Card>
          <CardHeader>
            <CardTitle>{editingExpense ? 'Edit Expense' : 'Quick Add Expenses'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              
              <div className="flex gap-4 overflow-x-auto">
                {expenseCategories.map((category) => (
                  <div key={category.key} className="flex-shrink-0 w-32">
                    <label className="block text-sm font-medium mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded ${category.color}`}></div>
                        <span className="text-xs">{category.label}</span>
                      </div>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="text-sm"
                      value={quickAddData[category.key as keyof typeof quickAddData]}
                      onChange={(e) => setQuickAddData(prev => ({ 
                        ...prev, 
                        [category.key]: e.target.value 
                      }))}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <Textarea
                  value={quickAddData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuickAddData(prev => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                  placeholder="Enter description for all expenses..."
                  rows={1}
                  className="text-sm w-96"
                />
              </div>

              {/* Total Preview */}
              <div className="flex justify-between items-center p-2 bg-muted rounded-lg w-96">
                <span className="font-medium text-sm">Total:</span>
                <span className="font-bold text-base">{formatCurrency(quickAddTotal * 100)}</span>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleQuickAdd} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{editingExpense ? 'Update' : 'Add Expenses'}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowQuickAdd(false);
                    setEditingExpense(null);
                    resetQuickAddForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses Pie Chart */}
      <ExpensesPieChart 
        expenses={expenses} 
        onWeekChange={(weekStart) => setSelectedWeek(weekStart.toISOString().split('T')[0])}
      />

      {/* Expenses History */}
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
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading expenses...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error: {error}</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No expenses recorded for this week
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Showing {filteredExpenses.length} expenses for the selected week
              </div>
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="border rounded-lg">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleExpenseExpansion(expense.id.toString())}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded ${getCategoryColor(expense.category)}`}></div>
                      <div>
                        <p className="font-medium">{getCategoryLabel(expense.category)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(expense.created_at)}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(expense);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(expense.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {expandedExpenses.has(expense.id.toString()) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  
                  {expandedExpenses.has(expense.id.toString()) && (
                    <div className="px-4 pb-4">
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">
                          <strong>Description:</strong> {expense.description || 'No description provided'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Created:</strong> {formatDate(expense.created_at)}
                        </p>
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

export default ExpensesSection; 