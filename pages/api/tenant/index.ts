import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, getAdminDb } from '../../../lib/secure-route';

// Tenant API - Returns the authenticated user's own tenant
// SECURITY: Never falls back to another tenant. If no valid auth, returns 401.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return getTenant(req, res);
  if (req.method === 'PUT') return updateTenant(req, res);
  return res.status(405).json({ error: 'Method not allowed' });
}

async function getTenant(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;

    // SECURITY: No auth = no tenant. Never fall back to another tenant.
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7).trim();
    let userId: string;
    try {
      userId = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = getAdminDb();

    // Get user's tenant_id from the users table (custom auth system)
    const { data: user, error: userError } = await db
      .from('users')
      .select('tenant_id, system_role')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Superadmin has no tenant — return null
    if (user.system_role === 'superadmin' || !user.tenant_id) {
      return res.status(200).json({ tenant: null });
    }

    // Fetch this user's specific tenant — never any other
    const { data: tenant, error: tenantError } = await db
      .from('tenants')
      .select('*')
      .eq('id', user.tenant_id)
      .single();

    if (tenantError || !tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    return res.status(200).json({ tenant });
  } catch (error: any) {
    console.error('[/api/tenant] GET error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function updateTenant(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7).trim();
    let userId: string;
    try {
      userId = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = getAdminDb();

    const { data: user, error: userError } = await db
      .from('users')
      .select('tenant_id, role')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (userError || !user || !user.tenant_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!['Admin', 'Owner', 'owner', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const allowedFields = [
      'business_name', 'business_type', 'business_email', 'business_phone',
      'tagline', 'logo_url', 'primary_color', 'secondary_color',
      'sms_sender_name', 'currency', 'currency_symbol',
      'instagram_url', 'facebook_url', 'tiktok_url', 'whatsapp'
    ];

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // SECURITY: always scope update to this user's own tenant
    const { data: tenant, error } = await db
      .from('tenants')
      .update(updates)
      .eq('id', user.tenant_id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ tenant });
  } catch (error: any) {
    console.error('[/api/tenant] PUT error:', error);
    return res.status(500).json({ error: error.message });
  }
}
