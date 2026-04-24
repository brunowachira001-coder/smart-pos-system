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
  
  // Toast notification
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchSettings();
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

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--text-secondary)]">Loading settings...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Store Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Business Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Enable Notifications</p>
                <p className="text-xs text-[var(--text-secondary)]">Receive alerts for important events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--card-bg)] after:border-[var(--border-color)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Auto Backup</p>
                <p className="text-xs text-[var(--text-secondary)]">Automatically backup data daily</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableAutoBackup}
                  onChange={(e) => setSettings({ ...settings, enableAutoBackup: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--card-bg)] after:border-[var(--border-color)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Auto-Print Receipts</p>
                <p className="text-xs text-[var(--text-secondary)]">Automatically open print dialog after checkout</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--card-bg)] after:border-[var(--border-color)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">System</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 text-left text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              Export Data
            </button>
            <button className="w-full px-4 py-2 text-left text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              Import Data
            </button>
            <button className="w-full px-4 py-2 text-left text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              Clear Cache
            </button>
            <button className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
