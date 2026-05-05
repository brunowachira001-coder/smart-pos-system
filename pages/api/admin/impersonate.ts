/**
 * POST /api/admin/impersonate
 * Superadmin only. Returns a token scoped to the first admin user of a tenant.
 * This allows the superadmin to enter any tenant's dashboard.
 */
import { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, requireSuperAdmin, signToken, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireSuperAdmin(req, res)) return;

  const { tenant_id } = req.body;
  if (!tenant_id) {
    return res.status(400).json({ error: 'tenant_id is required' });
  }

  const db = getAdminDb();

  // Find the first active admin/owner user for this tenant
  const { data: user, error } = await db
    .from('users')
    .select('id, email, full_name, role, system_role, tenant_id')
    .eq('tenant_id', tenant_id)
    .eq('is_active', true)
    .in('role', ['Admin', 'Owner', 'owner', 'admin'])
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !user) {
    // Fallback: get any active user for this tenant
    const { data: anyUser, error: anyError } = await db
      .from('users')
      .select('id, email, full_name, role, system_role, tenant_id')
      .eq('tenant_id', tenant_id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (anyError || !anyUser) {
      return res.status(404).json({ error: 'No active users found for this tenant' });
    }

    const token = signToken(anyUser.id);
    return res.status(200).json({
      token,
      user: {
        id: anyUser.id,
        email: anyUser.email,
        full_name: anyUser.full_name,
        role: anyUser.role,
        system_role: 'user', // Force non-superadmin context
        tenant_id: anyUser.tenant_id,
      }
    });
  }

  const token = signToken(user.id);
  return res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      system_role: 'user', // Force non-superadmin context so dashboard loads correctly
      tenant_id: user.tenant_id,
    }
  });
});
