import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import ResponsiveGrid, { ResponsiveCard } from '../components/ResponsiveGrid';
import ResponsiveFilters from '../components/ResponsiveFilters';

// ── Delivery Zones Component ─────────────────────────────────────────────────
function DeliveryZonesSection() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ zone_name: '', areas: '', delivery_fee: '0', sort_order: '0' });

  const fetchZones = useCallback(async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/delivery-zones', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { const d = await res.json(); setZones(d.zones || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchZones(); }, [fetchZones]);

  const save = async (method: string, body: any) => {
    setSaving(true);
    const token = localStorage.getItem('token');
    await fetch('/api/delivery-zones', {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    await fetchZones();
    setSaving(false);
    setShowAdd(false);
    setEditingId(null);
    setForm({ zone_name: '', areas: '', delivery_fee: '0', sort_order: '0' });
  };

  const deleteZone = async (id: string) => {
    if (!confirm('Delete this zone?')) return;
    const token = localStorage.getItem('token');
    await fetch('/api/delivery-zones', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    fetchZones();
  };

  const startEdit = (zone: any) => {
    setEditingId(zone.id);
    setForm({ zone_name: zone.zone_name, areas: zone.areas.join(', '), delivery_fee: zone.delivery_fee, sort_order: zone.sort_order });
  };

  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl md:text-lg font-semibold text-[var(--text-primary)]">🚚 Delivery Zones</h2>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
        >
          + Add Zone
        </button>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Set delivery fees per area. Customers are charged based on their city. Leave fee at 0 for free delivery.
      </p>

      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
      ) : zones.length === 0 && !showAdd ? (
        <div className="text-center py-6 border border-dashed border-[var(--border-color)] rounded-lg">
          <p className="text-[var(--text-secondary)] text-sm">No delivery zones set up yet.</p>
          <p className="text-[var(--text-secondary)] text-xs mt-1">Add zones to charge delivery fees based on customer location.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {zones.map(zone => (
            <div key={zone.id} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-3">
              {editingId === zone.id ? (
                <ZoneForm form={form} setForm={setForm} onSave={() => save('PUT', { id: zone.id, zone_name: form.zone_name, areas: form.areas.split(',').map((a: string) => a.trim()).filter(Boolean), delivery_fee: parseFloat(form.delivery_fee), sort_order: parseInt(form.sort_order) })} onCancel={() => setEditingId(null)} saving={saving} />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--text-primary)] text-sm">{zone.zone_name}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{zone.areas.join(', ') || 'No areas set'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${parseFloat(zone.delivery_fee) === 0 ? 'text-green-500' : 'text-[var(--text-primary)]'}`}>
                      {parseFloat(zone.delivery_fee) === 0 ? 'FREE' : `KES ${parseFloat(zone.delivery_fee).toLocaleString()}`}
                    </span>
                    <button type="button" onClick={() => startEdit(zone)} className="text-xs text-blue-500 hover:underline">Edit</button>
                    <button type="button" onClick={() => deleteZone(zone.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="mt-3 bg-[var(--bg-primary)] border border-emerald-500/40 rounded-lg p-4">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-3">New Delivery Zone</p>
          <ZoneForm form={form} setForm={setForm} onSave={() => save('POST', { zone_name: form.zone_name, areas: form.areas.split(',').map((a: string) => a.trim()).filter(Boolean), delivery_fee: parseFloat(form.delivery_fee), sort_order: parseInt(form.sort_order) })} onCancel={() => setShowAdd(false)} saving={saving} />
        </div>
      )}

      <p className="text-xs text-[var(--text-secondary)] mt-3">
        💡 Tip: List areas as comma-separated values, e.g. "Nairobi, CBD, Westlands". The last zone acts as the default for unmatched cities.
      </p>
    </div>
  );
}

function ZoneForm({ form, setForm, onSave, onCancel, saving }: any) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Zone Name *</label>
          <input type="text" value={form.zone_name} onChange={e => setForm((f: any) => ({ ...f, zone_name: e.target.value }))} placeholder="e.g. Nairobi CBD" className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)]" />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Delivery Fee (KES)</label>
          <input type="number" min="0" value={form.delivery_fee} onChange={e => setForm((f: any) => ({ ...f, delivery_fee: e.target.value }))} placeholder="0 = Free" className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)]" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-[var(--text-secondary)] mb-1">Areas (comma-separated)</label>
        <input type="text" value={form.areas} onChange={e => setForm((f: any) => ({ ...f, areas: e.target.value }))} placeholder="Nairobi, CBD, Westlands, Kilimani" className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)]" />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onSave} disabled={saving || !form.zone_name} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Zone'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-secondary)] text-sm rounded-lg hover:bg-[var(--bg-secondary)]">Cancel</button>
      </div>
    </div>
  );
}

export default function ShopSettingsPage() {
  const [settings, setSettings] = useState({
    business_name: '',
    business_tagline: '',
    business_type: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    logo_url: '',
    primary_color: '#10b981',
    currency: 'KES',
    currency_symbol: 'KSh',
    tiktok_url: '',
    instagram_url: '',
    facebook_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const [slug, setSlug] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [slugSaving, setSlugSaving] = useState(false);
  const [slugEditing, setSlugEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const shopUrl = typeof window !== 'undefined' && slug
    ? `${window.location.origin}/s/${slug}`
    : '';

  const onlineShopUrl = typeof window !== 'undefined' && slug
    ? `${window.location.origin}/shop/${slug}`
    : '';

  const [copiedShop, setCopiedShop] = useState(false);

  const handleCopyShopUrl = () => {
    if (!onlineShopUrl) return;
    navigator.clipboard.writeText(onlineShopUrl);
    setCopiedShop(true);
    setTimeout(() => setCopiedShop(false), 2000);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Try to get user from localStorage, but fallback to fetching default settings
      const userData = localStorage.getItem('user');
      let url = '/api/shop-settings';
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.email) {
            url = `/api/shop-settings?email=${encodeURIComponent(user.email)}`;
          }
        } catch (e) {
          console.log('Could not parse user data, fetching default settings');
        }
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok && data.settings) {
        setSettings(data.settings);
      }

      // Fetch tenant slug - always use Prime Tech's slug
      const token = localStorage.getItem('token');
      const tenantRes = await fetch('/api/tenant', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      if (tenantRes.ok) {
        const tenantData = await tenantRes.json();
        if (tenantData.tenant?.slug) {
          setSlug(tenantData.tenant.slug);
          setSlugInput(tenantData.tenant.slug);
        }
        // No fallback to hardcoded slug — if no tenant, show nothing
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (!shopUrl) return;
    navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSlug = async () => {
    if (!slugInput || slugInput === slug) { setSlugEditing(false); return; }
    setSlugSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tenant/update-slug', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ slug: slugInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSlug(data.slug);
      setSlugInput(data.slug);
      setSlugEditing(false);
      showToast('Shop URL updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update slug', 'error');
    } finally {
      setSlugSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/shop-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Settings saved successfully! Refresh to see changes.', 'success');
      } else {
        showToast(data.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] p-4 md:p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)]">Shop Settings</h1>
          <p className="text-base md:text-sm text-[var(--text-secondary)] mt-2">
            Customize your shop's branding and business information
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Online Shop Link — share with customers */}
          {slug && (
            <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-2 border-emerald-500/50 rounded-xl p-4 md:p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    🛍️ Your Online Shop
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Share this link with your customers so they can browse and buy online.
                  </p>
                </div>
                <a
                  href={onlineShopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  Preview ↗
                </a>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[var(--bg-primary)] border border-emerald-500/40 rounded-lg px-4 py-3 text-sm text-emerald-300 font-mono truncate select-all">
                  {onlineShopUrl}
                </div>
                <button
                  type="button"
                  onClick={handleCopyShopUrl}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap min-w-[110px]"
                >
                  {copiedShop ? '✓ Copied!' : '📋 Copy Link'}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
                <span className="bg-[var(--bg-primary)] px-2 py-1 rounded">📱 Works on mobile</span>
                <span className="bg-[var(--bg-primary)] px-2 py-1 rounded">🔒 Secure checkout</span>
                <span className="bg-[var(--bg-primary)] px-2 py-1 rounded">📦 Live inventory</span>
              </div>
            </div>
          )}

          {/* Shop URL */}
          {slug && (
            <div className="bg-[var(--bg-tertiary)] border border-emerald-500/30 rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-lg font-semibold text-[var(--text-primary)] mb-1">Your Shop URL</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Share this link with your customers. They can view your shop page and log in from here.
              </p>

              {/* URL display + copy */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-emerald-400 font-mono truncate">
                  {shopUrl}
                </div>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
                <a
                  href={shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  Open ↗
                </a>
              </div>

              {/* Slug editor */}
              <div>
                <p className="text-xs text-[var(--text-secondary)] mb-2">
                  Slug: <span className="font-mono text-[var(--text-primary)]">{slug}</span>
                  {!slugEditing && (
                    <button
                      type="button"
                      onClick={() => setSlugEditing(true)}
                      className="ml-2 text-emerald-500 hover:text-emerald-400 text-xs underline"
                    >
                      Customize
                    </button>
                  )}
                </p>
                {slugEditing && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-[var(--text-secondary)] whitespace-nowrap">/s/</span>
                    <input
                      type="text"
                      value={slugInput}
                      onChange={e => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono focus:ring-2 focus:ring-emerald-500"
                      placeholder="your-shop-name"
                    />
                    <button
                      type="button"
                      onClick={handleSaveSlug}
                      disabled={slugSaving}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {slugSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSlugEditing(false); setSlugInput(slug); }}
                      className="px-3 py-2 border border-[var(--border-color)] text-[var(--text-secondary)] text-sm rounded-lg hover:bg-[var(--bg-secondary)]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  Lowercase letters, numbers and hyphens only. This is your permanent link until you connect a custom domain.
                </p>
              </div>
            </div>
          )}

          {/* Business Information */}
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4 md:p-6">
            <h2 className="text-xl md:text-lg font-semibold text-[var(--text-primary)] mb-4">Business Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={settings.business_name}
                  onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.business_tagline}
                  onChange={(e) => setSettings({ ...settings, business_tagline: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your tagline"
                />
              </div>

              <div>
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Business Type
                </label>
                <select
                  value={settings.business_type}
                  onChange={(e) => setSettings({ ...settings, business_type: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Type</option>
                  <option value="Retail Store">Retail Store</option>
                  <option value="Supermarket">Supermarket</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Electronics Shop">Electronics Shop</option>
                  <option value="Clothing Store">Clothing Store</option>
                  <option value="Hardware Store">Hardware Store</option>
                  <option value="Bookstore">Bookstore</option>
                  <option value="Convenience Store">Convenience Store</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={settings.logo_url}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-sm md:text-xs text-[var(--text-secondary)] mt-2">
                  Enter a direct link to your logo image (PNG, JPG, or SVG)
                </p>
                {settings.logo_url && (
                  <div className="mt-3 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg">
                    <p className="text-xs text-[var(--text-secondary)] mb-2">Logo Preview (will appear circular in sidebar):</p>
                    <img 
                      src={settings.logo_url} 
                      alt="Logo preview" 
                      className="w-14 h-14 object-cover rounded-full border-2 border-emerald-500/20"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <p className="text-xs text-red-500 hidden">Failed to load image</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Business Email
                </label>
                <input
                  type="email"
                  value={settings.business_email}
                  onChange={(e) => setSettings({ ...settings, business_email: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500"
                  placeholder="business@example.com"
                />
              </div>

              <div>
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Business Phone
                </label>
                <input
                  type="tel"
                  value={settings.business_phone}
                  onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500"
                  placeholder="+254 700 000 000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Business Address
                </label>
                <textarea
                  value={settings.business_address}
                  onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                  rows={3}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your business address"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4 md:p-6">
            <h2 className="text-xl md:text-lg font-semibold text-[var(--text-primary)] mb-4">Branding</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="h-12 w-20 rounded border border-[var(--border-color)]"
                  />
                  <input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)]"
                    placeholder="#10b981"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4 md:p-6">
            <h2 className="text-xl md:text-lg font-semibold text-[var(--text-primary)] mb-4">Currency</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Currency Code
                </label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500"
                  placeholder="KES"
                />
              </div>

              <div>
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={settings.currency_symbol}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500"
                  placeholder="KSh"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4 md:p-6">
            <h2 className="text-xl md:text-lg font-semibold text-[var(--text-primary)] mb-4">Social Media Links</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Add your social media profile URLs. These will appear on your landing page.
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  TikTok URL
                </label>
                <input
                  type="url"
                  value={settings.tiktok_url}
                  onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://www.tiktok.com/@yourusername"
                />
              </div>

              <div>
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={settings.instagram_url}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://www.instagram.com/yourusername"
                />
              </div>

              <div>
                <label className="block text-base md:text-sm font-medium text-[var(--text-primary)] mb-2">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={settings.facebook_url}
                  onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-base text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://www.facebook.com/yourpage"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <DeliveryZonesSection />

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 text-base border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 text-base bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
