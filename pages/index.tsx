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

            {/* Features - Compact */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
                <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-xs font-medium">Inventory</p>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
                <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-xs font-medium">Sales</p>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
                <div className="w-8 h-8 bg-pink-600/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-xs font-medium">Customers</p>
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
        <footer className="py-4 px-4 text-center border-t border-gray-800">
          <p className="text-xs text-gray-600">
            © 2024 {shopName}. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
