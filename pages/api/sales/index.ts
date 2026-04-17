import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { customer_name, amount, items, payment_method } = req.body;
    
    const order_id = `#ORD-${Date.now().toString().slice(-6)}`;
    
    const { data, error } = await supabase
      .from('sales')
      .insert([{
        order_id,
        customer_name,
        amount,
        items,
        payment_method,
        status: 'Completed'
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
