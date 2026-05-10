import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function Settings() {
  const [settings, setSettings] = useState({
    storeName: 'Smart POS Store',
    storeEmail: 'admin@smartpos.com',
    storePhone: '+254 700 000 000',
    currency: 'KES',
    taxRate: 16,
    lowStockThreshold: 50,
    enableNotifications: true,
    enableAutoBackup: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  
  // Toast notification
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchSettings();
    // Load theme from localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings({
        storeName: data.store_name || 'Smart POS Store',
        storeEmail: data.store_email || 'admin@smartpos.com',
        storePhone: data.store_phone || '+254 700 000 000',
        currency: data.currency || 'KES',
        taxRate: data.tax_rate || 16,
        lowStockThreshold: data.low_stock_threshold || 50,
        enableNotifications: data.enable_notifications !== false,
        enableAutoBackup: data.enable_auto_backup !== false,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: settings.storeName,
          store_email: settings.storeEmail,
          store_phone: settings.storePhone,
          currency: settings.currency,
          tax_rate: settings.taxRate,
          low_stock_threshold: settings.lowStockThreshold,
          enable_notifications: settings.enableNotifications,
          enable_auto_backup: settings.enableAutoBackup,
        })
      });
      
      if (response.ok) {
        showToast('Settings saved successfully!', 'success');
      } else {
        showToast('Error saving settings', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setCurrentTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      showToast(`${theme === 'light' ? 'Light' : 'Dark'} theme activated`, 'success');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-[var(--text-secondary)]">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <div className="p-4 sm:p-5 lg:p-6">
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
        
        {/* Header - Mobile First */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5 lg:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
              Manage your store preferences and configuration
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Settings Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          {/* Themes Section - NEW */}
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] p-4 sm:p-5 lg:p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Appearance & Themes</h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4">
              Choose your preferred color theme
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Light Theme Card */}
              <button
                onClick={() => handleThemeChange('light')}
                className={`relative min-h-[120px] sm:min-h-[140px] p-4 rounded-xl border-2 transition-all ${
                  currentTheme === 'light'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-[var(--border-color)] bg-white hover:border-blue-300'
                }`}
              >
                {currentTheme === 'light' && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm sm:text-base font-semibold text-gray-900">Light Mode</p>
                    <p className="text-xs text-gray-600 mt-1">Bright and clean</p>
                  </div>
                </div>
              </button>

              {/* Dark Theme Card */}
              <button
                onClick={() => handleThemeChange('dark')}
                className={`relative min-h-[120px] sm:min-h-[140px] p-4 rounded-xl border-2 transition-all ${
                  currentTheme === 'dark'
                    ? 'border-blue-500 bg-gray-800'
                    : 'border-gray-700 bg-gray-900 hover:border-blue-400'
                }`}
              >
                {currentTheme === 'dark' && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm sm:text-base font-semibold text-white">Dark Mode</p>
                    <p className="text-xs text-gray-400 mt-1">Easy on the eyes</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Store Information */}
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] p-4 sm:p-5 lg:p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Store Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={settings.storePhone}
                  onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] p-4 sm:p-5 lg:p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Business Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] p-4 sm:p-5 lg:p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between min-h-[44px] gap-4">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">Enable Notifications</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Receive alerts for important events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between min-h-[44px] gap-4">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">Auto Backup</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Automatically backup data daily</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.enableAutoBackup}
                    onChange={(e) => setSettings({ ...settings, enableAutoBackup: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between min-h-[44px] gap-4">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">Auto-Print Receipts</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Automatically open print dialog after checkout</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={typeof window !== 'undefined' && localStorage.getItem('autoPrintReceipt') === 'true'}
                    onChange={(e) => {
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('autoPrintReceipt', e.target.checked.toString());
                        showToast(e.target.checked ? 'Auto-print enabled' : 'Auto-print disabled', 'success');
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* System Actions */}
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] p-4 sm:p-5 lg:p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">System Actions</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full min-h-[44px] px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Data
              </button>
              <button className="w-full min-h-[44px] px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Data
              </button>
              <button className="w-full min-h-[44px] px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear Cache
              </button>
              <button className="w-full min-h-[44px] px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
