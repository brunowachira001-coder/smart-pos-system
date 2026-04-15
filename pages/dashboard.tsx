import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [reportRes, inventoryRes, customersRes, transactionsRes] = await Promise.all([
        axios.get('/api/reports/summary?period=today'),
        axios.get('/api/inventory/list'),
        axios.get('/api/customers/list'),
        axios.get('/api/transactions/list?limit=5'),
      ]);

      setStats({
        sales: reportRes.data.data.summary,
        inventory: inventoryRes.data.data,
        customers: customersRes.data.data,
        recentTransactions: transactionsRes.data.data,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const lowStockCount = stats.inventory.filter((item: any) => item.status === 'LOW_STOCK').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back! Here's your business overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Today's Sales</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                KES {stats.sales.totalSales.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Transactions</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.sales.transactionCount}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Low Stock Items</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{lowStockCount}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Customers</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.customers.length}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Transactions</h2>
        {stats.recentTransactions.length === 0 ? (
          <p className="text-slate-600">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {stats.recentTransactions.map((txn: any) => (
              <div key={txn.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{txn.transactionNumber}</p>
                  <p className="text-sm text-slate-600">{txn.customer} • {txn.itemCount} items</p>
                </div>
                <p className="text-lg font-bold text-emerald-600">KES {txn.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">⚠️</div>
            <div>
              <h3 className="font-bold text-orange-900">Low Stock Alert</h3>
              <p className="text-orange-700 mt-1">
                You have {lowStockCount} product(s) with low stock levels. Consider reordering soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Profit Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Profit:</span>
              <span className="font-bold text-emerald-600">KES {stats.sales.totalProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tax Collected:</span>
              <span className="font-bold text-orange-600">KES {stats.sales.totalTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Avg Transaction:</span>
              <span className="font-bold text-blue-600">
                KES {stats.sales.averageTransaction.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Inventory Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Products:</span>
              <span className="font-bold text-slate-900">{stats.inventory.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">In Stock:</span>
              <span className="font-bold text-emerald-600">
                {stats.inventory.filter((i: any) => i.status === 'OK').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Low Stock:</span>
              <span className="font-bold text-orange-600">{lowStockCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
