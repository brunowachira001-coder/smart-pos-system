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
    await deferredPrompt.userChoice;
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

      <div className="h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col">
        {/* Main Content - Centered */}
        <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
          <div className="max-w-3xl w-full text-center">
            {/* Logo - Responsive sizing */}
            {shopLogo && (
              <div className="flex justify-center mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-600 rounded-full blur-2xl opacity-40 animate-pulse-slow"></div>
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-2xl bg-white p-2 sm:p-3 animate-float">
                    <img src={shopLogo} alt={shopName} className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            )}

            {/* Title - Responsive sizing */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {shopName}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Business Management System
              </span>
            </h1>

            {/* Subtitle - Responsive sizing */}
            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.3s' }}>
              Manage your wig business with ease. Track sales, inventory, and customers.
            </p>

            {/* CTA Buttons - Responsive sizing */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={() => router.push('/login')}
                className="group px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-base sm:text-lg shadow-lg hover:shadow-indigo-500/50 hover:scale-105 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login to Dashboard
              </button>

              <button
                onClick={handleInstall}
                className="group px-8 sm:px-10 py-4 sm:py-5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl border-2 border-gray-700 hover:border-indigo-500 transition-all duration-300 flex items-center justify-center gap-2 text-base sm:text-lg hover:scale-105 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Install App
              </button>
            </div>

            {/* Trust Badge - Responsive sizing */}
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Trusted by wig businesses in Kenya</span>
            </div>
          </div>
        </main>

        {/* Footer - Minimal, matching login page */}
        <footer className="py-4 sm:py-5 px-4 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          {/* Phone Number */}
          {shopSettings?.business_phone && (
            <p className="text-xs sm:text-sm text-purple-300 mb-2 sm:mb-3">
              📞 {shopSettings.business_phone}
            </p>
          )}
          
          {/* Social Media Links */}
          <div className="flex items-center justify-center gap-4 sm:gap-5 mb-2 sm:mb-3">
            <a 
              href={shopSettings?.tiktok_url || "https://www.tiktok.com"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-pink-500 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5" 
              aria-label="TikTok"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </a>
            <a 
              href={shopSettings?.instagram_url || "https://www.instagram.com"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-pink-500 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5" 
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a 
              href={shopSettings?.facebook_url || "https://www.facebook.com"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-500 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5" 
              aria-label="Facebook"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
          
          {/* Copyright */}
          <p className="text-xs sm:text-sm text-gray-500">
            © 2026 {shopName}. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
