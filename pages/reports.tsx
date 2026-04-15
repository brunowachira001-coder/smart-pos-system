import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Reports() {
  const router = useRouter();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('today');

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reports/summary?period=${period}`);
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchReport();
  }, [router, fetchReport]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600 mt-1">View sales performance and insights</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Period Filter */}
      <div className="flex gap-2">
        {['today', 'week', 'month'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
              period === p
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Loading report...</p>
        </div>
      ) : reportData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                KES {reportData.summary.totalSales.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">Total Profit</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                KES {reportData.summary.totalProfit.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">Tax Collected</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                KES {reportData.summary.totalTax.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">Transactions</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{reportData.summary.transactionCount}</p>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Top Selling Products</h2>
            {reportData.topProducts.length === 0 ? (
              <p className="text-slate-600">No sales data available</p>
            ) : (
              <div className="space-y-3">
                {reportData.topProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Product #{product.productId}</p>
                      <p className="text-sm text-slate-600">{product.quantity} units sold</p>
                    </div>
                    <p className="text-lg font-bold text-emerald-600">
                      KES {product.revenue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sales Trend */}
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Sales Trend</h2>
            {reportData.salesTrend.length === 0 ? (
              <p className="text-slate-600">No sales data available</p>
            ) : (
              <div className="space-y-2">
                {reportData.salesTrend.map((day: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 w-24">{day.date}</p>
                    <div className="flex-1 mx-4 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{
                          width: `${(day.sales / Math.max(...reportData.salesTrend.map((d: any) => d.sales))) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm font-medium text-slate-900 w-32 text-right">
                      KES {day.sales.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
