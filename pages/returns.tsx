import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DateRangeFilter, { getDateRange } from '../components/DateRangeFilter';

interface Return {
  id: string;
  return_id: string;
  transaction_id: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  amount: number;
  reason: string;
  status: string;
  return_date: string;
  processed_date: string | null;
}

export default function Returns() {
  const router = useRouter();
  const [returns, setReturns] = useState<Return[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [createFormData, setCreateFormData] = useState({
    transactionId: '',
    productName: '',
    quantity: 1,
    reason: '',
    customerName: '',
    amount: 0,
  });
  const [createFormErrors, setCreateFormErrors] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [stats, setStats] = useState({
    totalReturns: 0,
    pendingReturns: 0,
    completedReturns: 0,
    totalReturnValue: 0,
    todayReturnCount: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterReturns();
  }, [returns, searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      const [statsRes, returnsRes] = await Promise.all([
        fetch('/api/returns/stats'),
        fetch('/api/returns'),
      ]);

      const statsData = await statsRes.json();
      const returnsData = await returnsRes.json();

      setStats({
        totalReturns: statsData.totalReturns || 0,
        pendingReturns: statsData.pendingReturns || 0,
        completedReturns: statsData.completedReturns || 0,
        totalReturnValue: statsData.totalReturnValue || 0,
        todayReturnCount: statsData.todayReturnCount || 0,
      });

      setReturns(returnsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReturns = () => {
    let filtered = returns;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.return_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReturns(filtered);
  };

  const handleProcessReturn = async (returnId: string, status: string) => {
    try {
      const response = await fetch(`/api/returns/${returnId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          processed_by: 'Admin',
          refund_method: 'Cash',
          refund_amount: selectedReturn?.amount || 0,
        }),
      });

      if (response.ok) {
        setShowProcessModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error processing return:', error);
    }
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateFormErrors('');
    setSubmitting(true);

    // Validation
    if (!createFormData.transactionId || !createFormData.productName || !createFormData.reason) {
      setCreateFormErrors('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    if (createFormData.quantity < 1) {
      setCreateFormErrors('Quantity must be at least 1');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: createFormData.transactionId,
          product_name: createFormData.productName,
          customer_name: createFormData.customerName || 'Walk-in Customer',
          quantity: createFormData.quantity,
          amount: createFormData.amount,
          reason: createFormData.reason,
          status: 'Pending',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setCreateFormData({
          transactionId: '',
          productName: '',
          quantity: 1,
          reason: '',
          customerName: '',
          amount: 0,
        });
        fetchData();
      } else {
        setCreateFormErrors(data.error || 'Failed to create return');
      }
    } catch (error) {
      console.error('Error creating return:', error);
      setCreateFormErrors('Failed to create return. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'rejected':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Returns</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage product returns and process refunds.</p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <button className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
            📤 Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
          >
            ⚙️ Create Return
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Total Returns</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalReturns}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Pending</p>
          <p className="text-3xl font-bold text-yellow-500">{stats.pendingReturns}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Completed</p>
          <p className="text-3xl font-bold text-green-500">{stats.completedReturns}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Return Value</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">KES {stats.totalReturnValue.toFixed(2)}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Today's Returns</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.todayReturnCount}</p>
        </div>
      </div>

      {/* Return History */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Return History</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">A list of all processed returns.</p>
          
          <input
            type="text"
            placeholder="🔍 Search by receipt #, customer name, product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--border-color)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Return ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Transaction ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Reason</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Return Date ↓</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((returnItem) => (
                <tr key={returnItem.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                  <td className="px-4 py-4 text-sm text-[var(--text-primary)] font-mono">{returnItem.return_id}</td>
                  <td className="px-4 py-4 text-sm text-[var(--text-primary)]">{returnItem.transaction_id}</td>
                  <td className="px-4 py-4 text-sm text-[var(--text-primary)]">{returnItem.reason}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(returnItem.status)}`}>
                      {returnItem.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-primary)]">{returnItem.quantity}</td>
                  <td className="px-4 py-4 text-sm text-[var(--text-primary)]">
                    {new Date(returnItem.return_date).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => {
                        setSelectedReturn(returnItem);
                        setShowProcessModal(true);
                      }}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      ⋯
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Return Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-lg w-full mx-4 border border-[var(--border-color)] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Create Return</h2>
            
            <form onSubmit={handleCreateReturn} className="space-y-4">
              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.transactionId}
                  onChange={(e) => setCreateFormData({ ...createFormData, transactionId: e.target.value })}
                  placeholder="e.g., TXN-001"
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={createFormData.customerName}
                  onChange={(e) => setCreateFormData({ ...createFormData, customerName: e.target.value })}
                  placeholder="Optional - defaults to Walk-in Customer"
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.productName}
                  onChange={(e) => setCreateFormData({ ...createFormData, productName: e.target.value })}
                  placeholder="e.g., iPhone 13 Pro"
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Quantity and Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={createFormData.quantity}
                    onChange={(e) => setCreateFormData({ ...createFormData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={createFormData.amount}
                    onChange={(e) => setCreateFormData({ ...createFormData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Return Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={createFormData.reason}
                  onChange={(e) => setCreateFormData({ ...createFormData, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="Defective">Defective Product</option>
                  <option value="Wrong Item">Wrong Item Received</option>
                  <option value="Not as Described">Not as Described</option>
                  <option value="Changed Mind">Customer Changed Mind</option>
                  <option value="Damaged">Damaged During Shipping</option>
                  <option value="Quality Issues">Quality Issues</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Error Message */}
              {createFormErrors && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{createFormErrors}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Creating...' : 'Create Return'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateFormData({
                      transactionId: '',
                      productName: '',
                      quantity: 1,
                      reason: '',
                      customerName: '',
                      amount: 0,
                    });
                    setCreateFormErrors('');
                  }}
                  className="px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Modal */}
      {showProcessModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full mx-4 border border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Process Return</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Return ID: {selectedReturn.return_id}</p>
                <p className="text-sm text-[var(--text-secondary)]">Customer: {selectedReturn.customer_name}</p>
                <p className="text-sm text-[var(--text-secondary)]">Product: {selectedReturn.product_name}</p>
                <p className="text-sm text-[var(--text-secondary)]">Amount: KES {selectedReturn.amount}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleProcessReturn(selectedReturn.id, 'Completed')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleProcessReturn(selectedReturn.id, 'Rejected')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
              <button
                onClick={() => setShowProcessModal(false)}
                className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
