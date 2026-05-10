import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { secureRoute, SecureRequest, getAdminDb } from '@/lib/secure-route';

const db = getAdminDb();

// ── Public GET: look up fee by city (used by checkout) ──────────────────────
async function publicHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { tenantSlug, city } = req.query;
  if (!tenantSlug || !city) return res.status(400).json({ error: 'tenantSlug and city required' });

  const { data: tenant } = await db
    .from('tenants')
    .select('id')
    .eq('subdomain', tenantSlug as string)
    .eq('is_active', true)
    .single();

  if (!tenant) return res.status(404).json({ error: 'Shop not found' });

  const { data: zones } = await db
    .from('delivery_zones')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('sort_order');

  if (!zones || zones.length === 0) {
    return res.status(200).json({ fee: 0, zone: null, isFree: true });
  }

  const cityLower = (city as string).toLowerCase().trim();

  // Find matching zone — check if city matches any area in the zone
  const matched = zones.find(z =>
    z.areas.some((area: string) => {
      const areaLower = area.toLowerCase().trim();
      return cityLower.includes(areaLower) || areaLower.includes(cityLower);
    })
  );

  if (matched) {
    return res.status(200).json({
      fee: parseFloat(matched.delivery_fee),
      zone: matched.zone_name,
      isFree: matched.is_free || parseFloat(matched.delivery_fee) === 0,
    });
  }

  // No match — return the last zone as default (usually "Other areas")
  const defaultZone = zones[zones.length - 1];
  return res.status(200).json({
    fee: parseFloat(defaultZone.delivery_fee),
    zone: defaultZone.zone_name + ' (default)',
    isFree: defaultZone.is_free || parseFloat(defaultZone.delivery_fee) === 0,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Public lookup (no auth needed)
  if (req.method === 'GET' && req.query.tenantSlug) {
    return publicHandler(req, res);
  }

  // Authenticated management (shop owner)
  return secureRoute(async (secReq: SecureRequest, secRes: NextApiResponse) => {
    const { tenantId } = secReq;
    if (!tenantId) return secRes.status(400).json({ error: 'Tenant required' });

    if (secReq.method === 'GET') {
      const { data, error } = await db
        .from('delivery_zones')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sort_order');
      if (error) return secRes.status(500).json({ error: error.message });
      return secRes.status(200).json({ zones: data || [] });
    }

    if (secReq.method === 'POST') {
      const { zone_name, areas, delivery_fee, is_free, sort_order } = secReq.body;
      if (!zone_name) return secRes.status(400).json({ error: 'zone_name required' });

      const { data, error } = await db
        .from('delivery_zones')
        .insert({
          tenant_id: tenantId,
          zone_name,
          areas: areas || [],
          delivery_fee: delivery_fee || 0,
          is_free: is_free || delivery_fee === 0,
          sort_order: sort_order || 0,
        })
        .select()
        .single();

      if (error) return secRes.status(500).json({ error: error.message });
      return secRes.status(201).json({ zone: data });
    }

    if (secReq.method === 'PUT') {
      const { id, zone_name, areas, delivery_fee, is_free, is_active, sort_order } = secReq.body;
      if (!id) return secRes.status(400).json({ error: 'id required' });

      const { data, error } = await db
        .from('delivery_zones')
        .update({
          zone_name,
          areas,
          delivery_fee,
          is_free: is_free || delivery_fee === 0,
          is_active,
          sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) return secRes.status(500).json({ error: error.message });
      return secRes.status(200).json({ zone: data });
    }

    if (secReq.method === 'DELETE') {
      const { id } = secReq.body;
      if (!id) return secRes.status(400).json({ error: 'id required' });

      const { error } = await db
        .from('delivery_zones')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) return secRes.status(500).json({ error: error.message });
      return secRes.status(200).json({ success: true });
    }

    secRes.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return secRes.status(405).json({ error: 'Method not allowed' });
  })(req, res);
}
