import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useShopSettings } from '../hooks/useShopSettings';

export default function Landing() {
  const router = useRouter();
  const { settings } = useShopSettings();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard-pro');
    }

    // PWA Install prompt handler
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [router]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support PWA install
      alert('To install this app:\n\n1. Open browser menu\n2. Select "Install App" or "Add to Home Screen"');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>{settings.business_name} - Streamline Your Business</title>
        <meta name="description" content={`${settings.business_tagline || 'Powerful business management system for modern businesses'}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                {settings.logo_url ? (
                  <img 
                    src={settings.logo_url} 
                    alt={settings.business_name}
                    className="w-10 h-10 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div 
                  className={settings.logo_url ? 'hidden w-10 h-10 rounded-lg flex items-center justify-center' : 'w-10 h-10 rounded-lg flex items-center justify-center'}
                  style={{ 
                    background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.secondary_color || settings.primary_color} 100%)`
                  }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">{settings.business_name}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLoginClick}
                  className="px-6 py-2 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                  style={{ backgroundColor: settings.primary_color }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = settings.secondary_color || settings.primary_color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = settings.primary_color;
                  }}
                >
                  Go to Your Shop
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Compact */}
        <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              {/* Icon/Logo */}
              <div className="flex justify-center mb-3">
                {settings.logo_url ? (
                  <img 
                    src={settings.logo_url} 
                    alt={settings.business_name}
                    className="w-16 h-16 object-cover rounded-2xl shadow-2xl"
                    style={{ boxShadow: `0 20px 40px -12px ${settings.primary_color}80` }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div 
                  className={settings.logo_url ? 'hidden w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl' : 'w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl'}
                  style={{ 
                    background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.secondary_color || settings.primary_color} 100%)`,
                    boxShadow: `0 20px 40px -12px ${settings.primary_color}80`
                  }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight">
                The POS system that<br />
                <span style={{ color: settings.primary_color }}>grows with your shop</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-300 mb-6 max-w-2xl mx-auto">
                Manage inventory, track sales, handle debts, and send SMS to customers — all from one dashboard.
              </p>

              {/* CTA Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleLoginClick}
                  className="px-8 py-3 text-white text-base font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  style={{ 
                    backgroundColor: settings.primary_color,
                    boxShadow: `0 10px 15px -3px ${settings.primary_color}50`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = settings.secondary_color || settings.primary_color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = settings.primary_color;
                  }}
                >
                  Go to Your Shop
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - Compact */}
        <div className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
              Everything You Need
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 transition-all duration-300 transform hover:scale-105"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = settings.primary_color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Point of Sale</h3>
                <p className="text-slate-400 text-sm">Fast checkout with barcode scanning, cart management, and receipt printing.</p>
              </div>

              {/* Feature 2 */}
              <div 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 transition-all duration-300 transform hover:scale-105"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = settings.primary_color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Inventory</h3>
                <p className="text-slate-400 text-sm">Real-time stock tracking, low stock alerts, and restock management.</p>
              </div>

              {/* Feature 3 */}
              <div 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 transition-all duration-300 transform hover:scale-105"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = settings.primary_color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Customers & Debts</h3>
                <p className="text-slate-400 text-sm">Track customer credit, manage debts, and view purchase history.</p>
              </div>

              {/* Feature 4 */}
              <div 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 transition-all duration-300 transform hover:scale-105"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = settings.primary_color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
                <p className="text-slate-400 text-sm">Sales reports, profit tracking, and product performance insights.</p>
              </div>

              {/* Feature 5 */}
              <div 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 transition-all duration-300 transform hover:scale-105"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = settings.primary_color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Returns</h3>
                <p className="text-slate-400 text-sm">Handle product returns with automated inventory updates.</p>
              </div>

              {/* Feature 6 */}
              <div 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 transition-all duration-300 transform hover:scale-105"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = settings.primary_color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">SMS Messages</h3>
                <p className="text-slate-400 text-sm">Send automated SMS to customers for debts, promotions, and updates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-slate-400 text-sm">
              © 2026 {settings.business_name}. Built for small & medium retail businesses.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
