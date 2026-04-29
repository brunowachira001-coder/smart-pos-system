import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface ShopSettings {
  shop_name?: string;
  business_name?: string;
  logo_url?: string;
  business_phone?: string;
  business_email?: string;
  business_address?: string;
  tiktok_url?: string;
  instagram_url?: string;
  facebook_url?: string;
}

export default function LandingPage() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard-pro');
      return;
    }

    // Clear old service worker cache on load
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name.includes('nyla-wigs') && !name.includes('v3')) {
            caches.delete(name);
          }
        });
      });
    }

    // Fetch shop settings
    fetch('/api/shop-settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setShopSettings(data.settings);
        }
      })
      .catch(err => console.error('Failed to load shop settings:', err));

    // PWA install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [router]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('To install this app:\n\n1. Open browser menu\n2. Select "Install App" or "Add to Home Screen"');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const shopName = shopSettings?.business_name || shopSettings?.shop_name || 'Nyla Wigs';
  const shopLogo = shopSettings?.logo_url;

  return (
    <>
      <Head>
        <title>{shopName} Inventory - Streamline Your Business</title>
        <meta name="description" content="Powerful inventory management system for modern businesses" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>

      <div className="h-screen overflow-hidden bg-black text-white flex flex-col">
        {/* Main Content - Centered */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            {/* Logo */}
            {shopLogo && (
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-600 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                  <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-2xl bg-white p-2">
                    <img src={shopLogo} alt={shopName} className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              {shopName}
              <br />
              <span className="text-indigo-500">Inventory System</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-gray-400 mb-8 max-w-xl mx-auto">
              Manage your wig business with ease. Track sales, inventory, and customers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login to Dashboard
              </button>

              <button
                onClick={handleInstall}
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl border-2 border-gray-700 transition-all duration-200 flex items-center justify-center gap-2 text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Install App
              </button>
            </div>

            {/* Features - Prominent Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 border border-indigo-500/30 rounded-xl p-5 hover:border-indigo-500/50 transition-all">
                <div className="w-12 h-12 bg-indigo-600/30 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold mb-2">Wig Inventory</h3>
                <p className="text-sm text-gray-400">Track your wig stock in real-time with low stock alerts.</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-5 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 bg-purple-600/30 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold mb-2">Sales & Profits</h3>
                <p className="text-sm text-gray-400">Detailed reports on revenue, profit margins, and trends.</p>
              </div>

              <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border border-pink-500/30 rounded-xl p-5 hover:border-pink-500/50 transition-all">
                <div className="w-12 h-12 bg-pink-600/30 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold mb-2">Customer Management</h3>
                <p className="text-sm text-gray-400">Manage customer profiles, credit limits, and debt tracking.</p>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Trusted by wig businesses in Kenya</span>
            </div>
          </div>
        </main>

        {/* Footer - Minimal */}
        <footer className="py-3 px-4 text-center border-t border-gray-800">
          {/* Phone Number */}
          {shopSettings?.business_phone && (
            <p className="text-xs text-gray-400 mb-2">
              📞 {shopSettings.business_phone}
            </p>
          )}
          
          {/* Social Media Links */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <a 
              href={shopSettings?.tiktok_url || "https://www.tiktok.com"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-pink-500 transition-colors" 
              aria-label="TikTok"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </a>
            <a 
              href={shopSettings?.instagram_url || "https://www.instagram.com"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-pink-500 transition-colors" 
              aria-label="Instagram"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a 
              href={shopSettings?.facebook_url || "https://www.facebook.com"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-500 transition-colors" 
              aria-label="Facebook"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
          
          {/* Copyright */}
          <p className="text-xs text-gray-600">
            © 2026 {shopName}. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
