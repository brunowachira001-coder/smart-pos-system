import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DateRangeFilter, { getDateRange, formatDateLocal } from '../components/DateRangeFilter';

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

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priceType, setPriceType] = useState('retail'); // retail or wholesale only
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Track the current date to detect changes
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());

  // Update startDate and endDate when dateRange changes
  useEffect(() => {
    const { startDate: start, endDate: end } = getDateRange(dateRange);
    
    if (start && end) {
      setStartDate(formatDateLocal(start));
      setEndDate(formatDateLocal(end));
    } else {
      // For 'all', clear the date range
      setStartDate('');
      setEndDate('');
    }
  }, [dateRange]);

  useEffect(() => {
    fetchStats(true); // Initial load with loading spinner
  }, [dateRange, priceType]);

  // Auto-refresh every 30 seconds (silent, no loading spinner)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats(false); // Background refresh without loading spinner
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [dateRange, priceType]);

  // Check for date change every 10 seconds and refresh data immediately
  useEffect(() => {
    const checkDateChange = () => {
      const now = new Date();
      const newDate = now.toDateString();
      
      // If the date has changed, refresh data immediately
      if (newDate !== currentDate) {
        console.log('Date changed from', currentDate, 'to', newDate, '- refreshing dashboard data...');
        setCurrentDate(newDate);
        fetchStats(false); // Silent refresh when date changes
      }
    };

    // Check every 10 seconds for date changes
    const interval = setInterval(checkDateChange, 10000);

    return () => clearInterval(interval);
  }, [currentDate, dateRange, priceType]);

  const fetchStats = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      // Add timestamp and date to force cache busting and help with debugging
      const timestamp = new Date().getTime();
      const currentDateStr = new Date().toISOString();
      console.log('Fetching dashboard stats at:', currentDateStr);
      console.log('Date range:', dateRange, 'Price type:', priceType);
      
      const response = await fetch(`/api/dashboard/comprehensive-stats?range=${dateRange}&priceType=${priceType}&t=${timestamp}&clientDate=${encodeURIComponent(currentDateStr)}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();

      console.log('Dashboard API Response:', data);
      console.log('Server Time:', data.serverTime);
      console.log('Today Net Revenue:', data.data?.todayNetRevenue);
      console.log('Chart Data:', data.data?.chartData);

      if (data.success) {
        setStats(data.data);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const renderChart = () => {
    const chartData = stats?.chartData || [];

    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm">
          No transaction data available
        </div>
      );
    }

    const scale = 140000;
    const yLabels = [140000, 105000, 70000, 35000, 0];

    const formatCurrency = (val: number) => {
      if (val === 0) return 'KSH 0';
      return `KSH ${(val / 1000).toFixed(0)}k`;
    };

    // Very tight spacing like screenshot - approximately 6-8px per data point
    const pointSpacing = 7;
    const svgWidth = Math.max(800, chartData.length * pointSpacing);
    const svgHeight = 260;
    const padding = { top: 10, right: 20, bottom: 35, left: 70 }; // More bottom space for x-axis
    const plotHeight = svgHeight - padding.top - padding.bottom;
    const plotWidth = svgWidth - padding.left - padding.right;

    const getY = (value: number) => padding.top + plotHeight - (value / scale) * plotHeight;
    const getX = (index: number) => {
      if (chartData.length === 1) return padding.left + plotWidth / 2;
      return padding.left + (index / (chartData.length - 1)) * plotWidth;
    };

    const handleMouseEnter = (index: number) => setHoveredIndex(index);
    const handleMouseLeave = () => setHoveredIndex(null);

    return (
      <div className="flex flex-col h-full relative">
        <div className="flex flex-1">
          {/* Y-axis labels */}
          <div className="w-16 flex flex-col justify-between text-sm text-[var(--text-secondary)] pr-2 flex-shrink-0" style={{ paddingTop: '10px', paddingBottom: '35px' }}>
            {yLabels.map((label, i) => (
              <span key={i} className="text-right leading-none">{formatCurrency(label)}</span>
            ))}
          </div>

          {/* Chart SVG */}
          <div className="flex-1 overflow-x-auto relative">
            <svg width={svgWidth} height={svgHeight} style={{ minWidth: '100%' }}>
              {/* Dotted grid lines */}
              {yLabels.map((label, i) => (
                <line
                  key={`grid-${i}`}
                  x1={padding.left}
                  y1={getY(label)}
                  x2={svgWidth - padding.right}
                  y2={getY(label)}
                  stroke="currentColor"
                  strokeOpacity="0.15"
                  strokeDasharray="3,3"
                  strokeWidth="1"
                />
              ))}

              {/* Gross Sales - Green line with dots */}
              <polyline 
                points={chartData.map((d, i) => `${getX(i)},${getY(d.gross)}`).join(' ')}
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2" 
                opacity="0.9"
              />
              {chartData.map((data, i) => (
                <circle 
                  key={`gross-dot-${i}`}
                  cx={getX(i)} 
                  cy={getY(data.gross)} 
                  r="3.5" 
                  fill="#10b981" 
                  opacity="0.95"
                />
              ))}

              {/* Net Sales - Lighter green line with dots */}
              <polyline 
                points={chartData.map((d, i) => `${getX(i)},${getY(d.net)}`).join(' ')}
                fill="none" 
                stroke="#34d399" 
                strokeWidth="2" 
                opacity="0.85"
              />
              {chartData.map((data, i) => (
                <circle 
                  key={`net-dot-${i}`}
                  cx={getX(i)} 
                  cy={getY(data.net)} 
                  r="3.5" 
                  fill="#34d399" 
                  opacity="0.9"
                />
              ))}

              {/* Expenses - Red line with dots */}
              <polyline 
                points={chartData.map((d, i) => `${getX(i)},${getY(d.expenses)}`).join(' ')}
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="2" 
                opacity="0.95"
              />
              {chartData.map((data, i) => (
                <circle 
                  key={`expense-dot-${i}`}
                  cx={getX(i)} 
                  cy={getY(data.expenses)} 
                  r="3" 
                  fill="#ef4444" 
                  opacity="0.95"
                />
              ))}

              {/* Verified Profit - Blue line with dots */}
              <polyline 
                points={chartData.map((d, i) => `${getX(i)},${getY(d.profit)}`).join(' ')}
                fill="none" 
                stroke="#60a5fa" 
                strokeWidth="2.5" 
                opacity="0.95"
              />
              {chartData.map((data, i) => (
                <circle 
                  key={`profit-dot-${i}`}
                  cx={getX(i)} 
                  cy={getY(data.profit)} 
                  r="4" 
                  fill="#60a5fa" 
                  opacity="0.95"
                />
              ))}

              {/* X-axis dates positioned below chart */}
              <g>
                {chartData.map((item, i) => {
                  const showEvery = Math.max(1, Math.floor(chartData.length / 9));
                  if (i % showEvery === 0 || i === chartData.length - 1) {
                    return (
                      <text
                        key={`date-${i}`}
                        x={getX(i)}
                        y={svgHeight - 5}
                        textAnchor="middle"
                        fontSize="11"
                        fill="var(--text-secondary)"
                        opacity="0.8"
                      >
                        {item.date}
                      </text>
                    );
                  }
                  return null;
                })}
              </g>

              {/* Invisible hover areas */}
              {chartData.map((data, i) => (
                <rect
                  key={`hover-${i}`}
                  x={getX(i) - 10}
                  y={padding.top}
                  width={20}
                  height={plotHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => handleMouseEnter(i)}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </svg>

            {/* Tooltip */}
            {hoveredIndex !== null && (
              <div 
                className="absolute bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-3 shadow-lg text-xs z-10"
                style={{
                  left: `${Math.min(getX(hoveredIndex) + 15, svgWidth - 200)}px`,
                  top: '10px',
                  pointerEvents: 'none'
                }}
              >
                <div className="font-semibold mb-2 text-[var(--text-primary)]">{chartData[hoveredIndex].date}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[var(--text-secondary)]">Gross: KSH {chartData[hoveredIndex].gross.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-[var(--text-secondary)]">Net: KSH {chartData[hoveredIndex].net.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-[var(--text-secondary)]">Expenses: KSH {chartData[hoveredIndex].expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-[var(--text-secondary)]">Profit: KSH {chartData[hoveredIndex].profit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
            <select 
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
              className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)]"
            >
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
            </select>
            <DateRangeFilter 
              value={dateRange} 
              onChange={setDateRange}
              startDate={startDate}
              endDate={endDate}
              onDateChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
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
              Potential profit from inventory at {priceType} prices
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
                 "Today's Net Revenue"}
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
                <span className="text-emerald-500">KSH {stats?.todayNetRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Inventory & Expenses */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Today's Expenses */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--text-secondary)]">
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
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => router.push('/expenses')}
                className="flex-1 px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-xs hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
              >
                ➕ Add
              </button>
              <button
                onClick={() => router.push('/expenses')}
                className="flex-1 px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-xs hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
              >
                👁 View
              </button>
            </div>
          </div>

          {/* Total Inventory Value (Cost) */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--text-secondary)]">Total Inventory Value (Cost)</p>
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
              <p className="text-xs text-[var(--text-secondary)]">Total Inventory Value (Selling)</p>
              <span className="text-blue-500">💎</span>
            </div>
            <p className="text-3xl font-bold text-blue-500 mb-2">
              KSH {stats?.inventoryValueSelling.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Current value at {priceType} price
            </p>
          </div>

          {/* Total Units in Stock */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--text-secondary)]">Total Units in Stock</p>
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
              <p className="text-xs text-[var(--text-secondary)]">Product Categories</p>
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
              <p className="text-xs text-[var(--text-secondary)]">Outstanding Debt</p>
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
              <p className="text-xs text-[var(--text-secondary)]">Low Stock Alerts</p>
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
              <p className="text-xs text-[var(--text-secondary)]">Pricing Data Audit</p>
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
              className="mt-3 w-full px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
            >
              View Issues
            </button>
          </div>
        </div>

        {/* Sales & Profit Trend Chart - Candlestick Style */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Sales & Profit Trend</h2>
          </div>

          {/* Chart Area */}
          <div className="relative bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] p-4" style={{ height: '300px' }}>
            {renderChart()}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500"></div>
              <span className="text-[var(--text-secondary)]">Gross Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400"></div>
              <span className="text-[var(--text-secondary)]">Net Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span className="text-[var(--text-secondary)]">Expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-400"></div>
              <span className="text-[var(--text-secondary)]">Verified Profit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
