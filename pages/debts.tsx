import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
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

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paymentModal, setPaymentModal] = useState<{ show: boolean; debt: Debt | null }>({
    show: false,
    debt: null,
  });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  useEffect(() => {
    fetchDebts();
    fetchStats();
  }, [currentPage]);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/debts?page=${currentPage}&limit=20`);
      const data = await response.json();
      
      if (response.ok) {
        setDebts(data.debts || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/debts/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handlePayment = async () => {
    if (!paymentModal.debt || !paymentAmount) return;

    try {
      const response = await fetch(`/api/debts/${paymentModal.debt.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
        }),
      });

      if (response.ok) {
        alert('Payment recorded successfully!');
        setPaymentModal({ show: false, debt: null });
        setPaymentAmount('');
        fetchDebts();
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Payment failed');
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'outstanding':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'overdue':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Debt Management</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
            <div className="text-[var(--text-secondary)] text-sm">Total Outstanding</div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
              {formatCurrency(stats.totalOutstanding || 0)}
            </div>
          </div>
          
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
            <div className="text-[var(--text-secondary)] text-sm">Today's Debt</div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
              {formatCurrency(stats.todayDebt || 0)}
            </div>
          </div>
          
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
            <div className="text-[var(--text-secondary)] text-sm">Active Debts</div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
              {stats.activeDebts || 0}
            </div>
          </div>
          
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
            <div className="text-[var(--text-secondary)] text-sm">Paid Debts</div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
              {stats.paidDebts || 0}
            </div>
          </div>
        </div>

        {/* Debts Table */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--text-secondary)]">Loading...</div>
          ) : debts.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-secondary)]">No debts found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Sale ID</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-primary)]">Total</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-primary)]">Paid</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-primary)]">Remaining</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--text-primary)]">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Due Date</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--text-primary)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {debts.map((debt) => (
                      <tr key={debt.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                        <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{debt.customer_name}</td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{debt.sale_id}</td>
                        <td className="px-4 py-3 text-sm text-right text-[var(--text-primary)]">
                          {formatCurrency(debt.total_amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-400">
                          {formatCurrency(debt.amount_paid)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-yellow-400">
                          {formatCurrency(debt.amount_remaining)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(debt.status)}`}>
                            {debt.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                          {formatDate(debt.due_date)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {debt.status !== 'Paid' && debt.amount_remaining > 0 && (
                            <button
                              onClick={() => setPaymentModal({ show: true, debt })}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition-colors"
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-[var(--border-color)]">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>

        {/* Payment Modal */}
        {paymentModal.show && paymentModal.debt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Record Payment</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Customer</div>
                  <div className="text-[var(--text-primary)] font-medium">{paymentModal.debt.customer_name}</div>
                </div>
                
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Outstanding Amount</div>
                  <div className="text-[var(--text-primary)] font-medium">
                    {formatCurrency(paymentModal.debt.amount_remaining)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={paymentModal.debt.amount_remaining}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Enter amount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setPaymentModal({ show: false, debt: null });
                    setPaymentAmount('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
