import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const router = useRouter();
  const [shopSettings, setShopSettings] = useState<any>(null);

  useEffect(() => {
    fetchShopSettings();
  }, []);

  const fetchShopSettings = async () => {
    try {
      // First, try to load from localStorage cache
      const cachedSettings = localStorage.getItem('shopSettings');
      if (cachedSettings) {
        setShopSettings(JSON.parse(cachedSettings));
      }

      // Then fetch fresh data from API
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await fetch(`/api/shop-settings?email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        if (response.ok && data.settings) {
          setShopSettings(data.settings);
          // Cache the settings for next time
          localStorage.setItem('shopSettings', JSON.stringify(data.settings));
        }
      }
    } catch (error) {
      console.error('Error fetching shop settings:', error);
    }
  };

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
    { label: 'Shop Settings', href: '/shop-settings', icon: '🏪' },
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
      {shopSettings && (
        <div className="p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            {shopSettings.logo_url && (
              <div className="flex-shrink-0">
                <img 
                  src={shopSettings.logo_url} 
                  alt="Logo" 
                  className="w-14 h-14 object-cover rounded-full border-2 border-emerald-500/20"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-emerald-500 truncate">
                {shopSettings.business_name}
              </h1>
              {shopSettings.business_tagline && (
                <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">
                  {shopSettings.business_tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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

      <div className="p-4 border-t border-[var(--border-color)]">
        <div className="flex gap-3">
          <button
            onClick={() => {
              const theme = localStorage.getItem('theme');
              localStorage.clear();
              if (theme) localStorage.setItem('theme', theme);
              localStorage.removeItem('shopSettings');
              window.location.href = '/login';
            }}
            className="flex-shrink-0 p-3 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors border border-[var(--border-color)]"
            title="Clear & Restart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
