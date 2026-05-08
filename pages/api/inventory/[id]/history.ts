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
    const { id } = req.query;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Product ID required' });
    }

    // Set tenant context
    await supabase.rpc('set_config', {
      setting: 'app.current_tenant_id',
      value: tenantId
    });

    // Fetch inventory movements for this product
    const { data: movements, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('product_id', id)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching inventory history:', error);
      return res.status(500).json({ error: 'Failed to fetch inventory history' });
    }

    return res.status(200).json({ movements: movements || [] });
  } catch (error) {
    console.error('Error in inventory history API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
