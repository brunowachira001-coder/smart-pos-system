import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Sales() {
  const router = useRouter();
  const [sales, setSales] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setSales([
      { id: 1, date: '2024-04-12', transactionNo: 'TXN001', customer: 'John Doe', type: 'retail', amount: 2500, items: 5, paymentMethod: 'Cash', status: 'completed' },
      { id: 2, date: '2024-04-12', transactionNo: 'TXN002', customer: 'Jane Smith', type: 'wholesale', amount: 15000, items: 25, paymentMethod: 'M-Pesa', status: 'completed' },
      { id: 3, date: '2024-04-11', transactionNo: 'TXN003', customer: 'Bob Johnson', type: 'retail', amount: 1200, items: 3, paymentMethod: 'Card', status: 'completed' },
      { id: 4, date: '2024-04-11', transactionNo: 'TXN004', customer: 'Walk-in Customer', type: 'retail', amount: 850, items: 2, paymentMethod: 'Cash', status: 'completed' },
      { id: 5, date: '2024-04-10', transactionNo: 'TXN005', customer: 'Wholesale Buyer', type: 'wholesale', amount: 25000, items: 40, paymentMethod: 'Check', status: 'completed' },
    ]);
  }, [router]);

  const filteredSales = sales.filter((sale) => {
    if (filter === 'retail') return sale.type === 'retail';
    if (filter === 'wholesale') return sale.type === 'wholesale';
    return true;
  });

  const stats = {
    totalSales: sales.reduce((sum, s) => sum + s.amount, 0),
    totalTransactions: sales.length,
    retailSales: sales.filter((s) => s.type === 'retail').reduce((sum, s) => sum + s.amount, 0),
    wholesaleSales: sales.filter((s) => s.type === 'wholesale').reduce((sum, s) => sum + s.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
        <p className="text-slate-600 mt-1">View all sales transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Total Sales</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">KES {stats.totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Transactions</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalTransactions}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Retail Sales</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">KES {stats.retailSales.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Wholesale Sales</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">KES {stats.wholesaleSales.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
          }`}
        >
          All Sales
        </button>
        <button
          onClick={() => setFilter('retail')}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            filter === 'retail' ? 'bg-purple-600 text-white' : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
          }`}
        >
          Retail
        </button>
        <button
          onClick={() => setFilter('wholesale')}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            filter === 'wholesale' ? 'bg-orange-600 text-white' : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
          }`}
        >
          Wholesale
        </button>
      </div>

      {/* Sales Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Transaction</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{sale.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{sale.transactionNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{sale.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      sale.type === 'retail'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {sale.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{sale.items}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                  KES {sale.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{sale.paymentMethod}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {sale.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button className="text-emerald-600 hover:text-emerald-700 font-medium">View</button>
                  <button className="text-slate-600 hover:text-slate-700 font-medium">Print</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
