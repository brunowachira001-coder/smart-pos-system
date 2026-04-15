import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isActive = (path: string) => router.pathname === path;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'POS', path: '/pos', icon: '💳' },
    { label: 'Products', path: '/products', icon: '📦' },
    { label: 'Inventory', path: '/inventory', icon: '📋' },
    { label: 'Customers', path: '/customers', icon: '👥' },
    { label: 'Sales', path: '/sales', icon: '💰' },
    { label: 'Reports', path: '/reports', icon: '📈' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2 font-bold text-xl hover:text-blue-100">
            <span className="text-2xl">💳</span>
            <span>Smart POS</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive(item.path)
                    ? 'bg-blue-900 text-white'
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-blue-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive(item.path)
                    ? 'bg-blue-900 text-white'
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
