import React, { useState } from 'react';

export default function ReportsPro() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [reportData] = useState({
    totalRevenue: 45230,
    totalOrders: 328,
    avgOrderValue: 138,
    conversionRate: 3.2,
    topProducts: [
      { name: 'Wireless Headphones', revenue: 49600, orders: 1240 },
      { name: 'USB-C Cable', revenue: 21000, orders: 2100 },
      { name: 'Phone Case', revenue: 9250, orders: 1850 },
    ],
    monthlyTrend: [
      { month: 'Jan', revenue: 32000, orders: 240 },
      { month: 'Feb', revenue: 38000, orders: 280 },
      { month: 'Mar', revenue: 45230, orders: 328 },
    ]
  });

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Reports & Analytics</h1>
          <button 
            onClick={() => setShowExportModal(true)}
            className="px-6 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700 font-semibold"
          >
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">KES {(reportData.totalRevenue / 1000).toFixed(1)}K</p>
            <p className="text-emerald-600 text-sm mt-2">↑ 15% from last month</p>
          </div>
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Total Orders</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{reportData.totalOrders}</p>
            <p className="text-blue-600 text-sm mt-2">↑ 12 new today</p>
          </div>
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Avg Order Value</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">KES {reportData.avgOrderValue}</p>
            <p className="text-orange-600 text-sm mt-2">↑ 5% increase</p>
          </div>
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Conversion Rate</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{reportData.conversionRate}%</p>
            <p className="text-green-600 text-sm mt-2">↑ 0.3% improvement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Top Products</h2>
            <div className="space-y-4">
              {reportData.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{product.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{product.orders} orders</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-600">KES {(product.revenue / 1000).toFixed(1)}K</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Monthly Trend</h2>
            <div className="space-y-4">
              {reportData.monthlyTrend.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="w-16">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{item.month}</p>
                  </div>
                  <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2" style={{ width: `${(item.revenue / 50000) * 100}%` }}>
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">KES {(item.revenue / 1000).toFixed(0)}K</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Export Report</h2>
              <div className="space-y-3">
                <button onClick={() => { alert('Exported as PDF!'); setShowExportModal(false); }} className="w-full px-4 py-3 text-left bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]">
                  <p className="font-semibold text-[var(--text-primary)]">Export as PDF</p>
                </button>
                <button onClick={() => { alert('Exported as Excel!'); setShowExportModal(false); }} className="w-full px-4 py-3 text-left bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]">
                  <p className="font-semibold text-[var(--text-primary)]">Export as Excel</p>
                </button>
                <button onClick={() => { alert('Exported as CSV!'); setShowExportModal(false); }} className="w-full px-4 py-3 text-left bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]">
                  <p className="font-semibold text-[var(--text-primary)]">Export as CSV</p>
                </button>
              </div>
              <button onClick={() => setShowExportModal(false)} className="w-full mt-4 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)]">Cancel</button>
            </div>
          </div>
        )}
      </div>
  );
}
