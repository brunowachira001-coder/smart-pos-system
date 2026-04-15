import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Sales() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchTransactions();
  }, [router]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/transactions/list');
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const totalSales = transactions.reduce((sum, txn) => sum + txn.total, 0);
  const totalTransactions = transactions.length;
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sales & Transactions</h1>
        <p className="text-slate-600 mt-1">View all completed transactions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Total Sales</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">KES {totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Transactions</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalTransactions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Average Transaction</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">KES {averageTransaction.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Tax Collected</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            KES {transactions.reduce((sum, txn) => sum + txn.tax, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date & Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Cashier</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Customer</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Items</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Subtotal</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Tax</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{txn.transactionNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {txn.date} {txn.time}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{txn.cashier}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{txn.customer}</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-900">{txn.itemCount}</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-900">
                      KES {txn.subtotal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-slate-900">
                      KES {txn.tax.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-emerald-600">
                      KES {txn.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
