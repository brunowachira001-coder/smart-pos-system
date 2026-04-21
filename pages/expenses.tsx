import React, { useEffect, useState } from 'react';
import DateRangeFilter, { getDateRange, formatDateLocal } from '../components/DateRangeFilter';

interface Expense {
  id: string;
  expense_id: string;
  category: string;
  amount: number;
  description: string;
  payment_method: string;
  vendor_name: string;
  expense_date: string;
  status: string;
  created_by: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
    payment_method: 'Cash',
    vendor_name: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  const [stats, setStats] = useState({
    todayTotal: 0,
    businessTotal: 0,
    personalTotal: 0,
    totalExpenses: 0,
    categoryTotals: {} as { [key: string]: number },
    todayGrossRevenue: 0,
    todayNetRevenue: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Convert selected range to actual dates
    const updateDates = () => {
      const { startDate: start, endDate: end } = getDateRange(dateRange);
      
      if (start && end) {
        // Format with full timestamp for API
        setStartDate(start.toISOString());
        setEndDate(end.toISOString());
      } else {
        // For 'all', clear the date range
        setStartDate('');
        setEndDate('');
      }
    };

    // Update dates immediately
    updateDates();
  }, [dateRange]);

  // Check for date change every 10 seconds
  useEffect(() => {
    const checkDateChange = () => {
      const now = new Date();
      const newDate = now.toDateString();
      
      // If the date has changed, update dates immediately
      if (newDate !== currentDate) {
        console.log('Date changed from', currentDate, 'to', newDate, '- updating expenses...');
        setCurrentDate(newDate);
        
        // Re-calculate date range for current selection
        const { startDate: start, endDate: end } = getDateRange(dateRange);
        if (start && end) {
          setStartDate(start.toISOString());
          setEndDate(end.toISOString());
        }
        
        // Refresh data
        fetchData();
      }
    };

    // Check every 10 seconds for date changes
    const interval = setInterval(checkDateChange, 10000);

    return () => clearInterval(interval);
  }, [currentDate, dateRange]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, categoryFilter, methodFilter, startDate, endDate]);

  const fetchData = async () => {
    try {
      const [statsRes, expensesRes, categoriesRes, dashboardRes] = await Promise.all([
        fetch('/api/expenses/stats'),
        fetch('/api/expenses'),
        fetch('/api/expenses/categories'),
        fetch('/api/dashboard/comprehensive-stats?range=today'),
      ]);

      const statsData = await statsRes.json();
      const expensesData = await expensesRes.json();
      const categoriesData = await categoriesRes.json();
      const dashboardData = await dashboardRes.json();

      setStats({
        todayTotal: statsData.todayTotal || 0,
        businessTotal: statsData.businessTotal || 0,
        personalTotal: statsData.personalTotal || 0,
        totalExpenses: statsData.totalExpenses || 0,
        categoryTotals: statsData.categoryTotals || {},
        todayGrossRevenue: dashboardData.data?.grossRevenue || 0,
        todayNetRevenue: (dashboardData.data?.grossRevenue || 0) - (statsData.todayTotal || 0),
      });

      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(e => e.payment_method === methodFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.expense_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filtering - compare ISO timestamps
    if (startDate && endDate) {
      filtered = filtered.filter(e => {
        const expenseDate = new Date(e.expense_date).toISOString();
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }

    setFilteredExpenses(filtered);
  };


  const handleAddExpense = async () => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewExpense({
          category: '',
          amount: '',
          description: '',
          payment_method: 'Cash',
          vendor_name: '',
          expense_date: new Date().toISOString().split('T')[0],
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleApproveExpense = async (expenseId: string, status: 'Approved' | 'Rejected' | 'Pending') => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          approved_by: user.name || 'Admin'
        }),
      });

      if (response.ok) {
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--text-primary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Expense Management</h1>
          <p className="text-sm text-[var(--text-secondary)]">Track and manage your business and personal expenses.</p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangeFilter 
            value={dateRange} 
            onChange={setDateRange}
            startDate={startDate ? formatDateLocal(new Date(startDate)) : ''}
            endDate={endDate ? formatDateLocal(new Date(endDate)) : ''}
            onDateChange={(start, end) => {
              // Convert date strings to full ISO timestamps
              const startDateTime = new Date(start);
              startDateTime.setHours(0, 0, 0, 0);
              const endDateTime = new Date(end);
              endDateTime.setHours(23, 59, 59, 999);
              setStartDate(startDateTime.toISOString());
              setEndDate(endDateTime.toISOString());
            }}
          />
          <button className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
            📤 Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-sm">Today's Expenses</p>
            <span className="text-red-500">📉</span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">KSH {stats.todayTotal.toFixed(2)}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">No expenses recorded today</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
            >
              ➕ Add
            </button>
            <button className="flex-1 px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
              👁️ View
            </button>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-sm">Today's Net Revenue</p>
            <span className="text-green-500">📈</span>
          </div>
          <p className="text-3xl font-bold text-green-500">KSH {stats.todayNetRevenue.toFixed(2)}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">From KSH {stats.todayGrossRevenue.toFixed(2)} gross revenue • {stats.todayGrossRevenue > 0 ? ((stats.todayNetRevenue / stats.todayGrossRevenue) * 100).toFixed(1) : '0.0'}% margin</p>
          <div className="mt-4 space-y-2 bg-[var(--bg-secondary)] rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Gross Revenue</span>
              <span className="text-[var(--text-primary)]">KSH {stats.todayGrossRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Returns</span>
              <span className="text-[var(--text-primary)]">-KSH 0.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Business Expenses</span>
              <span className="text-[var(--text-primary)]">-KSH {stats.todayTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Personal Expenses</span>
              <span className="text-[var(--text-primary)]">-KSH 0.00</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-[var(--border-color)] pt-2">
              <span className="text-[var(--text-primary)]">Net Revenue (All)</span>
              <span className="text-green-500">KSH {stats.todayNetRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-sm">Expense Overview</p>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalExpenses}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">Active categories</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Business:</span>
              <span className="text-[var(--text-primary)]">KSH {stats.businessTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Personal:</span>
              <span className="text-[var(--text-primary)]">KSH {stats.personalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Expenses (All Users)</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Total: KSH {stats.businessTotal + stats.personalTotal}.00 • Business: KSH {stats.businessTotal}.00 • Personal: KSH {stats.personalTotal}.00
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
          >
            ➕ Add Expense
          </button>
        </div>

        <div className="mb-4 flex gap-4">
          <input
            type="text"
            placeholder="🔍 Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
          >
            <option value="all">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="M-Pesa">M-Pesa</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Card</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--border-color)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Expense ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Method</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                    <td className="px-4 py-4 text-sm text-[var(--text-primary)] font-mono">{expense.expense_id}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-primary)]">{expense.category}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-primary)]">{expense.description}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-primary)] font-semibold">KSH {expense.amount.toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-primary)]">{expense.payment_method}</td>
                    <td className="px-4 py-4 text-sm text-[var(--text-primary)]">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        expense.status === 'Approved' ? 'bg-green-500/20 text-green-500' : 
                        expense.status === 'Rejected' ? 'bg-red-500/20 text-red-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)}
                          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg font-bold"
                        >
                          ⋯
                        </button>
                        
                        {openMenuId === expense.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 mt-2 w-40 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg shadow-xl z-20 py-1">
                              {expense.status !== 'Approved' && (
                                <button
                                  onClick={() => {
                                    handleApproveExpense(expense.id, 'Approved');
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-primary)] text-green-600 hover:text-green-700 transition-colors"
                                >
                                  ✓ Approve
                                </button>
                              )}
                              {expense.status !== 'Rejected' && (
                                <button
                                  onClick={() => {
                                    handleApproveExpense(expense.id, 'Rejected');
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-primary)] text-red-600 hover:text-red-700 transition-colors"
                                >
                                  ✗ Reject
                                </button>
                              )}
                              {expense.status !== 'Pending' && (
                                <button
                                  onClick={() => {
                                    handleApproveExpense(expense.id, 'Pending');
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-primary)] text-yellow-600 hover:text-yellow-700 transition-colors"
                                >
                                  ⟳ Set Pending
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full mx-4 border border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Add New Expense</h2>
            <div className="space-y-3">
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
              />
              <select
                value={newExpense.payment_method}
                onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
              >
                <option>Cash</option>
                <option>M-Pesa</option>
                <option>Bank Transfer</option>
                <option>Card</option>
              </select>
              <input
                type="text"
                placeholder="Vendor Name (Optional)"
                value={newExpense.vendor_name}
                onChange={(e) => setNewExpense({ ...newExpense, vendor_name: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
              />
              <input
                type="date"
                value={newExpense.expense_date}
                onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
