import React, { useState, useEffect } from 'react';
import DateRangeFilter from '../components/DateRangeFilter';

interface AnalyticsData {
  overview: {
    totalTransactions: number;
    averageTransactionValue: string;
    totalDiscounts: string;
    grossSalesRevenue: string;
    retailRevenue: string;
    wholesaleRevenue: string;
  };
  paymentMethods: Array<{
    method: string;
    count: number;
    percentage: string;
  }>;
}

export default function SalesAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [useDemoData, setUseDemoData] = useState(false);

  // Demo data for visualization
  const demoData: AnalyticsData = {
    overview: {
      totalTransactions: 10037,
      averageTransactionValue: '1005.13',
      totalDiscounts: '7051.66',
      grossSalesRevenue: '10088462.94',
      retailRevenue: '5944720.00',
      wholesaleRevenue: '4143742.94'
    },
    paymentMethods: [
      { method: 'cash', count: 8431, percentage: '84.0' },
      { method: 'mpesa', count: 956, percentage: '9.5' },
      { method: 'card', count: 451, percentage: '4.5' },
      { method: 'bank', count: 199, percentage: '2.0' }
    ]
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateFilter, startDate, endDate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const response = await fetch(`/api/sales-analytics/overview?${params}`);
      const data = await response.json();

      if (response.ok && data.overview.totalTransactions > 0) {
        setAnalytics(data);
        setUseDemoData(false);
      } else {
        // Use demo data if no real data
        setAnalytics(demoData);
        setUseDemoData(true);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use demo data on error
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

  const getPaymentMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      cash: '#E5E7EB',
      mpesa: '#10B981',
      card: '#3B82F6',
      bank: '#8B5CF6'
    };
    return colors[method.toLowerCase()] || '#6B7280';
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-1">Sales Analytics</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              A deep dive into your sales performance.
              {useDemoData && <span className="ml-2 text-amber-500">(Showing demo data)</span>}
            </p>
          </div>
          <DateRangeFilter 
            value={dateFilter}
            onChange={setDateFilter}
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
          />
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
                  <span className="text-sm text-[var(--text-secondary)]">Total Transactions</span>
                  <span className="text-xl">#</span>
                </div>
                <div className="text-3xl font-semibold mb-1">{analytics.overview.totalTransactions}</div>
                <div className="text-xs text-[var(--text-secondary)]">Number of sales in period</div>
              </div>

              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Average Transaction Value</span>
                  <span className="text-xl">📊</span>
                </div>
                <div className="text-3xl font-semibold mb-1">KSH {analytics.overview.averageTransactionValue}</div>
                <div className="text-xs text-[var(--text-secondary)]">Average spend per sale</div>
              </div>

              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Total Discounts</span>
                  <span className="text-xl">%</span>
                </div>
                <div className="text-3xl font-semibold mb-1 text-red-500">KSH {analytics.overview.totalDiscounts}</div>
                <div className="text-xs text-[var(--text-secondary)]">Total value of discounts given</div>
              </div>

              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Gross Sales Revenue</span>
                  <span className="text-xl">📈</span>
                </div>
                <div className="text-3xl font-semibold mb-1">KSH {analytics.overview.grossSalesRevenue}</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Retail: KSH {analytics.overview.retailRevenue} | Wholesale: KSH {analytics.overview.wholesaleRevenue}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">
                  Total sales before returns & expenses
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2">Payment Methods</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">Breakdown of transactions by payment method.</p>

              {analytics.paymentMethods && analytics.paymentMethods.length > 0 ? (
                <>
                  <div className="flex items-center justify-center py-8">
                    <div className="relative w-96 h-96 flex items-center justify-center">
                      {/* Pie Chart using conic-gradient */}
                      <div 
                        className="w-80 h-80 rounded-full relative shadow-lg"
                        style={{
                          background: `conic-gradient(${analytics.paymentMethods.map((pm, index) => {
                            const prevPercentage = analytics.paymentMethods
                              .slice(0, index)
                              .reduce((sum, p) => sum + parseFloat(p.percentage), 0);
                            const currentPercentage = parseFloat(pm.percentage);
                            return `${getPaymentMethodColor(pm.method)} ${prevPercentage}% ${prevPercentage + currentPercentage}%`;
                          }).join(', ')})`
                        }}
                      >
                        {/* Labels positioned around the chart */}
                        {analytics.paymentMethods.map((pm, index) => {
                          const prevPercentage = analytics.paymentMethods
                            .slice(0, index)
                            .reduce((sum, p) => sum + parseFloat(p.percentage), 0);
                          const currentPercentage = parseFloat(pm.percentage);
                          const midPercentage = prevPercentage + (currentPercentage / 2);
                          const angle = (midPercentage / 100) * 360 - 90;
                          const radian = (angle * Math.PI) / 180;
                          const radius = 200;
                          const x = Math.cos(radian) * radius;
                          const y = Math.sin(radian) * radius;

                          return (
                            <div
                              key={pm.method}
                              className="absolute text-sm font-bold whitespace-nowrap bg-white px-2 py-1 rounded shadow-md"
                              style={{
                                left: '50%',
                                top: '50%',
                                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                                color: '#1F2937'
                              }}
                            >
                              {pm.method} {pm.percentage}%
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap justify-center gap-6">
                    {analytics.paymentMethods.map(pm => (
                      <div key={pm.method} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: getPaymentMethodColor(pm.method) }}
                        />
                        <span className="text-sm capitalize text-[var(--text-primary)]">
                          {pm.method}: {pm.count} transactions ({pm.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-[var(--text-secondary)] text-center">
                    No payment data available for the selected period.
                    <br />
                    Make some sales to see payment method analytics.
                  </p>
                </div>
              )}
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
