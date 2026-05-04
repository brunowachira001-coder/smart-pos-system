/**
 * Admin-only tenant management
 * GET  /api/admin/tenants       → list all tenants
 * POST /api/admin/tenants       → create tenant + owner user
 *
 * Requires system_role = 'superadmin'
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  const db = getAdminDb();

  // Only superadmins can access this endpoint
  if (req.user.role !== 'superadmin' && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden — superadmin only' });
  }

  // ── GET: list all tenants ──────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data: tenants, error } = await db
      .from('tenants')
      .select('id, business_name, slug, business_email, business_phone, is_active, theme_color, created_at')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Get user counts per tenant
    const { data: userCounts } = await db
      .from('users')
      .select('tenant_id');

    const countMap: Record<string, number> = {};
    userCounts?.forEach(u => {
      countMap[u.tenant_id] = (countMap[u.tenant_id] || 0) + 1;
    });

    const enriched = tenants?.map(t => ({ ...t, user_count: countMap[t.id] || 0 }));
    return res.status(200).json({ tenants: enriched || [] });
  }

  // ── POST: create tenant + owner ────────────────────────────────────────────
  if (req.method === 'POST') {
    const {
      business_name,
      slug,
      business_email,
      business_phone,
      business_type = 'Retail Store',
      currency = 'KES',
      currency_symbol = 'KSh',
      theme_color = '#10b981',
      owner_name,
      owner_email,
      owner_password,
    } = req.body;

    if (!business_name || !slug || !owner_email || !owner_password) {
      return res.status(400).json({ error: 'business_name, slug, owner_email, and owner_password are required' });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' });
    }

    // Check slug uniqueness
    const { data: existing } = await db.from('tenants').select('id').eq('slug', slug).single();
    if (existing) return res.status(409).json({ error: `Slug "${slug}" is already taken` });

    try {
      // 1. Create tenant
      const { data: tenant, error: tenantError } = await db
        .from('tenants')
        .insert({
          business_name,
          slug,
          subdomain: slug,
          business_email,
          business_phone,
          business_type,
          currency,
          currency_symbol,
          theme_color,
          sms_sender_name: slug.toUpperCase(),
          is_active: true,
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // 2. Create Supabase auth user
      const { data: authData, error: authError } = await db.auth.admin.createUser({
        email: owner_email,
        password: owner_password,
        email_confirm: true,
        user_metadata: { full_name: owner_name, tenant_id: tenant.id },
      });

      if (authError) {
        await db.from('tenants').delete().eq('id', tenant.id);
        throw authError;
      }

      // 3. Hash password and create users record
      const passwordHash = await bcrypt.hash(owner_password, 12);
      const { error: userError } = await db.from('users').insert({
        id: authData.user.id,
        tenant_id: tenant.id,
        full_name: owner_name || owner_email,
        email: owner_email.toLowerCase().trim(),
        password_hash: passwordHash,
        role: 'Admin',
        is_active: true,
        is_first_login: true, // will see welcome banner on first login
      });

      if (userError) throw userError;

      // 4. Seed default SMS templates
      await db.from('message_templates').insert([
        {
          tenant_id: tenant.id,
          name: 'Thank You',
          message_text: 'Hi {customer_name}! Thank you for shopping at {shop_name}. We appreciate your business! 🙏',
          message_type: 'thank_you',
          is_active: true,
        },
      ]).select();

      return res.status(201).json({
        success: true,
        tenant,
        owner: { id: authData.user.id, email: owner_email },
        message: `Tenant "${business_name}" created. Owner can login with ${owner_email}.`,
      });
    } catch (err: any) {
      console.error('Admin tenant creation error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
