import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tenantSlug, limit = 50 } = req.query;

    if (!tenantSlug) {
      return res.status(400).json({ error: 'Tenant slug required' });
    }

    // Get tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', tenantSlug)
      .single();

    if (!tenant) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Get products - simple query without RLS
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, retail_price, stock_quantity, category, image_url, sku, description')
      .eq('tenant_id', tenant.id)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string));

    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    return res.status(200).json({
      products: products || [],
      total: products?.length || 0
    });
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
