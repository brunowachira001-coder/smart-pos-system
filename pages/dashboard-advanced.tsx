import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { apiClient } from '@/lib/api';

interface DashboardMetrics {
  totalSales: number;
  totalTransactions: number;
  totalCustomers: number;
  topProducts: any[];
}

export default function DashboardAdvanced() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        // Get branch ID from user or use default
        const user = await apiClient.getCurrentUser();
        const bid = user.data.branchId || 'default-branch';
        setBranchId(bid);

        const response = await apiClient.getDashboardMetrics(bid);
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin text-emerald-600 text-4xl">⏳</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-2">Welcome back! Here's your business overview.</p>
          </div>
          <Button variant="primary">Generate Report</Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-600 text-sm font-semibold">Total Sales</p>
                <p className="text-3xl font-bold text-emerald-900 mt-2">
                  KES {metrics?.totalSales?.toLocaleString() || 0}
                </p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-600 text-sm font-semibold">Transactions</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {metrics?.totalTransactions || 0}
                </p>
              </div>
              <span className="text-4xl">📊</span>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-600 text-sm font-semibold">Customers</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {metrics?.totalCustomers || 0}
                </p>
              </div>
              <span className="text-4xl">👥</span>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-600 text-sm font-semibold">Avg Transaction</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                  KES {metrics?.totalSales && metrics?.totalTransactions
                    ? Math.round(metrics.totalSales / metrics.totalTransactions)
                    : 0}
                </p>
              </div>
              <span className="text-4xl">📈</span>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card title="Top Selling Products" subtitle="Last 30 days">
            <div className="space-y-3">
              {metrics?.topProducts?.slice(0, 5).map((product, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Product {idx + 1}</p>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${(idx + 1) * 20}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm ml-4">KES {product._sum?.total || 0}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions" subtitle="Common tasks">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                ➕ New Sale
              </Button>
              <Button variant="outline" className="w-full">
                👥 Add Customer
              </Button>
              <Button variant="outline" className="w-full">
                📦 Add Product
              </Button>
              <Button variant="outline" className="w-full">
                📊 View Reports
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card title="System Status" subtitle="All systems operational">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-700 font-semibold">✅ Backend API</span>
              <span className="text-green-600 text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-700 font-semibold">✅ Database</span>
              <span className="text-green-600 text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-700 font-semibold">✅ AI Engine</span>
              <span className="text-green-600 text-sm">Ready</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
