/**
 * Admin — Tenant Detail Page
 * Route: /admin/tenants/[id]
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export default function TenantDetail() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [tenant, setTenant] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [msg, setMsg] = useState('');
  const [userForm, setUserForm] = useState({ full_name: '', email: '', password: '', role: 'Cashier' });

  useEffect(() => {
    if (!id) return;
    // Frontend guard — backend enforces independently
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.system_role !== 'superadmin' && u.role !== 'Admin') {
        router.replace('/dashboard-pro');
        return;
      }
    } catch {}
    fetch(`/api/admin/tenants/${id}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setTenant(d.tenant); setUsers(d.users || []); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ ...userForm, tenant_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg(`✅ User ${userForm.email} added`);
      setShowAddUser(false);
      setUserForm({ full_name: '', email: '', password: '', role: 'Cashier' });
      setUsers(prev => [...prev, data.user]);
    } catch (err: any) { setMsg(`❌ ${err.message}`); }
    finally { setAddingUser(false); }
  };

  const resetPassword = async (userId: string) => {
    const newPwd = prompt('Enter new password (min 8 chars):');
    if (!newPwd || newPwd.length < 8) return;
    const res = await fetch('/api/admin/users', {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({ user_id: userId, new_password: newPwd }),
    });
    const data = await res.json();
    setMsg(res.ok ? '✅ Password reset' : `❌ ${data.error}`);
  };

  const toggleUserActive = async (userId: string, current: boolean) => {
    await fetch('/api/admin/users', {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({ user_id: userId, is_active: !current }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !current } : u));
  };

  const s = {
    page: { minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    main: { padding: '32px', maxWidth: 1000, margin: '0 auto' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 20 },
    btn: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
    input: { width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
    label: { display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 },
  };

  if (loading) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#64748b' }}>Loading...</div></div>;
  if (!tenant) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#64748b' }}>Tenant not found</div></div>;

  return (
    <>
      <Head><title>{tenant.business_name} — Admin</title></Head>
      <div style={s.page}>
        <div style={{ padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/admin')} style={{ ...s.btn, background: 'rgba(255,255,255,0.07)', color: '#94a3b8' }}>← Back</button>
          <span style={{ color: '#64748b' }}>/</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{tenant.business_name}</span>
        </div>

        <div style={s.main}>
          {msg && <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: msg.startsWith('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: msg.startsWith('✅') ? '#6ee7b7' : '#fca5a5', fontSize: 14 }}>{msg}</div>}

          {/* Tenant info */}
          <div style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: tenant.theme_color || '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff' }}>
                {tenant.business_name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{tenant.business_name}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>slug: <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{tenant.slug}</span></div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: tenant.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: tenant.is_active ? '#6ee7b7' : '#fca5a5' }}>
                  {tenant.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { label: 'Email', value: tenant.business_email || '—' },
                { label: 'Phone', value: tenant.business_phone || '—' },
                { label: 'Currency', value: tenant.currency || '—' },
                { label: 'Type', value: tenant.business_type || '—' },
                { label: 'Created', value: new Date(tenant.created_at).toLocaleDateString() },
                { label: 'Users', value: users.length },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: '#e2e8f0', fontSize: 14 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Users */}
          <div style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: 16, fontWeight: 700 }}>Users ({users.length})</h3>
              <button onClick={() => setShowAddUser(true)} style={{ ...s.btn, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>+ Add User</button>
            </div>

            {users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>No users yet</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Name', 'Email', 'Role', 'Status', 'First Login', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 12px', color: '#f1f5f9' }}>{u.full_name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 13 }}>{u.email}</td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 13 }}>{u.role}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: u.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: u.is_active ? '#6ee7b7' : '#fca5a5' }}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 11, color: u.is_first_login ? '#fbbf24' : '#64748b' }}>
                          {u.is_first_login ? 'Pending' : 'Done'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => resetPassword(u.id)} style={{ ...s.btn, background: 'rgba(255,255,255,0.07)', color: '#94a3b8', padding: '4px 10px', fontSize: 11 }}>Reset Pwd</button>
                          <button onClick={() => toggleUserActive(u.id, u.is_active)} style={{ ...s.btn, background: u.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: u.is_active ? '#fca5a5' : '#6ee7b7', padding: '4px 10px', fontSize: 11 }}>
                            {u.is_active ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUser && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: '#fff', fontWeight: 700 }}>Add User to {tenant.business_name}</h3>
                <button onClick={() => setShowAddUser(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>
              <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label style={s.label}>Full Name</label><input style={s.input} value={userForm.full_name} onChange={e => setUserForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Jane Doe" /></div>
                <div><label style={s.label}>Email *</label><input style={s.input} type="email" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@shop.com" required /></div>
                <div><label style={s.label}>Password *</label><input style={s.input} type="password" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 8 characters" required minLength={8} /></div>
                <div>
                  <label style={s.label}>Role</label>
                  <select style={s.input} value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}>
                    {['Admin', 'Manager', 'Cashier'].map(r => <option key={r} value={r} style={{ background: '#1e293b' }}>{r}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={() => setShowAddUser(false)} style={{ ...s.btn, flex: 1, background: 'rgba(255,255,255,0.07)', color: '#94a3b8' }}>Cancel</button>
                  <button type="submit" disabled={addingUser} style={{ ...s.btn, flex: 2, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', opacity: addingUser ? 0.6 : 1 }}>
                    {addingUser ? 'Adding...' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
