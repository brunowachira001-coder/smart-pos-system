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
  chartData?: Array<{
    date: string;
    gross: number;
    net: number;
    expenses: number;
    profit: number;
  }>;
}

export default function DashboardPro() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Add timestamp to force cache bypass
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/dashboard/comprehensive-stats?range=${dateRange}&t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      
      console.log('Dashboard API Response:', data);
      console.log('Server Time:', data.serverTime);
      console.log('Chart Data:', data.data?.chartData);
      
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
              <p className="text-sm text-[var(--text-secondary)]">
                {dateRange === 'all' ? 'All Time Verified Profit' : 
                 dateRange === 'today' ? "Today's Verified Profit" :
                 dateRange === 'yesterday' ? "Yesterday's Verified Profit" :
                 dateRange === 'last7days' ? 'Last 7 Days Verified Profit' :
                 dateRange === 'last30days' ? 'Last 30 Days Verified Profit' :
                 dateRange === 'thisMonth' ? 'This Month Verified Profit' :
                 dateRange === 'lastMonth' ? 'Last Month Verified Profit' :
                 dateRange === 'thisYear' ? 'This Year Verified Profit' :
                 'Verified Profit'}
              </p>
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
              <p className="text-sm text-[var(--text-secondary)]">
                {dateRange === 'all' ? 'Gross Sales Revenue' :
                 dateRange === 'today' ? "Today's Gross Sales" :
                 dateRange === 'yesterday' ? "Yesterday's Gross Sales" :
                 'Gross Sales Revenue'}
              </p>
              <span className="text-purple-500">💰</span>
            </div>
            <p className="text-3xl font-bold text-purple-500 mb-2">
              KSH {stats?.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="space-y-1 text-xs mt-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Retail</span>
                <span className="text-[var(--text-secondary)]">KSH {stats?.retailRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Wholesale</span>
                <span className="text-[var(--text-secondary)]">KSH {stats?.wholesaleRevenue.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Total sales before returns & expenses
            </p>
          </div>

          {/* Today's Net Revenue */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">
                {dateRange === 'today' ? "Today's Net Revenue" :
                 dateRange === 'yesterday' ? "Yesterday's Net Revenue" :
                 'Net Revenue'}
              </p>
              <span className="text-emerald-500">💵</span>
            </div>
            <p className="text-3xl font-bold text-emerald-500 mb-2">
              KSH {stats?.todayNetRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="bg-[var(--bg-secondary)] rounded p-2 space-y-1 text-xs mt-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Gross Revenue</span>
                <span className="text-[var(--text-primary)]">KSH {stats?.grossRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Returns</span>
                <span className="text-red-500">-KSH 0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Business Expenses</span>
                <span className="text-red-500">-KSH {stats?.todayExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Personal Expenses</span>
                <span className="text-red-500">-KSH 0.00</span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t border-[var(--border-color)]">
                <span className="text-[var(--text-primary)]">Net Revenue (All)</span>
                <span className="text-emerald-500">KSH {(stats?.grossRevenue - stats?.todayExpenses).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Inventory & Expenses */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Today's Expenses */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">
                {dateRange === 'today' ? "Today's Expenses" :
                 dateRange === 'yesterday' ? "Yesterday's Expenses" :
                 'Expenses'}
              </p>
              <span className="text-red-500">📉</span>
            </div>
            <p className="text-3xl font-bold text-red-500 mb-2">
              KSH {stats?.todayExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              {stats?.todayExpenses === 0 ? 'No expenses recorded' : 'Total expenses for selected period'}
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
              {stats?.productCategories || 0}
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
              KSH {stats?.outstandingDebt?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Total outstanding customer debt
            </p>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[var(--text-secondary)]">Low Stock Alerts</p>
              <span className="text-red-500">⚠️</span>
            </div>
            <p className="text-3xl font-bold text-red-500 mb-2">
              {stats?.lowStockCount || 0}
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
                <span className="font-bold text-[var(--text-primary)]">{stats?.pricingAudit?.total || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Valid Pricing:</span>
                <span className="font-bold text-emerald-500">{stats?.pricingAudit?.valid || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Issues Found:</span>
                <span className="font-bold text-red-500">{stats?.pricingAudit?.issues || 0}</span>
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
            {(() => {
              const chartData = stats?.chartData || [];
              
              console.log('=== CHART DEBUG ===');
              console.log('Chart Data Length:', chartData.length);
              console.log('Chart Data:', JSON.stringify(chartData, null, 2));
              console.log('Full Stats:', JSON.stringify(stats, null, 2));
              
              if (chartData.length === 0) {
                return (
                  <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm">
                    No transaction data available for selected period
                  </div>
                );
              }
              
              // Calculate max value for Y-axis scaling
              const maxValue = Math.max(
                ...chartData.map(d => Math.max(d.gross, d.net, d.expenses, d.profit)),
                100 // Lower minimum scale to handle small values
              );
              
              console.log('Max Value:', maxValue);
              
              // Use actual max value without rounding up too much
              const scale = maxValue * 1.1; // Add 10% padding
              const yLabels = [
                scale,
                scale * 0.8,
                scale * 0.6,
                scale * 0.4,
                scale * 0.2,
                0
              ];

              // Format currency - show exact values
              const formatCurrency = (val: number) => {
                if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
                if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
                return val.toFixed(0);
              };

              return (
                <>
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-[10px] text-[var(--text-secondary)]">
                    {yLabels.map((label, i) => (
                      <span key={i} className="text-right pr-1">{formatCurrency(label)}</span>
                    ))}
                  </div>

                  {/* Chart bars */}
                  <div className="ml-16 h-full flex items-end justify-between gap-2">
                    {chartData.map((data, i) => {
                      // Calculate heights as percentage of scale
                      const grossHeight = Math.max((data.gross / scale) * 100, 1);
                      const netHeight = Math.max((data.net / scale) * 100, 1);
                      const expensesHeight = Math.max((data.expenses / scale) * 100, 0.5);
                      const profitHeight = Math.max((data.profit / scale) * 100, 1);

                      console.log(`Bar ${i} (${data.date}):`, {
                        gross: data.gross,
                        grossHeight: `${grossHeight}%`,
                        net: data.net,
                        netHeight: `${netHeight}%`,
                        expenses: data.expenses,
                        expensesHeight: `${expensesHeight}%`,
                        profit: data.profit,
                        profitHeight: `${profitHeight}%`,
                        scale: scale
                      });

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative min-w-[30px]">
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded p-2 whitespace-nowrap z-10 shadow-lg">
                            <div className="font-bold mb-1">{data.date}</div>
                            <div className="text-emerald-400">Gross: KSH {data.gross.toFixed(2)}</div>
                            <div className="text-blue-400">Net: KSH {data.net.toFixed(2)}</div>
                            <div className="text-red-400">Expenses: KSH {data.expenses.toFixed(2)}</div>
                            <div className="text-purple-400">Profit: KSH {data.profit.toFixed(2)}</div>
                          </div>
                          
                          {/* Bars */}
                          <div className="w-full flex gap-0.5 items-end">
                            {/* Gross Sales (Green) */}
                            <div 
                              className="flex-1 bg-emerald-500 rounded-t transition-all hover:opacity-80"
                              style={{ height: `${grossHeight}%`, minHeight: '2px' }}
                              title={`Gross: KSH ${data.gross.toFixed(2)}`}
                            ></div>
                            {/* Net Sales (Blue) */}
                            <div 
                              className="flex-1 bg-blue-500 rounded-t transition-all hover:opacity-80"
                              style={{ height: `${netHeight}%`, minHeight: '2px' }}
                              title={`Net: KSH ${data.net.toFixed(2)}`}
                            ></div>
                            {/* Expenses (Red) */}
                            <div 
                              className="flex-1 bg-red-500 rounded-t transition-all hover:opacity-80"
                              style={{ height: `${expensesHeight}%`, minHeight: expensesHeight > 0 ? '2px' : '0px' }}
                              title={`Expenses: KSH ${data.expenses.toFixed(2)}`}
                            ></div>
                            {/* Verified Profit (Purple) */}
                            <div 
                              className="flex-1 bg-purple-500 rounded-t transition-all hover:opacity-80"
                              style={{ height: `${profitHeight}%`, minHeight: '2px' }}
                              title={`Profit: KSH ${data.profit.toFixed(2)}`}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* X-axis labels */}
                  <div className="ml-16 mt-2 flex justify-between text-[10px] text-[var(--text-secondary)]">
                    {chartData.map((data, i) => (
                      <span key={i} className="text-center flex-1">{data.date}</span>
                    ))}
                  </div>
                </>
              );
            })()}
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
