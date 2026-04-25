import React, { useEffect, useState } from 'react';

interface Debt {
  id: string;
  customer_name: string;
  sale_id: string;
  total_amount: number;
  amount_paid: number;
  amount_remaining: number;
  status: string;
  due_date: string;
  created_at: string;
}

export default function DebtManagement() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    todayDebt: 0,
    totalCreditLimit: 0,
    activeDebts: 0,
    recentPayments: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '20');

      console.log('Fetching from /api/debts/stats');
      const statsRes = await fetch(`/api/debts/stats?${params.toString()}`);
      console.log('Stats response:', statsRes.status);

      if (!statsRes.ok) {
        const errorText = await statsRes.text();
        throw new Error(`Stats API error: ${statsRes.status} - ${errorText}`);
      }

      const statsData = await statsRes.json();
      console.log('Stats data:', statsData);

      console.log('Fetching from /api/debts');
      const debtsRes = await fetch(`/api/debts?${params.toString()}`);
      console.log('Debts response:', debtsRes.status);

      if (!debtsRes.ok) {
        const errorText = await debtsRes.text();
        throw new Error(`Debts API error: ${debtsRes.status} - ${errorText}`);
      }

      const debtsData = await debtsRes.json();
      console.log('Debts data:', debtsData);

      setStats({
        totalOutstanding: statsData.totalOutstanding || 0,
        todayDebt: statsData.todayDebt || 0,
        totalCreditLimit: statsData.totalCreditLimit || 0,
        activeDebts: statsData.activeDebts || 0,
        recentPayments: statsData.recentPayments || 0,
      });

      setDebts(debtsData.debts || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load debt data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debt Management</h1>
      
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Outstanding Debt</p>
          <p className="text-3xl font-bold">KSH {stats.totalOutstanding.toFixed(2)}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Today's Debt</p>
          <p className="text-3xl font-bold">KSH {stats.todayDebt.toFixed(2)}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Credit Limit</p>
          <p className="text-3xl font-bold">KSH {stats.totalCreditLimit.toFixed(2)}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Active Debts</p>
          <p className="text-3xl font-bold">{stats.activeDebts}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Recent Payments</p>
          <p className="text-3xl font-bold">{stats.recentPayments}</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Outstanding Debts</h2>
        {debts.filter(d => d.status !== 'paid').length === 0 ? (
          <p className="text-[var(--text-secondary)]">No outstanding debts</p>
        ) : (
          <div className="space-y-3">
            {debts.filter(d => d.status !== 'paid').map((debt) => (
              <div key={debt.id} className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{debt.customer_name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{debt.sale_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">KSH {debt.amount_remaining.toFixed(2)}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{debt.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
