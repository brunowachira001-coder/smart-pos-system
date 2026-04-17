import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function SalesPro() {
  const router = useRouter();
  const [sales] = useState([
    { id: '#ORD-001', customer: 'John Doe', amount: 2450, items: 5, date: '2026-04-16', status: 'Completed' },
    { id: '#ORD-002', customer: 'Jane Smith', amount: 1890, items: 3, date: '2026-04-16', status: 'Completed' },
    { id: '#ORD-003', customer: 'Bob Johnson', amount: 3200, items: 8, date: '2026-04-16', status: 'Processing' },
    { id: '#ORD-004', customer: 'Alice Brown', amount: 1560, items: 2, date: '2026-04-15', status: 'Completed' },
    { id: '#ORD-005', customer: 'Charlie Wilson', amount: 2890, items: 6, date: '2026-04-15', status: 'Completed' },
  ]);

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Sales</h1>
          <button 
            onClick={() => router.push('/pos-advanced')}
            className="px-6 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700 font-semibold"
          >
            New Sale
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Today's Sales</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">KES 9.1K</p>
            <p className="text-emerald-600 text-sm mt-2">↑ 12% from yesterday</p>
          </div>
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Total Orders</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">328</p>
          </div>
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Avg Order Value</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">KES 138</p>
          </div>
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Pending Orders</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">3</p>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Items</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">{sale.id}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{sale.customer}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{sale.items}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">KES {sale.amount}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{sale.date}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      sale.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}
