import React, { useEffect, useState } from 'react';
import DateRangeFilter, { getDateRange } from '../components/DateRangeFilter';
import Pagination from '../components/Pagination';

interface Debt {
  id: string;
  customer_name: string;
  sale_id: string;
  total_amount: number;
  amount_paid: number;
  amount_remaining: number;
  status: string;
  due_date: string;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  created_at: string;
}

export default function DebtManagement() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [displayStartDate, setDisplayStartDate] = useState('');
  const [displayEndDate, setDisplayEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDebts, setTotalDebts] = useState(0);
  
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    todayDebt: 0,
    totalCreditLimit: 0,
    activeDebts: 0,
    recentPayments: 0,
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const { startDate: start, endDate: end } = getDateRange(dateRange);
    
    if (start && end) {
      setStartDate(start.toISOString());
      setEndDate(end.toISOString());
      
      const formatForDisplay = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      setDisplayStartDate(formatForDisplay(start));
      setDisplayEndDate(formatForDisplay(end));
    } else {
      setStartDate('');
      setEndDate('');
      setDisplayStartDate('');
      setDisplayEndDate('');
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateRange !== 'all' && startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());

      const [statsRes, debtsRes] = await Promise.all([
        fetch(`/api/debts/stats?${params.toString()}`),
        fetch(`/api/debts?${params.toString()}`),
      ]);

      if (!statsRes.ok) {
        const errorText = await statsRes.text();
        throw new Error(`Stats API error: ${statsRes.status} - ${errorText}`);
      }

      if (!debtsRes.ok) {
        const errorText = await debtsRes.text();
        throw new Error(`Debts API error: ${debtsRes.status} - ${errorText}`);
      }

      const statsData = await statsRes.json();
      const debtsData = await debtsRes.json();

      setStats({
        totalOutstanding: statsData.totalOutstanding || 0,
        todayDebt: statsData.todayDebt || 0,
        totalCreditLimit: statsData.totalCreditLimit || 0,
        activeDebts: statsData.activeDebts || 0,
        recentPayments: statsData.recentPayments || 0,
      });

      setDebts(debtsData.debts || []);
      setTotalPages(debtsData.pagination?.totalPages || 1);
      setTotalDebts(debtsData.pagination?.total || 0);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load debt data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedDebt || !paymentAmount) return;

    try {
      const response = await fetch(`/api/debts/${selectedDebt.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          reference_number: referenceNumber,
          notes: `Payment for ${selectedDebt.sale_id}`,
        }),
      });

      if (response.ok) {
        setShowPaymentModal(false);
        setPaymentAmount('');
        setReferenceNumber('');
        fetchData();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--text-primary)]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Debt Page</h1>
          <p className="text-[var(--text-primary)] mb-4 max-w-md">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Debt Management</h1>
          <p className="text-sm text-[var(--text-secondary)]">Monitor customer credit, outstanding balances, and payment history.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
            🔄 Refresh Data
          </button>
          <DateRangeFilter 
            value={dateRange} 
            onChange={setDateRange}
            startDate={displayStartDate}
            endDate={displayEndDate}
            onDateChange={(start, end) => {
              const startDate = new Date(start + 'T00:00:00');
              const endDate = new Date(end + 'T23:59:59.999');
              setStartDate(startDate.toISOString());
              setEndDate(endDate.toISOString());
              setDisplayStartDate(start);
              setDisplayEndDate(end);
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-sm">Outstanding Debt</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">KSH {stats.totalOutstanding.toFixed(2)}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">{stats.activeDebts} customers with outstanding debt</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-sm">Today's Debt</p>
            <span className="text-2xl">⏰</span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">KSH {stats.todayDebt.toFixed(2)}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">0 debts created today</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-sm">Total Credit Limit</p>
            <span className="text-2xl">💳</span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">KSH {stats.totalCreditLimit.toFixed(2)}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">1.3% utilized</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-sm">Active Debts</p>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.activeDebts}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">{totalDebts} total debt records</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-sm">Recent Payments</p>
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.recentPayments}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">All time payment records</p>
        </div>
      </div>

      {/* Recent Outstanding Debts */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Recent Outstanding Debts</h2>
        <div className="space-y-3">
          {debts.filter(d => d.status !== 'paid').length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              No outstanding debts found for the selected date range
            </div>
          ) : (
            debts.filter(d => d.status !== 'paid').map((debt) => (
            <div
              key={debt.id}
              className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]"
            >
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{debt.customer_name}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {debt.sale_id} • {new Date(debt.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xl font-bold text-[var(--text-primary)]">KSH {debt.amount_remaining.toFixed(2)}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      debt.status === 'partial'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}
                  >
                    {debt.status}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedDebt(debt);
                    setShowPaymentModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                >
                  Record Payment
                </button>
              </div>
            </div>
          )))}
        </div>
        
        {/* Pagination */}
        {totalDebts > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalDebts}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
              itemName="debts"
            />
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedDebt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full mx-4 border border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Record Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Customer</label>
                <input
                  type="text"
                  value={selectedDebt.customer_name}
                  disabled
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Amount Remaining: KSH {selectedDebt.amount_remaining.toFixed(2)}
                </label>
                <input
                  type="number"
                  placeholder="Payment Amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={selectedDebt.amount_remaining}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                >
                  <option>Cash</option>
                  <option>M-Pesa</option>
                  <option>Bank Transfer</option>
                  <option>Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Reference Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., M-Pesa code"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
