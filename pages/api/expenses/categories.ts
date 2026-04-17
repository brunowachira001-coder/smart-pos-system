import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: categories, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return res.status(200).json(categories || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
