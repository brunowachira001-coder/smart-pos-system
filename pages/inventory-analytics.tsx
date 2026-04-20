import React, { useState, useEffect } from 'react';
import DateRangeFilter from '../components/DateRangeFilter';

interface InventoryAnalytics {
  overview: {
    inventoryValueCost: string;
    inventoryValueSelling: string;
    potentialProfit: string;
    lowStockAlerts: number;
    totalReturns: number;
    pendingReturns: number;
    valueOfReturns: string;
    archivedItems: number;
  };
  lowStockItems: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    minimumStock: number;
  }>;
}

export default function InventoryAnalyticsPage() {
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('retail');
  const [useDemoData, setUseDemoData] = useState(false);

  const demoData: InventoryAnalytics = {
    overview: {
      inventoryValueCost: '19112750.36',
      inventoryValueSelling: '28294220.00',
      potentialProfit: '9181469.64',
      lowStockAlerts: 3,
      totalReturns: 109,
      pendingReturns: 7,
      valueOfReturns: '39899.02',
      archivedItems: 68
    },
    lowStockItems: [
      { id: '1', name: 'Stainless steel plate', sku: 'GEN-STA-00605', quantity: 0, minimumStock: 0 },
      { id: '2', name: 'Doffi 10kg', sku: 'GEN-DOF-00602', quantity: 0, minimumStock: 0 }
    ]
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateFilter, startDate, endDate, filterType]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('priceType', filterType);

      const response = await fetch(`/api/inventory-analytics/overview?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data);
        setUseDemoData(false);
      } else {
        setAnalytics(demoData);
        setUseDemoData(true);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(demoData);
      setUseDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-1">Inventory Analytics</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Insights into your stock, returns, and product value.
              {useDemoData && <span className="ml-2 text-amber-500">(Showing demo data)</span>}
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm"
            >
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
            </select>
            <DateRangeFilter 
              value={dateFilter}
              onChange={setDateFilter}
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[var(--text-secondary)]">Loading analytics...</div>
          </div>
        ) : analytics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Inventory Value (Cost)</span>
                  <span className="text-xl">$</span>
                </div>
                <div className="text-3xl font-semibold mb-1">KSH {analytics.overview.inventoryValueCost}</div>
                <div className="text-xs text-[var(--text-secondary)]">Total capital invested in stock</div>
              </div>

              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Inventory Value (Selling)</span>
                  <span className="text-xl">📈</span>
                </div>
                <div className="text-3xl font-semibold mb-1">KSH {analytics.overview.inventoryValueSelling}</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Potential revenue at {filterType} prices
                </div>
              </div>

              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Potential Profit</span>
                  <span className="text-xl">📊</span>
                </div>
                <div className="text-3xl font-semibold mb-1 text-green-500">KSH {analytics.overview.potentialProfit}</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Potential profit at {filterType} prices
                </div>
              </div>

              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Low Stock Alerts</span>
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="text-3xl font-semibold mb-1 text-red-500">{analytics.overview.lowStockAlerts}</div>
                <div className="text-xs text-[var(--text-secondary)]">Items at or below minimum stock level</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Total Returns</span>
                  <span className="text-xl">↩️</span>
                </div>
                <div className="text-3xl font-semibold mb-1">{analytics.overview.totalReturns}</div>
                <div className="text-xs text-[var(--text-secondary)]">Completed returns in date range</div>
              </div>

              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Pending Returns</span>
                  <span className="text-xl">⏳</span>
                </div>
                <div className="text-3xl font-semibold mb-1 text-amber-500">{analytics.overview.pendingReturns}</div>
                <div className="text-xs text-[var(--text-secondary)]">Returns awaiting action</div>
              </div>

              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Value of Returns</span>
                  <span className="text-xl">💰</span>
                </div>
                <div className="text-3xl font-semibold mb-1 text-red-500">KSH {analytics.overview.valueOfReturns}</div>
                <div className="text-xs text-[var(--text-secondary)]">Total value of completed returns</div>
              </div>

              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Archived Items</span>
                  <span className="text-xl">📦</span>
                </div>
                <div className="text-3xl font-semibold mb-1">{analytics.overview.archivedItems}</div>
                <div className="text-xs text-[var(--text-secondary)]">Products with zero stock or archived</div>
              </div>
            </div>

            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-red-500 text-xl">⚠️</span>
                <h2 className="text-lg font-semibold">Low Stock Items</h2>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {analytics.lowStockItems.length} items at or below minimum stock levels
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Product</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">SKU</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Qty</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Min</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {analytics.lowStockItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                          No low stock items
                        </td>
                      </tr>
                    ) : (
                      analytics.lowStockItems.map((item) => (
                        <tr key={item.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[var(--bg-primary)] rounded flex items-center justify-center text-sm">
                                📦
                              </div>
                              <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{item.sku}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 text-sm font-semibold">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{item.minimumStock}</td>
                          <td className="px-6 py-4">
                            <button className="text-blue-500 hover:text-blue-400 text-sm">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-[var(--text-secondary)]">No data available</div>
          </div>
        )}
      </div>
    </div>
  );
}
