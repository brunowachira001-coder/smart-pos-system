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

      if (response.ok) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const calculatePieChart = () => {
    if (!analytics?.paymentMethods) return [];
    
    let currentAngle = 0;
    return analytics.paymentMethods.map(pm => {
      const percentage = parseFloat(pm.percentage);
      const angle = (percentage / 100) * 360;
      const slice = {
        method: pm.method,
        percentage: pm.percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: getPaymentMethodColor(pm.method)
      };
      currentAngle += angle;
      return slice;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-1">Sales Analytics</h1>
            <p className="text-sm text-[var(--text-secondary)]">A deep dive into your sales performance.</p>
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

              <div className="flex items-center justify-center">
                <div className="relative w-80 h-80">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {calculatePieChart().map((slice, index) => {
                      const startAngle = (slice.startAngle * Math.PI) / 180;
                      const endAngle = (slice.endAngle * Math.PI) / 180;
                      const x1 = 100 + 80 * Math.cos(startAngle);
                      const y1 = 100 + 80 * Math.sin(startAngle);
                      const x2 = 100 + 80 * Math.cos(endAngle);
                      const y2 = 100 + 80 * Math.sin(endAngle);
                      const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;

                      return (
                        <path
                          key={index}
                          d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={slice.color}
                          stroke="var(--bg-tertiary)"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>

                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-end">
                    {analytics.paymentMethods.map((pm, index) => {
                      const angle = ((parseFloat(pm.percentage) / 100) * 360 * Math.PI) / 180;
                      const midAngle = calculatePieChart()[index]?.startAngle + (angle / 2);
                      const labelRadius = 120;
                      const x = Math.cos((midAngle * Math.PI) / 180 - Math.PI / 2) * labelRadius;
                      const y = Math.sin((midAngle * Math.PI) / 180 - Math.PI / 2) * labelRadius;

                      return (
                        <div
                          key={pm.method}
                          className="absolute text-sm font-medium"
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <span className={pm.method === 'cash' ? 'text-[var(--text-primary)]' : 'text-red-500'}>
                            {pm.method} {pm.percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-6">
                {analytics.paymentMethods.map(pm => (
                  <div key={pm.method} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: getPaymentMethodColor(pm.method) }}
                    />
                    <span className="text-sm capitalize">{pm.method}: {pm.count} ({pm.percentage}%)</span>
                  </div>
                ))}
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
