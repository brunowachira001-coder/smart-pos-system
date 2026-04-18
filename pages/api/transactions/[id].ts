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

    // Try to find by transaction_number first
    let { data: transaction, error } = await supabase
      .from('sales_transactions')
      .select('*')
      .eq('transaction_number', id)
      .single();

    // If not found by transaction_number, try by id
    if (error || !transaction) {
      const result = await supabase
        .from('sales_transactions')
        .select('*')
        .eq('id', id)
        .single();
      
      transaction = result.data;
      error = result.error;
    }

    if (error || !transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Get transaction items
    const { data: items, error: itemsError } = await supabase
      .from('sales_transaction_items')
      .select('*')
      .eq('transaction_id', transaction.id);

    if (itemsError) {
      return res.status(500).json({ error: itemsError.message });
    }

    return res.status(200).json({
      transaction,
      items: items || []
    });
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    return res.status(500).json({ error: error.message });
  }
}
