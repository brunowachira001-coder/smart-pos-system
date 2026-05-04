/**
 * POST /api/admin/users  → add a user to an existing tenant
 * PUT  /api/admin/users  → reset password / toggle active
 */
import type { NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  const db = getAdminDb();

  if (req.user.role !== 'superadmin' && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'POST') {
    const { tenant_id, full_name, email, password, role = 'Cashier' } = req.body;
    if (!tenant_id || !email || !password) {
      return res.status(400).json({ error: 'tenant_id, email, and password are required' });
    }

    // Verify tenant exists
    const { data: tenant } = await db.from('tenants').select('id').eq('id', tenant_id).single();
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    try {
      const { data: authData, error: authError } = await db.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password,
        email_confirm: true,
        user_metadata: { full_name, tenant_id },
      });
      if (authError) throw authError;

      const passwordHash = await bcrypt.hash(password, 12);
      const { data: user, error: userError } = await db.from('users').insert({
        id: authData.user.id,
        tenant_id,
        full_name: full_name || email,
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        role,
        is_active: true,
        is_first_login: true,
      }).select('id, full_name, email, role').single();

      if (userError) throw userError;
      return res.status(201).json({ user });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT') {
    const { user_id, new_password, is_active } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    const updates: any = { updated_at: new Date().toISOString() };
    if (is_active !== undefined) updates.is_active = is_active;

    if (new_password) {
      updates.password_hash = await bcrypt.hash(new_password, 12);
      updates.is_first_login = true; // force welcome on next login
      // Also update Supabase auth
      await db.auth.admin.updateUserById(user_id, { password: new_password });
    }

    const { data, error } = await db.from('users').update(updates).eq('id', user_id).select('id, full_name, email, role, is_active').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ user: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
