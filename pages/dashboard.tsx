import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Dashboard - Real-time business metrics
interface DashboardStats {
  sales: {
    totalSales: number;
    totalProfit: number;
    totalTax: number;
    transactionCount: number;
    averageTransaction: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    inStockCount: number;
  };
  customers: {
    totalCustomers: number;
  };
  recentTransactions: Array<{
    id: string;
    transactionNumber: string;
    customer: string;
    itemCount: number;
    total: number;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError('Failed to load dashboard data');
      }
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error || 'No data available'}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-[var(--text-secondary)] mt-1">Welcome back! Here's your business overview</p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Version: 2.0 (Real Data)</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-tertiary)] rounded-lg shadow border border-[var(--border-color)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Today's Sales</p>
              <p className="text-3xl font-bold text-emerald-500 mt-2">
                KSH {stats.sales.totalSales.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-[var(--bg-tertiary)] rounded-lg shadow border border-[var(--border-color)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Transactions</p>
              <p className="text-3xl font-bold text-blue-500 mt-2">{stats.sales.transactionCount}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-[var(--bg-tertiary)] rounded-lg shadow border border-[var(--border-color)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Low Stock Items</p>
              <p className="text-3xl font-bold text-orange-500 mt-2">{stats.inventory.lowStockCount}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>

        <div className="bg-[var(--bg-tertiary)] rounded-lg shadow border border-[var(--border-color)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Total Customers</p>
              <p className="text-3xl font-bold text-purple-500 mt-2">{stats.customers.totalCustomers}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[var(--bg-tertiary)] rounded-lg shadow border border-[var(--border-color)] p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Recent Transactions</h2>
        {stats.recentTransactions.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {stats.recentTransactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{txn.transactionNumber}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {txn.customer} • {txn.itemCount} items • {new Date(txn.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-lg font-bold text-emerald-500">KSH {txn.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {stats.inventory.lowStockCount > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">⚠️</div>
            <div>
              <h3 className="font-bold text-orange-900 dark:text-orange-300">Low Stock Alert</h3>
              <p className="text-orange-700 dark:text-orange-400 mt-1">
                You have {stats.inventory.lowStockCount} product(s) with low stock levels. Consider reordering soon.
              </p>
              <button
                onClick={() => router.push('/inventory')}
                className="mt-2 text-sm text-orange-800 dark:text-orange-300 hover:underline"
              >
                View Inventory →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-tertiary)] rounded-lg shadow border border-[var(--border-color)] p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Profit Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Total Profit:</span>
              <span className="font-bold text-emerald-500">KSH {stats.sales.totalProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Tax Collected:</span>
              <span className="font-bold text-orange-500">KSH {stats.sales.totalTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Avg Transaction:</span>
              <span className="font-bold text-blue-500">
                KSH {stats.sales.averageTransaction.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-tertiary)] rounded-lg shadow border border-[var(--border-color)] p-6">
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Inventory Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Total Products:</span>
              <span className="font-bold text-[var(--text-primary)]">{stats.inventory.totalProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">In Stock:</span>
              <span className="font-bold text-emerald-500">{stats.inventory.inStockCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Low Stock:</span>
              <span className="font-bold text-orange-500">{stats.inventory.lowStockCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
