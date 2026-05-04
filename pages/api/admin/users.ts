/**
 * POST /api/admin/users  → add a user to an existing tenant
 * PUT  /api/admin/users  → reset password / toggle active status
 *
 * Security:
 * - requireSuperAdmin() enforced before any data access
 * - tenant_id for new users is resolved from DB (tenant lookup), never trusted from body
 * - PUT verifies target user exists before modifying
 * - No cross-tenant data leakage possible
 */
import type { NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { secureRoute, SecureRequest, getAdminDb, requireSuperAdmin } from '../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  // ── Authorization: superadmin only ────────────────────────────────────────
  if (!requireSuperAdmin(req, res)) return;

  const db = getAdminDb();

  // ── POST: add user to a tenant ────────────────────────────────────────────
  if (req.method === 'POST') {
    const { tenant_id, full_name, email, password, role = 'Cashier' } = req.body;

    if (!tenant_id || !email || !password) {
      return res.status(400).json({ error: 'tenant_id, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!['Admin', 'Manager', 'Cashier'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be Admin, Manager, or Cashier' });
    }

    // Verify tenant exists — tenant_id from body is validated against DB
    const { data: tenant, error: tenantError } = await db
      .from('tenants')
      .select('id, is_active')
      .eq('id', tenant_id)
      .single();

    if (tenantError || !tenant) return res.status(404).json({ error: 'Tenant not found' });
    if (!tenant.is_active) return res.status(400).json({ error: 'Tenant is inactive' });

    // Check email not already in use
    const { data: existingUser } = await db
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();
    if (existingUser) return res.status(409).json({ error: 'Email already in use' });

    try {
      const { data: authData, error: authError } = await db.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });
      if (authError) throw authError;

      const passwordHash = await bcrypt.hash(password, 12);
      const { data: user, error: userError } = await db.from('users').insert({
        id: authData.user.id,
        tenant_id: tenant.id,  // ← from DB-verified tenant, not raw client input
        full_name: full_name?.trim() || email,
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        role,
        system_role: 'user',
        is_active: true,
        is_first_login: true,
      }).select('id, full_name, email, role, tenant_id').single();

      if (userError) {
        await db.auth.admin.deleteUser(authData.user.id);
        throw userError;
      }

      return res.status(201).json({ user });
    } catch (err: any) {
      console.error('[admin/users POST] error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── PUT: update user (reset password / toggle active) ─────────────────────
  if (req.method === 'PUT') {
    const { user_id, new_password, is_active } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    // Verify user exists before modifying — prevents blind updates
    const { data: targetUser, error: lookupError } = await db
      .from('users')
      .select('id, tenant_id, email')
      .eq('id', user_id)
      .single();

    if (lookupError || !targetUser) return res.status(404).json({ error: 'User not found' });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    if (new_password) {
      if (new_password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      updates.password_hash = await bcrypt.hash(new_password, 12);
      updates.is_first_login = true;
      await db.auth.admin.updateUserById(user_id, { password: new_password });
    }

    const { data, error } = await db
      .from('users')
      .update(updates)
      .eq('id', user_id)
      .select('id, full_name, email, role, is_active, tenant_id')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ user: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
