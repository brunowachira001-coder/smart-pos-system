/**
 * /onboarding — post-login setup wizard
 *
 * Calls existing APIs only:
 *   Step 1 → PUT /api/shop-settings   (business details)
 *   Step 2 → PUT /api/shop-settings   (tax + payment methods)
 *   Step 3 → POST /api/products       (optional first product)
 *   Step 4 → POST /api/users          (optional staff)
 *   Step 5 → completion screen
 *
 * Progress is persisted via POST /api/onboarding/progress so users can resume.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

// ─── helpers ─────────────────────────────────────────────────────────────────

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function api(method: string, url: string, body?: object) {
  const res = await fetch(url, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── step config ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Business', icon: '🏪' },
  { id: 2, label: 'POS Setup', icon: '⚙️' },
  { id: 3, label: 'Products', icon: '📦', optional: true },
  { id: 4, label: 'Staff', icon: '👥', optional: true },
  { id: 5, label: 'Done', icon: '🎉' },
];

const CURRENCIES = ['KES', 'USD', 'UGX', 'TZS', 'NGN', 'GHS', 'ZAR'];
const PAYMENT_OPTIONS = ['Cash', 'M-Pesa', 'Card', 'Bank Transfer', 'Airtel Money'];
const BUSINESS_TYPES = [
  'Retail Store', 'Boutique / Fashion', 'Grocery / Supermarket',
  'Electronics', 'Pharmacy', 'Restaurant / Cafe', 'Hardware Store',
  'Beauty & Cosmetics', 'Wholesale', 'Other',
];

// ─── component ───────────────────────────────────────────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);

  // Step 1 — business details
  const [biz, setBiz] = useState({
    business_name: '', business_type: 'Retail Store',
    business_phone: '', business_address: '',
    currency: 'KES', currency_symbol: 'KSh',
  });

  // Step 2 — POS config
  const [pos, setPos] = useState({
    tax_rate: '16', tax_name: 'VAT',
    payment_methods: ['Cash'] as string[],
  });

  // Step 3 — first product
  const [product, setProduct] = useState({
    name: '', sku: '', price: '', stock: '0', category: '',
  });

  // Step 4 — staff
  const [staff, setStaff] = useState({ full_name: '', email: '', role: 'Cashier' });

  // Resume from saved step
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }

    fetch('/api/onboarding/progress', { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.complete) { router.replace('/dashboard-pro'); return; }
        setStep(d.step ?? 1);
        if (d.business_name) setBiz(prev => ({ ...prev, business_name: d.business_name }));
      })
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, [router]);

  const saveProgress = useCallback(async (nextStep: number) => {
    await api('POST', '/api/onboarding/progress', { step: nextStep });
    setStep(nextStep);
    setError('');
  }, []);

  // ── Step handlers ──────────────────────────────────────────────────────────

  const handleBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biz.business_name.trim()) return setError('Shop name is required');
    setLoading(true);
    try {
      // Reuses existing PUT /api/shop-settings
      await api('PUT', '/api/shop-settings', {
        business_name: biz.business_name,
        business_type: biz.business_type,
        business_phone: biz.business_phone,
        business_address: biz.business_address,
        currency: biz.currency,
        currency_symbol: biz.currency_symbol,
      });
      await saveProgress(2);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handlePOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Reuses existing PUT /api/shop-settings
      await api('PUT', '/api/shop-settings', {
        tax_rate: parseFloat(pos.tax_rate) || 0,
        tax_name: pos.tax_name,
        payment_methods: pos.payment_methods,
      });
      await saveProgress(3);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.name.trim()) return setError('Product name is required');
    setLoading(true);
    try {
      // Reuses existing POST /api/products
      await api('POST', '/api/products', {
        name: product.name,
        sku: product.sku,
        price: parseFloat(product.price) || 0,
        stock: parseInt(product.stock) || 0,
        category: product.category,
      });
      await saveProgress(4);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff.full_name.trim() || !staff.email.trim()) return setError('Name and email required');
    setLoading(true);
    try {
      // Reuses existing POST /api/users
      await api('POST', '/api/users', {
        full_name: staff.full_name,
        email: staff.email,
        role: staff.role,
      });
      await saveProgress(5);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const skip = async () => {
    setError('');
    await saveProgress(step + 1);
  };

  const finish = async () => {
    await api('POST', '/api/onboarding/progress', { step: 5 });
    router.push('/dashboard-pro');
  };

  // ── UI helpers ─────────────────────────────────────────────────────────────

  const togglePayment = (method: string) => {
    setPos(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method],
    }));
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>S</div>
            <span className="text-white font-semibold">SmartPOS Setup</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Let's get your shop ready</h1>
          <p className="text-slate-400 text-sm mt-1">Takes about 2 minutes</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: step > s.id ? '#10b981' : step === s.id ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)',
                    color: step >= s.id ? '#fff' : '#64748b',
                    border: step === s.id ? '2px solid #10b981' : '2px solid transparent',
                  }}>
                  {step > s.id ? '✓' : s.icon}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: step >= s.id ? '#94a3b8' : '#475569' }}>
                  {s.label}
                  {s.optional && <span className="text-xs ml-0.5" style={{ color: '#475569' }}> *</span>}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mb-4 transition-all"
                  style={{ background: step > s.id ? '#10b981' : 'rgba(255,255,255,0.08)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
        }}>
          {error && (
            <div className="mb-5 p-3 rounded-lg text-sm" style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5',
            }}>{error}</div>
          )}

          {/* ── Step 1: Business details ── */}
          {step === 1 && (
            <form onSubmit={handleBusiness} className="space-y-4">
              <StepHeader icon="🏪" title="Business Details" subtitle="Tell us about your shop" />
              <Field label="Shop Name *" value={biz.business_name} onChange={v => setBiz(p => ({ ...p, business_name: v }))} placeholder="e.g. Nyla Wigs" />
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Business Type</label>
                <select value={biz.business_type} onChange={e => setBiz(p => ({ ...p, business_type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t} style={{ background: '#1e293b' }}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Currency</label>
                  <select value={biz.currency} onChange={e => setBiz(p => ({ ...p, currency: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    {CURRENCIES.map(c => <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>)}
                  </select>
                </div>
                <Field label="Symbol" value={biz.currency_symbol} onChange={v => setBiz(p => ({ ...p, currency_symbol: v }))} placeholder="KSh" />
              </div>
              <Field label="Phone" value={biz.business_phone} onChange={v => setBiz(p => ({ ...p, business_phone: v }))} placeholder="+254700000000" type="tel" />
              <Field label="Address (optional)" value={biz.business_address} onChange={v => setBiz(p => ({ ...p, business_address: v }))} placeholder="Nairobi, Kenya" />
              <Btn loading={loading}>Save & Continue →</Btn>
            </form>
          )}

          {/* ── Step 2: POS config ── */}
          {step === 2 && (
            <form onSubmit={handlePOS} className="space-y-5">
              <StepHeader icon="⚙️" title="POS Configuration" subtitle="Set up tax and payment methods" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tax Name" value={pos.tax_name} onChange={v => setPos(p => ({ ...p, tax_name: v }))} placeholder="VAT" />
                <Field label="Tax Rate (%)" value={pos.tax_rate} onChange={v => setPos(p => ({ ...p, tax_rate: v }))} placeholder="16" type="number" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Payment Methods</label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_OPTIONS.map(m => (
                    <button key={m} type="button" onClick={() => togglePayment(m)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: pos.payment_methods.includes(m) ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${pos.payment_methods.includes(m) ? '#10b981' : 'rgba(255,255,255,0.12)'}`,
                        color: pos.payment_methods.includes(m) ? '#10b981' : '#94a3b8',
                      }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <Btn loading={loading}>Save & Continue →</Btn>
            </form>
          )}

          {/* ── Step 3: First product (optional) ── */}
          {step === 3 && (
            <form onSubmit={handleProduct} className="space-y-4">
              <StepHeader icon="📦" title="Add Your First Product" subtitle="Optional — you can add products later" optional />
              <Field label="Product Name *" value={product.name} onChange={v => setProduct(p => ({ ...p, name: v }))} placeholder="e.g. Human Hair Wig" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price" value={product.price} onChange={v => setProduct(p => ({ ...p, price: v }))} placeholder="2500" type="number" />
                <Field label="Stock Qty" value={product.stock} onChange={v => setProduct(p => ({ ...p, stock: v }))} placeholder="10" type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="SKU (optional)" value={product.sku} onChange={v => setProduct(p => ({ ...p, sku: v }))} placeholder="WIG-001" />
                <Field label="Category (optional)" value={product.category} onChange={v => setProduct(p => ({ ...p, category: v }))} placeholder="Wigs" />
              </div>
              <div className="flex gap-3">
                <SkipBtn onClick={skip} />
                <Btn loading={loading}>Add Product →</Btn>
              </div>
            </form>
          )}

          {/* ── Step 4: Staff (optional) ── */}
          {step === 4 && (
            <form onSubmit={handleStaff} className="space-y-4">
              <StepHeader icon="👥" title="Add a Staff Member" subtitle="Optional — you can add staff later" optional />
              <Field label="Full Name *" value={staff.full_name} onChange={v => setStaff(p => ({ ...p, full_name: v }))} placeholder="Jane Doe" />
              <Field label="Email *" value={staff.email} onChange={v => setStaff(p => ({ ...p, email: v }))} placeholder="jane@shop.com" type="email" />
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Role</label>
                <select value={staff.role} onChange={e => setStaff(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  {['Cashier', 'Manager', 'Admin'].map(r => <option key={r} value={r} style={{ background: '#1e293b' }}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <SkipBtn onClick={skip} />
                <Btn loading={loading}>Add Staff →</Btn>
              </div>
            </form>
          )}

          {/* ── Step 5: Complete ── */}
          {step === 5 && (
            <div className="text-center py-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">You're all set!</h2>
              <p className="text-slate-400 mb-8">Your shop is ready. Let's make your first sale.</p>
              <div className="space-y-3">
                <button onClick={finish}
                  className="w-full py-3 rounded-xl font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  Go to Dashboard →
                </button>
                <button onClick={() => router.push('/pos')}
                  className="w-full py-3 rounded-xl font-semibold"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8' }}>
                  Open POS & Make First Sale
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip all */}
        {step < 5 && (
          <p className="text-center mt-4 text-sm" style={{ color: '#475569' }}>
            <button onClick={() => { api('POST', '/api/onboarding/progress', { step: 5 }); router.push('/dashboard-pro'); }}
              className="hover:text-slate-400 transition-colors">
              Skip setup and go to dashboard
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── small sub-components ─────────────────────────────────────────────────────

function StepHeader({ icon, title, subtitle, optional }: { icon: string; title: string; subtitle: string; optional?: boolean }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {optional && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: '#64748b' }}>optional</span>}
      </div>
      <p className="text-slate-400 text-sm">{subtitle}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-slate-600"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        onFocus={e => e.currentTarget.style.borderColor = '#10b981'}
        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'} />
    </div>
  );
}

function Btn({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
      {loading ? 'Saving...' : children}
    </button>
  );
}

function SkipBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#64748b' }}>
      Skip for now
    </button>
  );
}
