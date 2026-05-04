/**
 * GET  /api/admin/tenants/[id]  → tenant details + users
 * PUT  /api/admin/tenants/[id]  → update tenant settings
 *
 * Security:
 * - requireSuperAdmin() enforced before any data access
 * - tenant_id comes from URL param only, never from request body
 */
import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb, requireSuperAdmin } from '../../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  // ── Authorization: superadmin only ────────────────────────────────────────
  if (!requireSuperAdmin(req, res)) return;

  const db = getAdminDb();
  const { id } = req.query as { id: string };

  // Validate id is a non-empty string (basic injection guard)
  if (!id || typeof id !== 'string' || id.length > 100) {
    return res.status(400).json({ error: 'Invalid tenant id' });
  }

  if (req.method === 'GET') {
    const [{ data: tenant, error: tenantError }, { data: users }] = await Promise.all([
      db.from('tenants').select('*').eq('id', id).single(),
      db.from('users')
        .select('id, full_name, email, role, is_active, is_first_login, created_at')
        .eq('tenant_id', id)  // tenant_id from URL param, not client body
        .order('created_at', { ascending: false }),
    ]);

    if (tenantError || !tenant) return res.status(404).json({ error: 'Tenant not found' });
    return res.status(200).json({ tenant, users: users ?? [] });
  }

  if (req.method === 'PUT') {
    // Only allow safe fields — never allow tenant_id to be changed
    const { is_active, business_name, theme_color, business_phone, business_email } = req.body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (is_active !== undefined) updates.is_active = Boolean(is_active);
    if (business_name) updates.business_name = String(business_name).trim();
    if (theme_color) updates.theme_color = String(theme_color).trim();
    if (business_phone) updates.business_phone = String(business_phone).trim();
    if (business_email) updates.business_email = String(business_email).toLowerCase().trim();

    const { data, error } = await db
      .from('tenants')
      .update(updates)
      .eq('id', id)  // id from URL param only
      .select('id, business_name, slug, is_active, theme_color, updated_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ tenant: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
