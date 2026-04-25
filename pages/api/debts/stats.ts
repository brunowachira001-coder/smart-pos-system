import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { startDate, endDate } = req.query;

    // Get debts with optional date filtering
    let debtsQuery = supabase.from('debts').select('*');
    
    if (startDate && endDate) {
      debtsQuery = debtsQuery
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { data: debts, error: debtsError } = await debtsQuery;

    if (debtsError) throw debtsError;

    // Get customers for credit limit info
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*');

    if (customersError) throw customersError;

    // Calculate stats
    const totalOutstanding = debts?.reduce((sum, debt) => {
      const remaining = parseFloat(debt.amount_remaining || 0);
      return sum + (remaining > 0 ? remaining : 0); // Only count positive balances
    }, 0) || 0;
    
    const todayDebts = debts?.filter(d => {
      const today = new Date().toDateString();
      const debtDate = new Date(d.created_at).toDateString();
      return today === debtDate;
    }) || [];
    
    const todayDebtAmount = todayDebts.reduce((sum, debt) => {
      const remaining = parseFloat(debt.amount_remaining || 0);
      return sum + (remaining > 0 ? remaining : 0);
    }, 0);
    
    const totalCreditLimit = customers?.reduce((sum, c) => sum + parseFloat(c.credit_limit || 0), 0) || 0;
    const activeDebts = debts?.filter(d => d.status !== 'Paid' && parseFloat(d.amount_remaining || 0) > 0).length || 0;
    const paidDebts = debts?.filter(d => d.status === 'Paid' || parseFloat(d.amount_remaining || 0) <= 0).length || 0;

    return res.status(200).json({
      totalOutstanding,
      todayDebt: todayDebtAmount,
      totalCreditLimit,
      activeDebts,
      paidDebts,
      debts: debts || [],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
