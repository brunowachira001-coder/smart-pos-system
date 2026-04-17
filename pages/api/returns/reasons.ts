import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: reasons, error } = await supabase
      .from('return_reasons')
      .select('*')
      .eq('is_active', true)
      .order('reason');

    if (error) throw error;

    return res.status(200).json(reasons || []);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
