import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Products List API - Fetches all products from Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true })
      .limit(100);

    if (error) throw error;

    res.status(200).json({ products: data || [] });
  } catch (error: any) {
    console.error('Product list error:', error);
    res.status(500).json({ error: 'Failed to fetch products', products: [] });
  }
}
