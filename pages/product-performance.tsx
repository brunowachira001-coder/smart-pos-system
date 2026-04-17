import React, { useState, useEffect } from 'react';
import DateRangeFilter from '../components/DateRangeFilter';

interface ProductPerformance {
  id: string;
  name: string;
  sku: string;
  unitsSold: number;
  netRevenue: string;
  netCost: string;
  netProfit: string;
  profitMargin: string;
  returnRate: string;
}

export default function ProductPerformancePage() {
  const [products, setProducts] = useState<ProductPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchPerformance();
  }, [dateRange]);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/product-performance/overview?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching product performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPerformance();
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ start, end });
  };

  const exportToCSV = () => {
    const headers = ['Product', 'Units Sold', 'Net Revenue', 'Net Cost', 'Net Profit', 'Profit Margin', 'Return Rate'];
    const rows = products.map(p => [
      p.name,
      p.unitsSold,
      `KSH ${p.netRevenue}`,
      `KSH ${p.netCost}`,
      `KSH ${p.netProfit}`,
      `${p.profitMargin}%`,
      `${p.returnRate}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-performance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Product Performance (New)</h1>
          <p className="text-sm text-[var(--text-secondary)]">Analyze product performance by sales, profit, and returns.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 items-center">
          <DateRangeFilter onDateChange={handleDateRangeChange} />
          
          <button
            onClick={exportToCSV}
            className="ml-auto bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm hover:bg-[var(--bg-primary)] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-sm"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Performance Table */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Units Sold</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Net Revenue</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Net Cost</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Net Profit</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Profit Margin</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Return Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                      Loading product performance...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                      No product performance data found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[var(--text-primary)]">{product.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{product.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">
                        {product.unitsSold}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                        KSH {parseFloat(product.netRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        KSH {parseFloat(product.netCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-500">
                        KSH {parseFloat(product.netProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                        {parseFloat(product.profitMargin).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {parseFloat(product.returnRate).toFixed(2)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        {products.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Total Products</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{products.length}</p>
            </div>
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Total Units Sold</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {products.reduce((sum, p) => sum + p.unitsSold, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-500">
                KSH {products.reduce((sum, p) => sum + parseFloat(p.netRevenue), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Total Profit</p>
              <p className="text-2xl font-bold text-emerald-500">
                KSH {products.reduce((sum, p) => sum + parseFloat(p.netProfit), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
