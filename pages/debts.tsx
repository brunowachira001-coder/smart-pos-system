import React, { useState, useEffect } from 'react';

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

export default function DebtManagement() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentModal, setPaymentModal] = useState<{ show: boolean; debt: Debt | null }>({
    show: false,
    debt: null,
  });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchDebts();
    fetchStats();
  }, []);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debts?page=1&limit=100');
      const data = await response.json();
      
      if (response.ok) {
        setDebts(data.debts || []);
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

  const getStatusBadge = (status: string) => {
    if (status === 'Paid' || status === 'paid') {
      return <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Paid</span>;
    }
    return <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Outstanding</span>;
  };

  const outstandingDebts = debts.filter(d => d.amount_remaining > 0);

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Debt Management</h1>
          <p className="text-[var(--text-secondary)] mt-1">Monitor customer credit, outstanding balances, and payment history.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[var(--text-secondary)] text-sm">Outstanding Debt</div>
                <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {formatCurrency(stats.totalOutstanding || 0)}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">
                  {outstandingDebts.length} customers with debt
                </div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[var(--text-secondary)] text-sm">Today's Debt</div>
                <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {formatCurrency(stats.todayDebt || 0)}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">0 outstanding today</div>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>

          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[var(--text-secondary)] text-sm">Total Credit Limit</div>
                <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {formatCurrency(stats.totalCreditLimit || 0)}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">13% utilized</div>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>

          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[var(--text-secondary)] text-sm">Active Debts</div>
                <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {stats.activeDebts || 0}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">17 total debt records</div>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>

          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[var(--text-secondary)] text-sm">Recent Payments</div>
                <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {stats.paidDebts || 0}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">All-time payment records</div>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--border-color)]">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('all-debts')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'all-debts'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All Debts
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'payments'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('customer-summary')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'customer-summary'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Customer Summary
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Recent Outstanding Debts</h2>
              <div className="space-y-3">
                {outstandingDebts.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-secondary)]">No outstanding debts</div>
                ) : (
                  outstandingDebts.map((debt) => (
                    <div
                      key={debt.id}
                      className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4 flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-[var(--text-primary)]">{debt.customer_name}</div>
                        <div className="text-sm text-[var(--text-secondary)]">{debt.sale_id} • {formatDate(debt.created_at)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[var(--text-primary)]">{formatCurrency(debt.amount_remaining)}</div>
                        <button
                          onClick={() => setPaymentModal({ show: true, debt })}
                          className="text-xs mt-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                        >
                          Partial
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'all-debts' && (
          <div>
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-[var(--text-secondary)]">Loading...</div>
              ) : debts.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-secondary)]">No debts found</div>
              ) : (
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
                        <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--text-primary)]">Action</th>
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
                          <td className="px-4 py-3 text-center">{getStatusBadge(debt.status)}</td>
                          <td className="px-4 py-3 text-center">
                            {debt.amount_remaining > 0 && (
                              <button
                                onClick={() => setPaymentModal({ show: true, debt })}
                                className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                              >
                                Pay
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <p>Payment history and records will be displayed here</p>
          </div>
        )}

        {activeTab === 'customer-summary' && (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <p>Customer credit summary and details will be displayed here</p>
          </div>
        )}

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
    );
  }

