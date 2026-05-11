import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;

  try {
    // Fetch all active tenants (shops)
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, subdomain, updated_at')
      .eq('is_active', true);

    // Fetch all products for all active tenants
    const { data: products } = await supabase
      .from('products')
      .select('id, tenant_id, updated_at')
      .gt('stock_quantity', 0);

    // Build a map of tenant_id -> subdomain
    const tenantMap: Record<string, string> = {};
    (tenants || []).forEach(t => { tenantMap[t.id] = t.subdomain; });

    const shopUrls = (tenants || []).map(t => `
  <url>
    <loc>${baseUrl}/shop/${t.subdomain}</loc>
    <lastmod>${new Date(t.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('');

    const productUrls = (products || [])
      .filter(p => tenantMap[p.tenant_id])
      .map(p => `
  <url>
    <loc>${baseUrl}/shop/${tenantMap[p.tenant_id]}/product/${p.id}</loc>
    <lastmod>${new Date(p.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${shopUrls}
${productUrls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).end();
  }
}
