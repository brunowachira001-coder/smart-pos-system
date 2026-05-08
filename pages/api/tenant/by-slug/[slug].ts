/**
 * GET /api/tenant/by-slug/[slug]
 * Public endpoint — resolves a tenant slug to branding info.
 * Returns only safe public fields (no sensitive data).
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminDb } from '../../../../lib/secure-route';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { slug } = req.query as { slug: string };
  if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  const db = getAdminDb();

  const { data: tenant, error } = await db
    .from('tenants')
    .select('id, business_name, business_type, subdomain, primary_color, is_active, tiktok_url, instagram_url, facebook_url, logo_url, tagline, business_phone')
    .eq('subdomain', slug)
    .eq('is_active', true)
    .single();

  if (error || !tenant) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  // Also fetch shop_settings for additional branding
  const { data: settings } = await db
    .from('shop_settings')
    .select('logo_url, business_tagline, business_phone, business_address, primary_color')
    .eq('tenant_id', tenant.id)
    .single();

  // Merge data: shop_settings takes precedence over tenant table
  return res.status(200).json({
    tenant: {
      id: tenant.id,
      name: tenant.business_name,
      slug: tenant.subdomain,
      type: tenant.business_type,
      theme_color: settings?.primary_color || tenant.primary_color || '#10b981',
      logo_url: settings?.logo_url || tenant.logo_url || null,
      tagline: settings?.business_tagline || tenant.tagline || null,
      phone: settings?.business_phone || tenant.business_phone || null,
      tiktok_url: tenant.tiktok_url || null,
      instagram_url: tenant.instagram_url || null,
      facebook_url: tenant.facebook_url || null,
    },
  });
}
