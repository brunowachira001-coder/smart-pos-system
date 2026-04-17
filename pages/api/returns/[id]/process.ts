import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status, refund_method, refund_amount, processed_by, notes } = req.body;

    const { data: returnRecord, error } = await supabase
      .from('returns')
      .update({
        status,
        refund_method,
        refund_amount,
        processed_by,
        notes,
        processed_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(returnRecord);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
