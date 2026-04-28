import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface DashboardData {
  todaySales: number;
  todayTransactions: number;
  lowStockItems: number;
  totalCustomers: number;
  todayProfit: number;
  todayTax: number;
  avgTransaction: number;
  totalProducts: number;
  inStockProducts: number;
  recentTransactions: Array<{
    id: string;
    number: string;
    customer: string;
    items: number;
    total: number;
    date: string;
  }>;
}

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    loadDashboard();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // Force fresh data with timestamp and build version
      const timestamp = Date.now();
      const buildVersion = '20260428-v2'; // Update this to force cache bust
      const response = await fetch(`/api/dashboard/stats?v=${timestamp}&build=${buildVersion}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setData({
          todaySales: result.data.sales.totalSales || 0,
          todayTransactions: result.data.sales.transactionCount || 0,
          lowStockItems: result.data.inventory.lowStockCount || 0,
          totalCustomers: result.data.customers.totalCustomers || 0,
          todayProfit: result.data.sales.totalProfit || 0,
          todayTax: result.data.sales.totalTax || 0,
          avgTransaction: result.data.sales.averageTransaction || 0,
          totalProducts: result.data.inventory.totalProducts || 0,
          inStockProducts: result.data.inventory.inStockCount || 0,
          recentTransactions: result.data.recentTransactions.map((t: any) => ({
            id: t.id,
            number: t.transactionNumber,
            customer: t.customer,
            items: t.itemCount,
            total: t.total,
            date: t.createdAt
          }))
        });
        setLastUpdate(new Date().toLocaleTimeString());
        setError('');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)] text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-8 max-w-md">
          <div className="text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2 text-center">Error Loading Dashboard</h2>
          <p className="text-red-600 dark:text-red-400 mb-4 text-center">{error}</p>
          <button
            onClick={loadDashboard}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
              📊 Business Dashboard
            </h1>
            <p className="text-[var(--text-secondary)]">
              Live data from Supabase • Last updated: {lastUpdate}
            </p>
            <div className="mt-2 inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
              ✓ Connected to Database
            </div>
          </div>
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] disabled:opacity-50"
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Sales */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">💰</div>
              <div className="text-emerald-100 text-sm font-medium">TODAY</div>
            </div>
            <p className="text-emerald-100 text-sm mb-1">Total Sales</p>
            <p className="text-4xl font-bold">KES {data?.todaySales.toLocaleString()}</p>
          </div>

          {/* Transactions */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">🛒</div>
              <div className="text-blue-100 text-sm font-medium">TODAY</div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Transactions</p>
            <p className="text-4xl font-bold">{data?.todayTransactions}</p>
          </div>

          {/* Low Stock */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">📦</div>
              <div className="text-orange-100 text-sm font-medium">ALERT</div>
            </div>
            <p className="text-orange-100 text-sm mb-1">Low Stock Items</p>
            <p className="text-4xl font-bold">{data?.lowStockItems}</p>
          </div>

          {/* Customers */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">👥</div>
              <div className="text-purple-100 text-sm font-medium">TOTAL</div>
            </div>
            <p className="text-purple-100 text-sm mb-1">Customers</p>
            <p className="text-4xl font-bold">{data?.totalCustomers}</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[var(--text-secondary)] font-medium">Today's Profit</p>
              <span className="text-2xl">💵</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              KES {data?.todayProfit.toLocaleString()}
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[var(--text-secondary)] font-medium">Tax Collected</p>
              <span className="text-2xl">🧾</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              KES {data?.todayTax.toLocaleString()}
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[var(--text-secondary)] font-medium">Avg Transaction</p>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              KES {data?.avgTransaction.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              🕒 Recent Transactions
            </h2>
            <button
              onClick={() => router.push('/transactions')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View All →
            </button>
          </div>

          {!data?.recentTransactions || data.recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-[var(--text-secondary)] text-lg">No transactions yet</p>
              <p className="text-[var(--text-secondary)] text-sm mt-2">
                Start selling to see transactions here
              </p>
              <button
                onClick={() => router.push('/pos')}
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                Go to POS
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text-primary)] mb-1">
                      {txn.number}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {txn.customer} • {txn.items} items • {new Date(txn.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">
                      KES {txn.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              📦 Inventory Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Total Products</span>
                <span className="text-2xl font-bold text-[var(--text-primary)]">
                  {data?.totalProducts}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">In Stock</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {data?.inStockProducts}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Low Stock</span>
                <span className="text-2xl font-bold text-orange-600">
                  {data?.lowStockItems}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/inventory')}
              className="mt-4 w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium"
            >
              Manage Inventory
            </button>
          </div>

          {/* Low Stock Alert */}
          {data && data.lowStockItems > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-xl p-6">
              <div className="flex items-start">
                <div className="text-5xl mr-4">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-orange-900 dark:text-orange-300 mb-2">
                    Low Stock Alert!
                  </h3>
                  <p className="text-orange-800 dark:text-orange-400 mb-4">
                    You have {data.lowStockItems} product(s) running low on stock. 
                    Reorder soon to avoid stockouts.
                  </p>
                  <button
                    onClick={() => router.push('/inventory')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                  >
                    View Low Stock Items →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {(!data || data.lowStockItems === 0) && (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                ⚡ Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/pos')}
                  className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-left"
                >
                  🛒 New Sale
                </button>
                <button
                  onClick={() => router.push('/inventory')}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-left"
                >
                  📦 Manage Inventory
                </button>
                <button
                  onClick={() => router.push('/customers')}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-left"
                >
                  👥 View Customers
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
