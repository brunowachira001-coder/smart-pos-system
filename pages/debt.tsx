import React, { useEffect, useState } from 'react';

export default function DebtManagement() {
  const [debts, setDebts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const statsRes = await fetch('/api/debts/stats');
        const debtsRes = await fetch('/api/debts');

        if (!statsRes.ok) {
          throw new Error(`Stats API returned ${statsRes.status}`);
        }
        if (!debtsRes.ok) {
          throw new Error(`Debts API returned ${debtsRes.status}`);
        }

        const statsData = await statsRes.json();
        const debtsData = await debtsRes.json();

        setStats(statsData || {});
        setDebts(debtsData.debts || []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  if (!mounted) return <div style={{ padding: '20px' }}>Initializing...</div>;
  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Debt Management</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>Outstanding Debt</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>KSH {(stats.totalOutstanding || 0).toFixed(2)}</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>Today's Debt</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>KSH {(stats.todayDebt || 0).toFixed(2)}</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>Credit Limit</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>KSH {(stats.totalCreditLimit || 0).toFixed(2)}</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>Active Debts</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.activeDebts || 0}</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>Recent Payments</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.recentPayments || 0}</p>
        </div>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h2>Outstanding Debts</h2>
        {debts.filter((d: any) => d.status !== 'paid').length === 0 ? (
          <p style={{ color: '#666' }}>No outstanding debts</p>
        ) : (
          <div>
            {debts.filter((d: any) => d.status !== 'paid').map((debt: any) => (
              <div key={debt.id} style={{ padding: '15px', backgroundColor: '#f5f5f5', marginBottom: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{debt.customer_name}</p>
                  <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{debt.sale_id}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>KSH {debt.amount_remaining.toFixed(2)}</p>
                  <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{debt.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
