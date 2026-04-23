import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { startDate, endDate } = req.query;

      let query = supabase
        .from('debts')
        .select('*');

      // Apply date filtering if provided
      if (startDate && endDate) {
        query = query
          .gte('created_at', startDate)
          .lte('created_at', endDate);
      }

      const { data: debts, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json(debts || []);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { customer_id, customer_name, sale_id, total_amount, due_date, notes } = req.body;

      const { data: debt, error } = await supabase
        .from('debts')
        .insert([
          {
            customer_id,
            customer_name,
            sale_id,
            total_amount,
            amount_paid: 0,
            amount_remaining: total_amount,
            status: 'Outstanding',
            due_date,
            notes,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update customer credit
      const { error: creditError } = await supabase.rpc('update_customer_debt', {
        p_customer_id: customer_id,
        p_amount: total_amount,
      });

      return res.status(201).json(debt);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
