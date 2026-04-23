import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const router = useRouter();

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard-pro', icon: '📊' },
    { label: 'Point of Sale', href: '/pos', icon: '🛒' },
    { label: 'Transactions', href: '/transactions', icon: '💳' },
    { label: 'Returns', href: '/returns', icon: '↩️' },
    { label: 'Expenses', href: '/expenses', icon: '💸' },
    { label: 'Inventory', href: '/inventory', icon: '📦' },
    { label: 'Customers', href: '/customers', icon: '👥' },
    { label: 'Debt Management', href: '/debt', icon: '💰' },
    { label: 'Sales Analytics', href: '/sales-analytics', icon: '📈' },
    { label: 'Inventory Analytics', href: '/inventory-analytics', icon: '📊' },
    { label: 'Product Performance', href: '/product-performance', icon: '🎯' },
    { label: 'User Management', href: '/user-management', icon: '👤' },
    { label: 'My Profile', href: '/my-profile', icon: '⚙️' },
  ];

  const isActive = (href: string) => router.pathname === href;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-[var(--bg-primary)] border-r border-[var(--border-color)] overflow-y-auto flex flex-col h-screen">
      <div className="p-6 border-b border-[var(--border-color)]">
        <h1 className="text-2xl font-bold text-emerald-500">Smart Traders</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Inventory System</p>
      </div>

      <nav className="px-3 py-4 space-y-1 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm ${
              isActive(item.href)
                ? 'bg-emerald-500/10 text-emerald-500 font-medium'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <span className="text-lg mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border-color)] space-y-2">
        <button
          onClick={() => {
            if (confirm('This will clear all cached data and restart the app. Continue?')) {
              const theme = localStorage.getItem('theme');
              localStorage.clear();
              if (theme) localStorage.setItem('theme', theme);
              window.location.href = '/login';
            }
          }}
          className="w-full px-4 py-2.5 text-sm font-medium text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Clear & Restart</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
