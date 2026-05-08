import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} not allowed` });
  }

  try {
    const { id, tenantSlug } = req.query;

    if (!id || !tenantSlug) {
      return res.status(400).json({ error: 'Product ID and tenant slug required' });
    }

    // Get tenant by slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', tenantSlug)
      .single();

    if (tenantError || !tenant) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Set tenant context
    await supabase.rpc('set_config', {
      setting: 'app.current_tenant_id',
      value: tenant.id
    });

    // Get product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenant.id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get product reviews
    const { data: reviews } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', id)
      .eq('tenant_id', tenant.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate average rating
    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return res.status(200).json({
      product: {
        ...product,
        avgRating: avgRating.toFixed(1),
        reviewCount: reviews?.length || 0
      },
      reviews: reviews || []
    });
  } catch (error: any) {
    console.error('Product detail API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
