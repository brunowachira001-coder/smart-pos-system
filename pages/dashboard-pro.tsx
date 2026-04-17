import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DateRangeFilter, { getDateRange } from '../components/DateRangeFilter';

export default function DashboardPro() {
  const router = useRouter();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPricingAudit, setShowPricingAudit] = useState(false);
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState({
    verifiedProfit: 1626987.04,
    potentialProfit: 9244459.94,
    grossRevenue: 10041182.94,
    netRevenue: 1650.00,
    expenses: 0.00,
    inventoryValueCost: 19131430.06,
    inventoryValueSelling: 28325905.00,
    totalUnits: 165984,
    productCategories: 59,
    outstandingDebt: 1500.00,
    lowStockItems: 4
  });

  const [revenueBreakdown, setRevenueBreakdown] = useState([
    { label: 'Gross Revenue', value: 1650.00 },
    { label: 'Returns', value: -0.00 },
    { label: 'Business Expenses', value: -0.00 },
    { label: 'Personal Expenses', value: -0.00 },
    { label: 'Net Revenue (All)', value: 1650.00 }
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">A summary of your business performance</p>
          </div>
          <div className="flex items-center gap-4">
            <select className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm">
              <option>Retail</option>
              <option>Wholesale</option>
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
            <button className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm hover:bg-[var(--bg-tertiary)]">
              📄 Export Summary
            </button>
          </div>
        </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* All Time Verified Profit */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-xs font-medium">All Time Verified Profit</p>
            <span className="text-emerald-500">📈</span>
          </div>
          <p className="text-2xl font-semibold text-emerald-500">KSH {stats.verifiedProfit.toLocaleString()}</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Retail</span>
              <span className="text-[var(--text-primary)]">KSH 147350.34</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Wholesale</span>
              <span className="text-[var(--text-primary)]">KSH 1479636.70</span>
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-4">✓ Strict validation applied • Excludes invalid pricing</p>
        </div>

        {/* Potential Profit */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-xs font-medium">Potential Profit</p>
            <span className="text-emerald-500">📈</span>
          </div>
          <p className="text-2xl font-semibold">KSH {stats.potentialProfit.toLocaleString()}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Potential profit from current inventory at retail prices
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-4">
            ⚠ Profit is reduced due to pricing issues
          </p>
        </div>

        {/* Gross Sales Revenue */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-xs font-medium">Gross Sales Revenue</p>
            <span className="text-emerald-500">📈</span>
          </div>
          <p className="text-2xl font-semibold">KSH {stats.grossRevenue.toLocaleString()}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Wholesale: KSH 5872270 • Retail: KSH 944662.24
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-4">
            Total sales before returns & expenses
          </p>
        </div>

        {/* Today's Net Revenue */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-xs font-medium">Today's Net Revenue</p>
            <span className="text-emerald-500">📈</span>
          </div>
          <p className="text-2xl font-semibold text-emerald-500">KSH {stats.netRevenue.toFixed(2)}</p>
          <div className="mt-4 space-y-2 bg-[var(--bg-primary)] rounded-lg p-3">
            {revenueBreakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">{item.label}</span>
                <span className={item.value < 0 ? 'text-red-500' : 'text-[var(--text-primary)]'}>
                  {item.value < 0 ? '-' : ''}KSH {Math.abs(item.value).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Product Categories */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-xs font-medium">Product Categories</p>
            <span className="text-blue-400">📦</span>
          </div>
          <p className="text-3xl font-semibold">{stats.productCategories}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Number of unique active categories</p>
        </div>

        {/* Outstanding Debt */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-xs font-medium">Outstanding Debt</p>
            <span className="text-orange-400">💳</span>
          </div>
          <p className="text-3xl font-semibold">KSH {stats.outstandingDebt.toFixed(2)}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">2 customers with debt</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-xs font-medium">Low Stock Alerts</p>
            <span className="text-yellow-400">⚠️</span>
          </div>
          <p className="text-3xl font-semibold text-yellow-400">{stats.lowStockItems}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Items below minimum stock</p>
        </div>
      </div>

      {/* Sales & Profit Trend + Pricing Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales & Profit Trend Chart */}
        <div className="lg:col-span-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Sales & Profit Trend</h2>
          <div className="h-64 bg-[var(--bg-primary)] rounded-lg p-4 relative">
            <div className="absolute inset-0 flex items-end justify-around p-4">
              {[45, 38, 62, 48, 72, 55, 68, 52, 78, 65, 58, 70].map((height, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1" style={{ width: '7%' }}>
                  <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${height}%` }}></div>
                  <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height * 0.7}%` }}></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
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

        {/* Pricing Data Audit */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Pricing Data Audit</h2>
            <button onClick={() => setShowPricingAudit(!showPricingAudit)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              👁️
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Total Products:</span>
              <span className="text-[var(--text-primary)] font-semibold">605</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Valid Pricing:</span>
              <span className="text-emerald-500 font-semibold">590</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Issues Found:</span>
              <span className="text-red-500 font-semibold">15</span>
            </div>
          </div>
          
          {showPricingAudit && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-900 mb-2">Issues Found:</p>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• 4 products missing cost price</li>
                <li>• 3 products with zero selling price</li>
                <li>• 12 products selling below cost</li>
                <li>• 4 products with unrealistic markup</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Expenses */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-xs font-medium">Today's Expenses</p>
            <span className="text-red-500">📉</span>
          </div>
          <p className="text-2xl font-semibold text-red-500">KSH {stats.expenses.toFixed(2)}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">No expenses recorded today</p>
          <button className="mt-4 text-sm text-emerald-500 hover:text-emerald-400">+ Add</button>
        </div>

        {/* Total Inventory Value (Cost) */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-xs font-medium">Total Inventory Value (Cost)</p>
            <span className="text-blue-500">💰</span>
          </div>
          <p className="text-2xl font-semibold">KSH {stats.inventoryValueCost.toLocaleString()}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Current value at buying price</p>
        </div>

        {/* Total Inventory Value (Selling) */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-xs font-medium">Total Inventory Value (Selling)</p>
            <span className="text-purple-500">💵</span>
          </div>
          <p className="text-2xl font-semibold">KSH {stats.inventoryValueSelling.toLocaleString()}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Current value at retail price</p>
        </div>

        {/* Total Units in Stock */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[var(--text-secondary)] text-xs font-medium">Total Units in Stock</p>
            <span className="text-orange-500">📦</span>
          </div>
          <p className="text-3xl font-semibold">{stats.totalUnits.toLocaleString()}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Total units for all products</p>
        </div>
      </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Generate Report</h2>
            <div className="space-y-3">
              <button 
                onClick={() => { alert('Sales report generated!'); setShowReportModal(false); }}
                className="w-full px-4 py-3 text-left bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]"
              >
                <p className="font-semibold">Sales Report</p>
                <p className="text-sm text-[var(--text-secondary)]">Download sales summary</p>
              </button>
              <button 
                onClick={() => { alert('Inventory report generated!'); setShowReportModal(false); }}
                className="w-full px-4 py-3 text-left bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]"
              >
                <p className="font-semibold">Inventory Report</p>
                <p className="text-sm text-[var(--text-secondary)]">Download inventory status</p>
              </button>
              <button 
                onClick={() => { alert('Customer report generated!'); setShowReportModal(false); }}
                className="w-full px-4 py-3 text-left bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]"
              >
                <p className="font-semibold">Customer Report</p>
                <p className="text-sm text-[var(--text-secondary)]">Download customer data</p>
              </button>
            </div>
            <button
              onClick={() => setShowReportModal(false)}
              className="w-full mt-4 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-tertiary)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
