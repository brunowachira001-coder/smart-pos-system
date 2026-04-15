import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Reports() {
  const router = useRouter();
  const [reportType, setReportType] = useState('daily');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  const dailyData = [
    { date: '2024-04-12', sales: 18500, transactions: 12, avgTransaction: 1541, profit: 4200 },
    { date: '2024-04-11', sales: 22000, transactions: 15, avgTransaction: 1466, profit: 5100 },
    { date: '2024-04-10', sales: 25000, transactions: 18, avgTransaction: 1388, profit: 5800 },
    { date: '2024-04-09', sales: 19500, transactions: 14, avgTransaction: 1392, profit: 4500 },
    { date: '2024-04-08', sales: 21000, transactions: 16, avgTransaction: 1312, profit: 4800 },
  ];

  const categoryData = [
    { category: 'Dairy', sales: 45000, items: 250, profit: 10500 },
    { category: 'Bakery', sales: 28000, items: 180, profit: 6200 },
    { category: 'Grains', sales: 52000, items: 320, profit: 12000 },
    { category: 'Oils', sales: 18000, items: 90, profit: 4200 },
    { category: 'Groceries', sales: 35000, items: 210, profit: 8100 },
  ];

  const topProducts = [
    { sku: 'PROD004', name: 'Rice (2kg)', sold: 450, revenue: 135000, profit: 31500 },
    { sku: 'PROD001', name: 'Milk (1L)', sold: 380, revenue: 57000, profit: 14250 },
    { sku: 'PROD003', name: 'Eggs (Dozen)', sold: 320, revenue: 64000, profit: 12800 },
    { sku: 'PROD005', name: 'Sugar (1kg)', sold: 290, revenue: 34800, profit: 7250 },
    { sku: 'PROD006', name: 'Cooking Oil (1L)', sold: 210, revenue: 52500, profit: 12250 },
  ];

  const totalSales = dailyData.reduce((sum, d) => sum + d.sales, 0);
  const totalTransactions = dailyData.reduce((sum, d) => sum + d.transactions, 0);
  const totalProfit = dailyData.reduce((sum, d) => sum + d.profit, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600 mt-1">View detailed business reports</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Total Sales</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">KES {totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Total Transactions</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalTransactions}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Total Profit</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">KES {totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Avg Transaction</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">KES {Math.round(totalSales / totalTransactions).toLocaleString()}</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Report Type</h2>
        <div className="flex flex-wrap gap-4">
          {['daily', 'category', 'products'].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                reportType === type
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type === 'daily' && 'Daily Sales'}
              {type === 'category' && 'By Category'}
              {type === 'products' && 'Top Products'}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Sales Report */}
      {reportType === 'daily' && (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Transactions</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Avg Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {dailyData.map((day) => (
                <tr key={day.date} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{day.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-semibold">
                    KES {day.sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{day.transactions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    KES {day.avgTransaction.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                    KES {day.profit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Report */}
      {reportType === 'category' && (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Items Sold</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Margin %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {categoryData.map((cat) => (
                <tr key={cat.category} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{cat.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-semibold">
                    KES {cat.sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{cat.items}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                    KES {cat.profit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {((cat.profit / cat.sales) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Top Products Report */}
      {reportType === 'products' && (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Sold</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {topProducts.map((prod) => (
                <tr key={prod.sku} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{prod.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{prod.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{prod.sold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-semibold">
                    KES {prod.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                    KES {prod.profit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
