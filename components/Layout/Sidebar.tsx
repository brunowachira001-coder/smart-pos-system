import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'POS / Sales', path: '/pos', icon: '💳' },
    { label: 'Inventory', path: '/inventory', icon: '📦' },
    { label: 'Customers', path: '/customers', icon: '👥' },
    { label: 'Transactions', path: '/sales', icon: '💰' },
    { label: 'Reports', path: '/reports', icon: '📈' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  const isActive = (path: string) => router.pathname === path;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-slate-700">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center space-x-3 font-bold text-white hover:text-emerald-400 transition">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">🏪</span>
            </div>
            <span className="text-lg">Smart Traders</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-lg">🏪</span>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
              isActive(item.path)
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title={collapsed ? item.label : ''}
          >
            <span className="text-xl">{item.icon}</span>
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Collapse Button */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-white transition"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
    </aside>
  );
}
