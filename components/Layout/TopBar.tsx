import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';

export default function TopBar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'blue-professional', label: 'Blue Professional', icon: '💼' },
    { value: 'ocean', label: 'Ocean', icon: '🌊' },
    { value: 'forest', label: 'Forest', icon: '🌲' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  return (
    <header className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button className="text-[var(--text-primary)] hover:text-[var(--text-secondary)]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {router.pathname === '/dashboard-pro' && 'Dashboard Overview'}
          {router.pathname === '/dashboard-advanced' && 'Dashboard'}
          {router.pathname === '/pos-advanced' && 'Point of Sale'}
          {router.pathname === '/products-pro' && 'Products'}
          {router.pathname === '/inventory-pro' && 'Inventory'}
          {router.pathname === '/customers-pro' && 'Customers'}
          {router.pathname === '/sales-pro' && 'Sales'}
          {router.pathname === '/reports-pro' && 'Reports'}
          {router.pathname === '/ai-assistant' && 'AI Assistant'}
          {router.pathname === '/settings' && 'Settings'}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors"
            title="Choose Theme"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>
          
          {showThemeMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowThemeMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-xl z-20 py-2">
                <div className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                  Choose Theme
                </div>
                {themes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => {
                      setTheme(t.value as any);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] flex items-center space-x-2 ${
                      theme === t.value ? 'text-emerald-500 font-medium' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                    {theme === t.value && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* AI Accountant Button */}
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center space-x-2">
          <span>🤖</span>
          <span>AI Accountant</span>
        </button>

        {/* Export Button */}
        <button className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]" title="Export Summary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] relative" title="Notifications">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-3 border-l border-[var(--border-color)]">
          <div className="text-right">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {user?.username || 'John'}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {user?.email || 'johnsmarttraders@gmail.com'}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-600 font-semibold text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'J'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
