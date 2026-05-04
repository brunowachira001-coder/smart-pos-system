import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getTenant(req, res);
  }
  if (req.method === 'PUT') {
    return updateTenant(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function getTenant(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get tenant_id from auth token
    const authHeader = req.headers.authorization;
    let tenantId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);

      if (user) {
        const { data: tenantUser } = await supabase
          .from('tenant_users')
          .select('tenant_id, role')
          .eq('user_id', user.id)
          .single();

        tenantId = tenantUser?.tenant_id || null;
      }
    }

    // Fallback: if no auth, return the first/only tenant (for single-tenant mode)
    if (!tenantId) {
      const { data: firstTenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();
      tenantId = firstTenant?.id || null;
    }

    if (!tenantId) {
      return res.status(404).json({ error: 'No tenant found' });
    }

    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error || !tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    return res.status(200).json({ tenant });
  } catch (error: any) {
    console.error('Get tenant error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function updateTenant(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Get tenant_id and verify role
    const { data: tenantUser } = await supabase
      .from('tenant_users')
      .select('tenant_id, role')
      .eq('user_id', user.id)
      .single();

    if (!tenantUser || !['owner', 'admin'].includes(tenantUser.role)) {
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

    const { data: tenant, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenantUser.tenant_id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ tenant });
  } catch (error: any) {
    console.error('Update tenant error:', error);
    return res.status(500).json({ error: error.message });
  }
}
