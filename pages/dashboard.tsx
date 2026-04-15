import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalSales: 125400,
    transactions: 342,
    inventory: 1250,
    customers: 156,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back, {user.username}!</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sales', value: `KES ${stats.totalSales.toLocaleString()}`, icon: '💰', color: 'emerald' },
          { label: 'Transactions', value: stats.transactions, icon: '📊', color: 'blue' },
          { label: 'Inventory', value: stats.inventory, icon: '📦', color: 'purple' },
          { label: 'Customers', value: stats.customers, icon: '👥', color: 'orange' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6 border border-slate-200 hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Sales Trend</h2>
          <div className="h-64 flex items-end justify-around gap-2">
            {[65, 45, 78, 55, 88, 72, 95].map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition hover:from-emerald-600 hover:to-emerald-500"
                  style={{ height: `${value}%` }}
                ></div>
                <span className="text-xs text-slate-600 mt-2">Day {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {[
              { id: 1, amount: 2500, customer: 'John Doe', time: '2 hours ago' },
              { id: 2, amount: 1800, customer: 'Jane Smith', time: '4 hours ago' },
              { id: 3, amount: 3200, customer: 'Mike Johnson', time: '6 hours ago' },
              { id: 4, amount: 1500, customer: 'Sarah Williams', time: '8 hours ago' },
            ].map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-medium text-slate-900">{transaction.customer}</p>
                  <p className="text-xs text-slate-600">{transaction.time}</p>
                </div>
                <span className="font-bold text-emerald-600">KES {transaction.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg shadow p-6 border border-emerald-200">
        <h2 className="text-lg font-bold text-slate-900 mb-3">AI Insights</h2>
        <div className="space-y-2 text-slate-700">
          <p>✨ Your sales are up 23% compared to last week</p>
          <p>📦 Low stock alert: 5 products need restocking</p>
          <p>👥 Top customer: John Doe with 12 purchases this month</p>
        </div>
      </div>
    </div>
  );
}
