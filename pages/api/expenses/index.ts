import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { getTodayStartInKenyaTime, getTodayEndInKenyaTime } from '../../../lib/timezone';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { 
        category, 
        status, 
        startDate, 
        endDate, 
        search,
        page = '1',
        limit = '20'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('expenses')
        .select('*', { count: 'exact' });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (startDate) {
        query = query.gte('expense_date', startDate);
      }

      if (endDate) {
        query = query.lte('expense_date', endDate);
      }

      if (search) {
        query = query.or(`expense_id.ilike.%${search}%,description.ilike.%${search}%,vendor_name.ilike.%${search}%`);
      }

      query = query
        .order('expense_date', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data: expenses, error, count } = await query;

      if (error) throw error;

      return res.status(200).json({
        expenses: expenses || [],
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
        category,
        subcategory,
        amount,
        description,
        payment_method,
        vendor_name,
        receipt_number,
        expense_date,
        notes,
        created_by,
      } = req.body;

      // Generate expense ID
      const expenseId = `EXP-${Math.floor(Math.random() * 999999 + 1).toString().padStart(6, '0')}`;

      const { data: expense, error } = await supabase
        .from('expenses')
        .insert([
          {
            expense_id: expenseId,
            category,
            subcategory,
            amount,
            description,
            payment_method,
            vendor_name,
            receipt_number,
            expense_date: expense_date || new Date().toISOString().split('T')[0],
            notes,
            created_by: created_by || 'Admin',
            status: 'Pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(expense);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
