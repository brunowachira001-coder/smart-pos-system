/**
 * Tenant-branded login page
 * Route: /s/[slug]/login
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  theme_color: string;
  logo_url: string | null;
  tagline: string | null;
}

export default function TenantLogin() {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [btnHover, setBtnHover] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger fade-in after mount
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!slug) return;
    const token = localStorage.getItem('token');
    if (token) { router.replace('/dashboard-pro'); return; }
    fetch(`/api/tenant/by-slug/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.tenant) setTenant(d.tenant); else setNotFound(true); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Login failed');
      if (!data.is_super_admin && data.user.tenant_id !== tenant?.id) {
        throw new Error('This account does not belong to this shop');
      }
      const user = {
        id: data.user.id,
        username: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role || 'Admin',
        system_role: data.user.system_role || 'user',
        tenant_id: data.user.tenant_id,
      };
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tenant_id', user.tenant_id || '');
      router.push(data.is_super_admin ? '/admin' : '/dashboard-pro');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, sans-serif', color: '#e2e8f0' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Shop not found</h1>
        <Link href="/" style={{ color: '#10b981', textDecoration: 'none' }}>← Back to home</Link>
      </div>
    );
  }

  if (!tenant) return null;

  const color = tenant.theme_color || '#10b981';
  const initial = tenant.name.charAt(0).toUpperCase();

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'Inter, -apple-system, sans-serif',
  };

  return (
    <>
      <Head>
        <title>Sign In — {tenant.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-card { animation: fadeSlideIn 0.5s ease forwards; }
        .left-panel { animation: fadeSlideIn 0.5s ease 0.1s both; }
        input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: 'flex',
      }}>
        {/* Left panel — desktop only */}
        <div className="left-panel hidden lg:flex" style={{
          width: '50%', padding: '52px', flexDirection: 'column',
          justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '20%', left: '20%', width: 320, height: 320, borderRadius: '50%', background: color, opacity: 0.08, filter: 'blur(70px)' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} style={{
                  width: 54, height: 54, borderRadius: '50%', objectFit: 'cover',
                  border: `2px solid ${color}`, background: '#fff', padding: 3,
                  boxShadow: `0 4px 16px ${color}30`,
                }} />
              ) : (
                <div style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 800, color: '#fff',
                  boxShadow: `0 4px 16px ${color}30`,
                }}>
                  {initial}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.01em' }}>{tenant.name}</div>
                {tenant.tagline && <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{tenant.tagline}</div>}
              </div>
            </div>

            <h1 style={{ fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em' }}>
              Business Management<br />
              <span style={{ color }}> System</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, maxWidth: 360 }}>
              Streamline your inventory, boost sales, and grow your business with our modern POS solution.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {[
              { icon: '📦', text: 'Real-time inventory tracking' },
              { icon: '💬', text: 'Customer management & SMS' },
              { icon: '📊', text: 'Advanced analytics & reports' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, color: '#94a3b8', fontSize: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `${color}15`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: 14,
                }}>
                  {f.icon}
                </div>
                <span style={{ fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — login form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
          <div className="login-card" style={{ width: '100%', maxWidth: 420 }}>
            {/* Mobile logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} style={{
                  width: 46, height: 46, borderRadius: '50%', objectFit: 'cover',
                  border: `2px solid ${color}`, background: '#fff', padding: 2,
                  boxShadow: `0 4px 12px ${color}25`,
                }} />
              ) : (
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: '#fff',
                  boxShadow: `0 4px 12px ${color}25`,
                }}>
                  {initial}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: 16, letterSpacing: '-0.01em' }}>{tenant.name}</div>
                {tenant.tagline && <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{tenant.tagline}</div>}
              </div>
            </div>

            {/* Card */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 20,
              padding: '36px 32px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset',
            }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>Welcome back</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>Sign in to your account to continue</p>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 7, fontWeight: 500, letterSpacing: '0.01em' }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={inputBase}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = color;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${color}18`;
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 7, fontWeight: 500, letterSpacing: '0.01em' }}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={inputBase}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = color;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${color}18`;
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {error && (
                  <div style={{
                    padding: '11px 14px', borderRadius: 10,
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                    color: '#fca5a5', fontSize: 13, lineHeight: 1.5,
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  onMouseEnter={() => setBtnHover(true)}
                  onMouseLeave={() => setBtnHover(false)}
                  style={{
                    padding: '14px',
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15,
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    marginTop: 4,
                    letterSpacing: '0.01em',
                    boxShadow: btnHover && !submitting
                      ? `0 8px 24px ${color}45`
                      : `0 4px 12px ${color}25`,
                    transform: btnHover && !submitting ? 'translateY(-1px)' : 'translateY(0)',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, -apple-system, sans-serif',
                  }}
                >
                  {submitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <a href="#" style={{ fontSize: 13, color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                  Forgot your password?
                </a>
              </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#334155' }}>
              Protected by enterprise-grade security
            </p>
            <p style={{ textAlign: 'center', marginTop: 6, fontSize: 12 }}>
              <Link href={`/s/${slug}`} style={{ color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                ← Back to {tenant.name}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
