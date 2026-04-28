import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .limit(5);

    // Test expenses
    const { data: expenses, error: expError } = await supabase
      .from('expenses')
      .select('*')
      .limit(5);

    // Test transaction_items
    const { data: items, error: itemsError } = await supabase
      .from('transaction_items')
      .select('*')
      .limit(5);

    return res.status(200).json({
      success: true,
      transactions: {
        count: transactions?.length || 0,
        data: transactions,
        error: txError?.message
      },
      expenses: {
        count: expenses?.length || 0,
        data: expenses,
        error: expError?.message
      },
      transaction_items: {
        count: items?.length || 0,
        data: items,
        error: itemsError?.message
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
