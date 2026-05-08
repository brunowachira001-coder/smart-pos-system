import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useShopSettings } from '../hooks/useShopSettings';

export default function Login() {
  const router = useRouter();
  const { settings, loading: settingsLoading } = useShopSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (router.query.registered) {
      setSuccess('Shop created! Sign in with your new credentials.');
    }
  }, [router.query]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || '', password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const user = {
          id: data.user.id,
          username: data.user.full_name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role || 'Admin',
          system_role: data.user.system_role || 'user',
          tenant_id: data.tenant_id || data.user.tenant_id,
        };
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('tenant_id', user.tenant_id || '');

        if (data.is_first_login) {
          localStorage.setItem('is_first_login', 'true');
        }

        if (data.is_super_admin) {
          router.push('/admin');
        } else {
          router.push('/dashboard-pro');
        }
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Left Panel */}
      <div 
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between"
        style={{ 
          background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.secondary_color || settings.primary_color} 100%)`
        }}
      >
        <div>
          <div className="flex items-center gap-4 mb-2">
            {settings.logo_url ? (
              <>
                <img 
                  src={settings.logo_url} 
                  alt={settings.business_name}
                  className="w-20 h-20 object-contain rounded-full bg-white p-2 border-4 border-white/20"
                  style={{ maxWidth: '80px', maxHeight: '80px' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full items-center justify-center hidden border-4 border-white/20">
                  <span className="text-4xl font-bold text-indigo-100">{settings.business_name.charAt(0)}</span>
                </div>
              </>
            ) : (
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/20">
                <span className="text-4xl font-bold text-indigo-100">{settings.business_name.charAt(0)}</span>
              </div>
            )}
            <div>
              <span className="text-indigo-100 text-3xl font-bold block">{settings.business_name}</span>
              {settings.business_tagline && (
                <span className="text-purple-200 text-base">{settings.business_tagline}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <div className="w-96 h-96 relative">
              <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                <path d="M200 240 L320 180 L320 200 L200 260 L80 200 L80 180 Z" fill="#ffffff" opacity="0.95"/>
                <g>
                  <path d="M140 140 L170 125 L170 165 L140 180 Z" fill="#60a5fa" opacity="1"/>
                  <path d="M170 125 L200 140 L200 180 L170 165 Z" fill="#3b82f6" opacity="1"/>
                  <path d="M140 180 L170 165 L200 180 L170 195 Z" fill="#2563eb" opacity="1"/>
                  <path d="M200 140 L230 125 L230 165 L200 180 Z" fill="#34d399" opacity="1"/>
                  <path d="M230 125 L260 140 L260 180 L230 165 Z" fill="#10b981" opacity="1"/>
                  <path d="M200 180 L230 165 L260 180 L230 195 Z" fill="#059669" opacity="1"/>
                  <path d="M260 140 L290 125 L290 165 L260 180 Z" fill="#fb923c" opacity="1"/>
                  <path d="M290 125 L320 140 L320 180 L290 165 Z" fill="#f97316" opacity="1"/>
                  <path d="M260 180 L290 165 L320 180 L290 195 Z" fill="#ea580c" opacity="1"/>
                </g>
                <g transform="translate(150, 100)">
                  <rect x="0" y="0" width="100" height="70" rx="4" fill="#1e293b" opacity="1"/>
                  <rect x="5" y="5" width="90" height="50" rx="2" fill="#0ea5e9" opacity="0.5"/>
                  <line x1="10" y1="15" x2="50" y2="15" stroke="#ffffff" strokeWidth="2" opacity="1"/>
                  <line x1="10" y1="25" x2="70" y2="25" stroke="#ffffff" strokeWidth="2" opacity="1"/>
                  <line x1="10" y1="35" x2="60" y2="35" stroke="#ffffff" strokeWidth="2" opacity="1"/>
                  <line x1="10" y1="45" x2="40" y2="45" stroke="#ffffff" strokeWidth="2" opacity="1"/>
                  <circle cx="75" cy="20" r="6" fill="#10b981" opacity="1"/>
                  <circle cx="75" cy="35" r="6" fill="#f59e0b" opacity="1"/>
                </g>
                <g transform="translate(80, 200)">
                  <path d="M5 5 L10 5 L15 25 L35 25" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="1"/>
                  <circle cx="18" cy="30" r="3" fill="#ffffff" opacity="1"/>
                  <circle cx="32" cy="30" r="3" fill="#ffffff" opacity="1"/>
                  <path d="M15 10 L35 10 L33 20 L17 20 Z" fill="#ffffff" opacity="1"/>
                </g>
                <g transform="translate(280, 200)">
                  <rect x="0" y="0" width="40" height="25" rx="3" fill="#1e293b" opacity="1"/>
                  <line x1="5" y1="5" x2="5" y2="20" stroke="#ef4444" strokeWidth="1.5" opacity="1"/>
                  <line x1="10" y1="5" x2="10" y2="20" stroke="#ef4444" strokeWidth="2" opacity="1"/>
                  <line x1="15" y1="5" x2="15" y2="20" stroke="#ef4444" strokeWidth="1" opacity="1"/>
                  <line x1="20" y1="5" x2="20" y2="20" stroke="#ef4444" strokeWidth="2.5" opacity="1"/>
                  <line x1="25" y1="5" x2="25" y2="20" stroke="#ef4444" strokeWidth="1.5" opacity="1"/>
                  <line x1="30" y1="5" x2="30" y2="20" stroke="#ef4444" strokeWidth="1" opacity="1"/>
                  <line x1="35" y1="5" x2="35" y2="20" stroke="#ef4444" strokeWidth="2" opacity="1"/>
                </g>
                <g opacity="1">
                  <circle cx="120" cy="220" r="14" fill="#e0e7ff"/>
                  <rect x="113" y="234" width="14" height="30" rx="3" fill="#f97316"/>
                  <path d="M113 248 L106 264 M127 248 L134 264" stroke="#f97316" strokeWidth="4" strokeLinecap="round"/>
                  <circle cx="280" cy="220" r="14" fill="#e0e7ff"/>
                  <rect x="273" y="234" width="14" height="30" rx="3" fill="#6366f1"/>
                  <path d="M273 248 L266 264 M287 248 L294 264" stroke="#6366f1" strokeWidth="4" strokeLinecap="round"/>
                </g>
                <g opacity="1">
                  <rect x="50" y="100" width="35" height="35" rx="5" fill="#6366f1" opacity="0.9"/>
                  <path d="M55 120 L60 115 L65 118 L70 110 L75 112" stroke="#ffffff" strokeWidth="3" fill="none" opacity="1"/>
                  <circle cx="60" cy="115" r="2" fill="#ffffff"/>
                  <circle cx="65" cy="118" r="2" fill="#ffffff"/>
                  <circle cx="70" cy="110" r="2" fill="#ffffff"/>
                  <circle cx="350" cy="120" r="18" fill="#a855f7" opacity="0.9"/>
                  <text x="343" y="130" fill="#ffffff" fontSize="24" fontWeight="bold" opacity="1">$</text>
                </g>
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-indigo-100">Business Management System</h2>
          <p className="text-purple-200 leading-relaxed">
            {settings.business_tagline || 'Manage your inventory, track sales, and grow your business with our comprehensive POS system.'}
          </p>
          <div className="space-y-2 text-indigo-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              <span>Real-time inventory tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              <span>Customer management & SMS notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              <span>Sales analytics & reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-900">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="flex items-center gap-4 mb-2">
              {settings.logo_url ? (
                <>
                  <img 
                    src={settings.logo_url} 
                    alt={settings.business_name}
                    className="w-16 h-16 object-contain rounded-full bg-white p-2 border-4 border-slate-700"
                    style={{ maxWidth: '64px', maxHeight: '64px' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-16 h-16 rounded-full items-center justify-center hidden border-4 border-slate-700"
                    style={{ backgroundColor: settings.primary_color + '20' }}
                  >
                    <span className="text-2xl font-bold text-indigo-100">{settings.business_name.charAt(0)}</span>
                  </div>
                </>
              ) : (
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-slate-700"
                  style={{ backgroundColor: settings.primary_color + '20' }}
                >
                  <span className="text-2xl font-bold text-indigo-100">{settings.business_name.charAt(0)}</span>
                </div>
              )}
              <div>
                <span className="text-white text-3xl font-bold block">{settings.business_name}</span>
                {settings.business_tagline && (
                  <span className="text-slate-400 text-base">{settings.business_tagline}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all placeholder-slate-400"
                style={{ '--tw-ring-color': settings.primary_color } as React.CSSProperties}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all placeholder-slate-400"
                style={{ '--tw-ring-color': settings.primary_color } as React.CSSProperties}
                placeholder="Enter your password"
              />
            </div>

            {success && (
              <div className="p-3 rounded-lg text-sm bg-green-500/10 border border-green-500/20 text-green-400">
                {success}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
              style={{ 
                backgroundColor: settings.primary_color,
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = settings.secondary_color || settings.primary_color;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = settings.primary_color;
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a 
              href="#" 
              className="text-sm hover:underline"
              style={{ color: settings.primary_color }}
            >
              Forgot your password?
            </a>
          </div>

          <p className="text-center text-slate-500 text-sm mt-6">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}
