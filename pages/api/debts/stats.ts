import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all debts
    const { data: debts, error: debtsError } = await supabase
      .from('debts')
      .select('*');

    if (debtsError) throw debtsError;

    // Get customer credit info
    const { data: credits, error: creditsError } = await supabase
      .from('customer_credit')
      .select('*');

    if (creditsError) throw creditsError;

    // Get recent payments
    const { data: payments, error: paymentsError } = await supabase
      .from('debt_payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (paymentsError) throw paymentsError;

    // Calculate stats
    const totalOutstanding = debts?.reduce((sum, debt) => sum + parseFloat(debt.amount_remaining || 0), 0) || 0;
    const todayDebts = debts?.filter(d => {
      const today = new Date().toDateString();
      const debtDate = new Date(d.created_at).toDateString();
      return today === debtDate;
    }) || [];
    const todayDebtAmount = todayDebts.reduce((sum, debt) => sum + parseFloat(debt.amount_remaining || 0), 0);
    
    const totalCreditLimit = credits?.reduce((sum, c) => sum + parseFloat(c.credit_limit || 0), 0) || 0;
    const activeDebts = debts?.filter(d => d.status !== 'Paid').length || 0;
    const recentPaymentsCount = payments?.length || 0;

    return res.status(200).json({
      totalOutstanding,
      todayDebt: todayDebtAmount,
      totalCreditLimit,
      activeDebts,
      recentPayments: recentPaymentsCount,
      debts: debts || [],
      payments: payments || [],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
