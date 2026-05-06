/**
 * Tenant-branded landing page
 * Route: /s/[slug]
 */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  type: string;
  theme_color: string;
  logo_url: string | null;
  tagline: string | null;
  phone: string | null;
  tiktok_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
}

// Fade-in hook — triggers once element enters viewport
function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms` } };
}

export default function TenantLanding() {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const hero = useFadeIn(0);
  const features = useFadeIn(150);
  const footer = useFadeIn(250);

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
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#e2e8f0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Shop not found</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>The shop "{slug}" doesn't exist or is inactive.</p>
        <Link href="/" style={{ color: '#10b981', textDecoration: 'none' }}>← Back to home</Link>
      </div>
    );
  }

  if (!tenant) return null;

  const color = tenant.theme_color || '#10b981';
  const initial = tenant.name.charAt(0).toUpperCase();

  return (
    <>
      <Head>
        <title>{tenant.name} — Business Management System</title>
        <meta name="description" content={`${tenant.name} — ${tenant.tagline || 'Business Management System'}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.06; }
          50% { opacity: 0.1; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        textAlign: 'center',
      }}>
        {/* Ambient glow — subtle pulse */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '15%', left: '25%', width: 500, height: 500, borderRadius: '50%', background: color, opacity: 0.06, filter: 'blur(100px)', animation: 'pulse-glow 4s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '15%', right: '25%', width: 350, height: 350, borderRadius: '50%', background: color, opacity: 0.04, filter: 'blur(80px)', animation: 'pulse-glow 4s ease-in-out infinite 2s' }} />
        </div>

        {/* Hero section */}
        <div ref={hero.ref} style={{ ...hero.style, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ marginBottom: 28 }}>
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                style={{
                  width: 100, height: 100, borderRadius: '50%', objectFit: 'cover',
                  border: `3px solid ${color}`,
                  background: '#fff', padding: 4,
                  boxShadow: `0 0 0 6px ${color}18, 0 8px 32px rgba(0,0,0,0.4)`,
                }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 42, fontWeight: 800, color: '#fff',
                boxShadow: `0 0 0 6px ${color}18, 0 8px 32px rgba(0,0,0,0.4)`,
              }}>
                {initial}
              </div>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, margin: '0 0 8px', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {tenant.name}
          </h1>
          <h2 style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: 600, margin: '0 0 16px', color, letterSpacing: '-0.01em' }}>
            Business Management System
          </h2>

          {tenant.tagline && (
            <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 460, margin: '0 auto 36px', lineHeight: 1.7 }}>
              {tenant.tagline}
            </p>
          )}

          {/* CTA button */}
          <Link
            href={`/s/${slug}/login`}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              padding: '14px 36px',
              borderRadius: 14,
              background: btnHover
                ? `linear-gradient(135deg, ${color}, ${color}dd)`
                : `linear-gradient(135deg, ${color}ee, ${color}bb)`,
              color: '#fff',
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: btnHover
                ? `0 8px 32px ${color}50, 0 2px 8px rgba(0,0,0,0.3)`
                : `0 4px 16px ${color}30, 0 2px 8px rgba(0,0,0,0.2)`,
              transform: btnHover ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em',
            }}
          >
            🔐 Login to Dashboard
          </Link>
        </div>

        {/* Features */}
        <div ref={features.ref} style={{ ...features.style, display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginTop: 48, position: 'relative', zIndex: 1 }}>
          {[
            { icon: '📦', text: 'Real-time inventory tracking' },
            { icon: '💬', text: 'Customer management & SMS' },
            { icon: '📊', text: 'Advanced analytics & reports' },
          ].map(f => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 18px',
              borderRadius: 40,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8', fontSize: 14, fontWeight: 500,
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ fontSize: 16 }}>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div ref={footer.ref} style={{ ...footer.style, position: 'relative', zIndex: 1, marginTop: 48, color: '#475569', fontSize: 13, textAlign: 'center' }}>
          {tenant.phone && (
            <div style={{ marginBottom: 10, color: '#94a3b8', fontSize: 14 }}>📞 {tenant.phone}</div>
          )}
          {(tenant.tiktok_url || tenant.instagram_url || tenant.facebook_url) && (
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 14 }}>
              {tenant.tiktok_url && (
                <a href={tenant.tiktok_url} target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = color)} onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg>
                </a>
              )}
              {tenant.instagram_url && (
                <a href={tenant.instagram_url} target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = color)} onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              )}
              {tenant.facebook_url && (
                <a href={tenant.facebook_url} target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = color)} onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
            </div>
          )}
          <div>© {new Date().getFullYear()} {tenant.name}. All rights reserved.</div>
        </div>
      </div>
    </>
  );
}
