import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard-pro');
      return;
    }

    // PWA install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [router]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
    setDeferredPrompt(null);
  };

  const features = [
    { icon: '🛒', title: 'Point of Sale', desc: 'Fast checkout with barcode scanning, retail & wholesale pricing' },
    { icon: '📦', title: 'Inventory Management', desc: 'Real-time stock tracking, low stock alerts, and restocking' },
    { icon: '📊', title: 'Sales Analytics', desc: 'Detailed reports on revenue, profit margins, and trends' },
    { icon: '👥', title: 'Customer Management', desc: 'Customer profiles, credit limits, and debt tracking' },
    { icon: '↩️', title: 'Returns & Refunds', desc: 'Streamlined return processing with inventory restoration' },
    { icon: '💸', title: 'Expense Tracking', desc: 'Monitor business expenses and calculate net revenue' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-sm font-bold">N</div>
          <span className="font-bold text-lg">Nyla Wigs POS</span>
        </div>
        <Link
          href="/login"
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors"
        >
          Login
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto">
        {/* Icon */}
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-3xl mb-8">
          💎
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Nyla Wigs
          <span className="block text-emerald-400">Smart POS System</span>
        </h1>

        <p className="text-lg text-gray-400 mb-10 max-w-xl">
          Manage your wig business with ease. Track sales, inventory, customers, and profits — all in one powerful dashboard.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-semibold text-base transition-colors flex items-center gap-2"
          >
            🚀 Login to Dashboard
          </Link>
          {showInstall && (
            <button
              onClick={handleInstall}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-base transition-colors flex items-center gap-2"
            >
              ⬇️ Install App
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 w-full max-w-lg">
          {[
            { value: '121+', label: 'Products' },
            { value: '54+', label: 'Customers' },
            { value: '100%', label: 'Cloud Sync' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to run your business</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-emerald-500/30 transition-all"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Log in to your Nyla Wigs dashboard and take control of your business today.</p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-semibold text-lg transition-colors"
          >
            Login to Dashboard →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 Nyla Wigs · Smart POS System · Built for Nyla Wigs Kenya</p>
      </footer>
    </div>
  );
}
