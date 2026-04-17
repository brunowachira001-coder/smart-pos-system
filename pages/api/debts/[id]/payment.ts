import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { amount, payment_method, reference_number, notes } = req.body;

    // Get current debt
    const { data: debt, error: debtError } = await supabase
      .from('debts')
      .select('*')
      .eq('id', id)
      .single();

    if (debtError) throw debtError;
    if (!debt) throw new Error('Debt not found');

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('debt_payments')
      .insert([
        {
          debt_id: id,
          customer_id: debt.customer_id,
          amount,
          payment_method,
          reference_number,
          notes,
        },
      ])
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update debt
    const newAmountPaid = parseFloat(debt.amount_paid) + parseFloat(amount);
    const newAmountRemaining = parseFloat(debt.total_amount) - newAmountPaid;

    const { data: updatedDebt, error: updateError } = await supabase
      .from('debts')
      .update({
        amount_paid: newAmountPaid,
        amount_remaining: newAmountRemaining,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update customer credit
    const { data: credit, error: creditError } = await supabase
      .from('customer_credit')
      .select('*')
      .eq('customer_id', debt.customer_id)
      .single();

    if (!creditError && credit) {
      const newCurrentDebt = parseFloat(credit.current_debt) - parseFloat(amount);
      const newAvailableCredit = parseFloat(credit.credit_limit) - newCurrentDebt;

      await supabase
        .from('customer_credit')
        .update({
          current_debt: newCurrentDebt,
          available_credit: newAvailableCredit,
          updated_at: new Date().toISOString(),
        })
        .eq('customer_id', debt.customer_id);
    }

    return res.status(200).json({ payment, debt: updatedDebt });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
