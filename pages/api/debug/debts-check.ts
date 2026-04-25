import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check 1: Count all debts
    const { data: allDebts, error: debtsError } = await supabase
      .from('debts')
      .select('*');

    if (debtsError) throw debtsError;

    // Check 2: Count all customers
    const { data: allCustomers, error: customersError } = await supabase
      .from('customers')
      .select('*');

    if (customersError) throw customersError;

    // Check 3: Get debts with customer names
    const { data: debtsWithCustomers, error: joinError } = await supabase
      .from('debts')
      .select('*, customers(name)');

    if (joinError) throw joinError;

    // Check 4: Get transactions
    const { data: allTransactions, error: transError } = await supabase
      .from('transactions')
      .select('*');

    if (transError) throw transError;

    return res.status(200).json({
      debts_count: allDebts?.length || 0,
      debts_data: allDebts,
      customers_count: allCustomers?.length || 0,
      customers_data: allCustomers,
      debts_with_customers: debtsWithCustomers,
      transactions_count: allTransactions?.length || 0,
      transactions_data: allTransactions,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
