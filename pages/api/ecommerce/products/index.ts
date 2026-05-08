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
    const { tenantSlug, category, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;

    if (!tenantSlug) {
      return res.status(400).json({ error: 'Tenant slug required' });
    }

    // Get tenant by slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', tenantSlug)
      .single();

    if (tenantError || !tenant) {
      console.error('Tenant not found:', tenantSlug, tenantError);
      return res.status(404).json({ error: 'Shop not found', details: tenantError?.message });
    }

    // Build query
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenant.id)
      .gt('stock_quantity', 0); // Only show in-stock products

    // Try to filter by is_active if column exists
    // Note: Column might not exist in all databases
    // query = query.eq('is_active', true);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (minPrice) {
      query = query.gte('retail_price', parseFloat(minPrice as string));
    }

    if (maxPrice) {
      query = query.lte('retail_price', parseFloat(maxPrice as string));
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch products',
        details: error.message,
        tenantId: tenant.id
      });
    }

    console.log(`Found ${products?.length || 0} products for tenant ${tenantSlug}`);

    return res.status(200).json({
      products: products || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Products API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
