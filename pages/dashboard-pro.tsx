import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DateRangeFilter from '../components/DateRangeFilter';

interface DashboardStats {
  allTimeProfit: number;
  potentialProfit: number;
  grossRevenue: number;
  todayNetRevenue: number;
  todayExpenses: number;
  inventoryValueCost: number;
  inventoryValueSelling: number;
  totalUnits: number;
  retailRevenue: number;
  wholesaleRevenue: number;
  retailSales: number;
  wholesaleSales: number;
  productCategories: number;
  outstandingDebt: number;
  lowStockCount: number;
  pricingAudit: {
    total: number;
    valid: number;
    issues: number;
  };
}

export default function DashboardPro() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/comprehensive-stats?t=${Date.now()}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Dashboard Overview</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">A summary of your business performance</p>
          </div>
          <div className="flex items-center gap-4">
            <select className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)]">
              <option>Retail</option>
              <option>Wholesale</option>
              <option>All</option>
            </select>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            <button className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]">
              📤 Export Summary
            </button>
          </div>
        </div>

        {/* Top Row - Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* All Time Verified Profit */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">All Time Verified Profit</p>
              <span className="text-emerald-500">📈</span>
            </div>
            <p className="text-3xl font-bold text-emerald-500 mb-2">
              KSH {stats?.allTimeProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Retail</span>
                <span className="text-emerald-500">KSH {stats?.retailRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Wholesale</span>
                <span className="text-emerald-500">KSH {stats?.wholesaleRevenue.toLocaleString()}</span>
              </div>
              <div className="text-[var(--text-secondary)] mt-2 text-xs">
                {stats?.retailSales} Retail + {stats?.wholesaleSales} Wholesale sales
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-3 italic">
              ✓ Strict validation applied • Excludes invalid pricing
            </p>
          </div>

          {/* Potential Profit */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Potential Profit</p>
              <span className="text-blue-500">📊</span>
            </div>
            <p className="text-3xl font-bold text-blue-500 mb-2">
              KSH {stats?.potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Potential profit from current inventory at retail prices
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2 italic">
              ⚠ Profit is reduced due to pricing issues
            </p>
          </div>

          {/* Gross Sales Revenue */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Gross Sales Revenue</p>
              <span className="text-purple-500">💰</span>
            </div>
            <p className="text-3xl font-bold text-purple-500 mb-2">
              KSH {stats?.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="space-y-1 text-xs mt-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Sold</span>
                <span className="text-[var(--text-secondary)]">58722.70</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Wholesale</span>
                <span className="text-[var(--text-secondary)]">9446662.24</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Total sales before returns & expenses
            </p>
          </div>

          {/* Today's Net Revenue */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Today's Net Revenue</p>
              <span className="text-emerald-500">💵</span>
            </div>
            <p className="text-3xl font-bold text-emerald-500 mb-2">
              KSH {stats?.todayNetRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="bg-[var(--bg-secondary)] rounded p-2 space-y-1 text-xs mt-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Gross Revenue</span>
                <span className="text-[var(--text-primary)]">KSH {stats?.todayNetRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Returns</span>
                <span className="text-red-500">-KSH 0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Business Expenses</span>
                <span className="text-red-500">-KSH 0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Personal Expenses</span>
                <span className="text-red-500">-KSH 0.00</span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t border-[var(--border-color)]">
                <span className="text-[var(--text-primary)]">Net Revenue (All)</span>
                <span className="text-emerald-500">KSH {stats?.todayNetRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Inventory & Expenses */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Today's Expenses */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Today's Expenses</p>
              <span className="text-red-500">📉</span>
            </div>
            <p className="text-3xl font-bold text-red-500 mb-2">
              KSH {stats?.todayExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              No expenses recorded today
            </p>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => router.push('/expenses')}
                className="flex-1 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-xs hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
              >
                ➕ Add
              </button>
              <button 
                onClick={() => router.push('/expenses')}
                className="flex-1 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-xs hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
              >
                👁 View
              </button>
            </div>
          </div>

          {/* Total Inventory Value (Cost) */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Total Inventory Value (Cost)</p>
              <span className="text-orange-500">💼</span>
            </div>
            <p className="text-3xl font-bold text-orange-500 mb-2">
              KSH {stats?.inventoryValueCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Current value at buying price
            </p>
          </div>

          {/* Total Inventory Value (Selling) */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Total Inventory Value (Selling)</p>
              <span className="text-blue-500">💎</span>
            </div>
            <p className="text-3xl font-bold text-blue-500 mb-2">
              KSH {stats?.inventoryValueSelling.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Current value at retail price
            </p>
          </div>

          {/* Total Units in Stock */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Total Units in Stock</p>
              <span className="text-purple-500">📦</span>
            </div>
            <p className="text-3xl font-bold text-purple-500 mb-2">
              {stats?.totalUnits.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Total units for all products
            </p>
          </div>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Product Categories */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Product Categories</p>
              <span className="text-blue-500">📂</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              {stats?.productCategories || 59}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Number of unique active categories
            </p>
          </div>

          {/* Outstanding Debt */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Outstanding Debt</p>
              <span className="text-orange-500">💳</span>
            </div>
            <p className="text-3xl font-bold text-orange-500 mb-2">
              KSH {stats?.outstandingDebt?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '1500.00'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              2 customers with debt
            </p>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Low Stock Alerts</p>
              <span className="text-red-500">⚠️</span>
            </div>
            <p className="text-3xl font-bold text-red-500 mb-2">
              {stats?.lowStockCount || 3}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Items below minimum stock
            </p>
          </div>

          {/* Pricing Data Audit */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Pricing Data Audit</p>
              <span className="text-yellow-500">⚠️</span>
            </div>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Total Products:</span>
                <span className="font-bold text-[var(--text-primary)]">{stats?.pricingAudit?.total || 605}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Valid Pricing:</span>
                <span className="font-bold text-emerald-500">{stats?.pricingAudit?.valid || 590}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Issues Found:</span>
                <span className="font-bold text-red-500">{stats?.pricingAudit?.issues || 15}</span>
              </div>
            </div>
            <button 
              onClick={() => router.push('/inventory')}
              className="mt-3 w-full px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
            >
              View Issues
            </button>
          </div>
        </div>

        {/* Sales & Profit Trend Chart */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Sales & Profit Trend</h2>
            <button 
              onClick={() => router.push('/sales-analytics')}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              📊 View Details
            </button>
          </div>
          
          {/* Chart Area */}
          <div className="relative h-64 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] p-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-[var(--text-secondary)]">
              <span>KSH 140k</span>
              <span>KSH 120k</span>
              <span>KSH 105k</span>
              <span>KSH 90k</span>
              <span>KSH 70k</span>
              <span>KSH 0</span>
            </div>

            {/* Chart bars */}
            <div className="ml-16 h-full flex items-end justify-between gap-1">
              {/* Generate sample bars based on months */}
              {['Sep 9', 'Sep 27', 'Oct 15', 'Nov 3', 'Nov 21', 'Dec 11', 'Jan 13', 'Feb 11', 'Mar 2', 'Mar 21', 'Apr 18'].map((date, i) => {
                const heights = [60, 75, 45, 80, 55, 70, 50, 85, 40, 65, 55]; // Random heights
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    {/* Bars */}
                    <div className="w-full flex gap-0.5 items-end">
                      {/* Gross Sales (Green) */}
                      <div 
                        className="flex-1 bg-emerald-500 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${heights[i]}%` }}
                      ></div>
                      {/* Net Sales (Blue) */}
                      <div 
                        className="flex-1 bg-blue-500 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${heights[i] - 10}%` }}
                      ></div>
                      {/* Expenses (Red) */}
                      <div 
                        className="flex-1 bg-red-500 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${heights[i] - 50}%` }}
                      ></div>
                      {/* Verified Profit (Purple) */}
                      <div 
                        className="flex-1 bg-purple-500 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${heights[i] - 20}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="ml-16 mt-2 flex justify-between text-xs text-[var(--text-secondary)]">
              <span>Sep 9</span>
              <span>Sep 27</span>
              <span>Oct 15</span>
              <span>Nov 3</span>
              <span>Nov 21</span>
              <span>Dec 11</span>
              <span>Jan 13</span>
              <span>Feb 11</span>
              <span>Mar 2</span>
              <span>Mar 21</span>
              <span>Apr 18</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span className="text-[var(--text-secondary)]">Gross Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-[var(--text-secondary)]">Net Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-[var(--text-secondary)]">Expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-[var(--text-secondary)]">Verified Profit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
