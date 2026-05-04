/**
 * GET  /api/admin/tenants/[id]  → tenant details + users
 * PUT  /api/admin/tenants/[id]  → update tenant (activate/deactivate, settings)
 */
import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  const db = getAdminDb();
  const { id } = req.query as { id: string };

  if (req.user.role !== 'superadmin' && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'GET') {
    const [{ data: tenant, error }, { data: users }] = await Promise.all([
      db.from('tenants').select('*').eq('id', id).single(),
      db.from('users').select('id, full_name, email, role, is_active, is_first_login, created_at').eq('tenant_id', id),
    ]);

    if (error || !tenant) return res.status(404).json({ error: 'Tenant not found' });
    return res.status(200).json({ tenant, users: users || [] });
  }

  if (req.method === 'PUT') {
    const { is_active, business_name, theme_color, business_phone, business_email } = req.body;
    const updates: any = { updated_at: new Date().toISOString() };
    if (is_active !== undefined) updates.is_active = is_active;
    if (business_name) updates.business_name = business_name;
    if (theme_color) updates.theme_color = theme_color;
    if (business_phone) updates.business_phone = business_phone;
    if (business_email) updates.business_email = business_email;

    const { data, error } = await db.from('tenants').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ tenant: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
