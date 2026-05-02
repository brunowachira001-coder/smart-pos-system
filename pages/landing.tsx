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
                  Login to Dashboard
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              {/* Icon/Logo */}
              <div className="flex justify-center mb-8">
                {settings.logo_url ? (
                  <img 
                    src={settings.logo_url} 
                    alt={settings.business_name}
                    className="w-32 h-32 object-cover rounded-2xl shadow-2xl animate-pulse"
                    style={{ 
                      boxShadow: `0 25px 50px -12px ${settings.primary_color}80`
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div 
                  className={settings.logo_url ? 'hidden w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse' : 'w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse'}
                  style={{ 
                    background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.secondary_color || settings.primary_color} 100%)`,
                    boxShadow: `0 25px 50px -12px ${settings.primary_color}80`
                  }}
                >
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
                {settings.business_name}
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
                {settings.business_tagline || 'Streamline your stock, sales, and returns with our powerful and intuitive dashboard.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleLoginClick}
                  className="px-8 py-4 text-white text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg w-full sm:w-auto"
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
                  Login to Dashboard
                </button>
                
                <button
                  onClick={handleInstallClick}
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white text-lg font-semibold rounded-xl border-2 border-slate-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Install App
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-bold text-white text-center mb-20 animate-fade-in">
              Everything You Need to Manage Your Business
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {/* Feature 1 */}
              <div 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                style={{ 
                  '--hover-border': settings.primary_color 
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = settings.primary_color;
                  e.currentTarget.style.boxShadow = `0 25px 50px -12px ${settings.primary_color}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Real-time Analytics</h3>
                <p className="text-slate-400 text-lg">Track sales, inventory, and performance metrics in real-time with beautiful dashboards.</p>
              </div>

              {/* Feature 2 */}
              <div 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = settings.primary_color;
                  e.currentTarget.style.boxShadow = `0 25px 50px -12px ${settings.primary_color}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ backgroundColor: settings.secondary_color || settings.primary_color }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Point of Sale</h3>
                <p className="text-slate-400 text-lg">Fast and efficient checkout process with barcode scanning and receipt printing.</p>
              </div>

              {/* Feature 3 */}
              <div 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = settings.primary_color;
                  e.currentTarget.style.boxShadow = `0 25px 50px -12px ${settings.primary_color}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Inventory Management</h3>
                <p className="text-slate-400 text-lg">Keep track of stock levels, restock alerts, and product performance.</p>
              </div>

              {/* Feature 4 */}
              <div 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = settings.primary_color;
                  e.currentTarget.style.boxShadow = `0 25px 50px -12px ${settings.primary_color}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ backgroundColor: settings.secondary_color || settings.primary_color }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Customer Management</h3>
                <p className="text-slate-400 text-lg">Manage customer information, credit limits, and purchase history.</p>
              </div>

              {/* Feature 5 */}
              <div 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = settings.primary_color;
                  e.currentTarget.style.boxShadow = `0 25px 50px -12px ${settings.primary_color}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Expense Tracking</h3>
                <p className="text-slate-400 text-lg">Monitor business expenses and maintain accurate financial records.</p>
              </div>

              {/* Feature 6 */}
              <div 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = settings.primary_color;
                  e.currentTarget.style.boxShadow = `0 25px 50px -12px ${settings.primary_color}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(51 65 85)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ backgroundColor: settings.secondary_color || settings.primary_color }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Returns Management</h3>
                <p className="text-slate-400 text-lg">Handle product returns efficiently with automated inventory updates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Install App Section */}
        <div className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-white mb-8 animate-fade-in">
              Get the Full Experience
            </h2>
            <p className="text-2xl text-slate-300 mb-12">
              Install our app on your device for faster access and offline features.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center transform transition-all duration-300 hover:scale-105">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <p className="text-slate-300 text-lg">Click "Install App" button</p>
              </div>
              
              <div className="text-center transform transition-all duration-300 hover:scale-105">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{ backgroundColor: settings.secondary_color || settings.primary_color }}
                >
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <p className="text-slate-300 text-lg">Follow browser prompts</p>
              </div>
              
              <div className="text-center transform transition-all duration-300 hover:scale-105">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <p className="text-slate-300 text-lg">Access from home screen</p>
              </div>
            </div>
            
            <button
              onClick={handleInstallClick}
              className="px-10 py-5 text-white text-xl font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.secondary_color || settings.primary_color} 100%)`,
                boxShadow: `0 20px 25px -5px ${settings.primary_color}50`
              }}
            >
              Install App Now
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-purple-300 text-sm">
              © 2026 {settings.business_name}. Built with Next.js and Supabase.
            </p>
            <p className="text-purple-300 text-sm mt-2">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
