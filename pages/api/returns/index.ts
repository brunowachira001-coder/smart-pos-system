import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { status, search, startDate, endDate, page = '1', limit = '20' } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('returns')
        .select('*', { count: 'exact' });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`return_id.ilike.%${search}%,transaction_id.ilike.%${search}%,customer_name.ilike.%${search}%,product_name.ilike.%${search}%`);
      }

      if (startDate) {
        query = query.gte('return_date', startDate);
      }

      if (endDate) {
        query = query.lte('return_date', endDate);
      }

      const { data: returns, error, count } = await query
        .order('return_date', { ascending: false })
        .range(offset, offset + limitNum - 1);

      if (error) throw error;

      return res.status(200).json({
        returns: returns || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        transaction_id,
        customer_id,
        customer_name,
        product_id,
        product_name,
        quantity,
        amount,
        reason,
        notes,
      } = req.body;

      // Generate return ID
      const returnId = `${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 12)}`;

      const { data: returnRecord, error } = await supabase
        .from('returns')
        .insert([
          {
            return_id: returnId,
            transaction_id,
            customer_id,
            customer_name,
            product_id,
            product_name,
            quantity,
            amount,
            reason,
            status: 'Pending',
            notes,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(returnRecord);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
