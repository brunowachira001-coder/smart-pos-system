import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useShopTheme } from '@/hooks/useShopTheme';

export default function ShopAuth() {
  const router = useRouter();
  const { slug } = router.query;
  const theme = useShopTheme(slug);
  const p = theme.primary;
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/ecommerce/auth/login' : '/api/ecommerce/auth/register';
      const body = mode === 'login'
        ? { email, password, tenantSlug: slug }
        : { email, password, name, phone, tenantSlug: slug };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      // Store customer session
      localStorage.setItem(`customer_${slug}`, JSON.stringify(data.customer || data));
      router.push(`/shop/${slug}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>{mode === 'login' ? 'Sign In' : 'Register'} – {slug}</title></Head>
      <div className="min-h-screen flex">
        {/* Left — image panel */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          <div className="relative text-white text-center">
            <div className="text-8xl mb-6">🛍️</div>
            <h2 className="text-3xl font-bold mb-4">Your data privacy is our priority</h2>
            <p className="text-orange-100 text-lg">Shop safely with buyer protection on every order</p>
            <div className="mt-8 flex flex-col gap-3 text-sm text-orange-100">
              <div className="flex items-center gap-2"><span>✓</span><span>Secure checkout</span></div>
              <div className="flex items-center gap-2"><span>✓</span><span>Buyer protection guarantee</span></div>
              <div className="flex items-center gap-2"><span>✓</span><span>Easy returns & refunds</span></div>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <Link href={`/shop/${slug}`} className="block text-2xl font-extrabold  mb-8">{slug}</Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'login' ? 'Register / Sign in' : 'Create account'}
            </h1>
            <p className="text-xs text-green-600 flex items-center gap-1 mb-6">
              <span>🔒</span> Your information is protected
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none "
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none "
                  />
                </>
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none "
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none "
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full  text-white py-3 rounded font-semibold text-sm transition disabled:opacity-60"
              >
                {loading ? 'Please wait...' : 'Continue'}
              </button>
            </form>

            {mode === 'login' && (
              <button className="w-full text-center text-xs  hover:underline mt-3">
                Trouble signing in?
              </button>
            )}

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">Or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social buttons */}
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 border border-gray-300 rounded px-4 py-2.5 text-sm hover:bg-gray-50 transition">
                <span className="text-lg">🔑</span> Passkey
              </button>
              <button className="w-full flex items-center gap-3 border border-gray-300 rounded px-4 py-2.5 text-sm hover:bg-gray-50 transition">
                <span className="text-lg">G</span> google
              </button>
              <button className="w-full flex items-center gap-3 border border-gray-300 rounded px-4 py-2.5 text-sm hover:bg-gray-50 transition">
                <span className="text-lg text-blue-600">f</span> facebook
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-xs  hover:underline"
              >
                {mode === 'login' ? 'Create new account' : 'Already have an account? Sign in'}
              </button>
              <div className="text-xs text-gray-400">
                Location: Kenya ▾
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-6 leading-relaxed">
              By continuing, you confirm that you are an adult and agree to our{' '}
              <a href="#" className="underline">Terms of Service</a> and{' '}
              <a href="#" className="underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
