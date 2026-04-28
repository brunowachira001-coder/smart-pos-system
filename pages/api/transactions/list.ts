import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { 
      page = '1', 
      limit = '20', 
      search = '', 
      priceType = '',
      paymentMethod = '',
      status = '',
      startDate = '',
      endDate = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Join with customers table to get customer name
    let query = supabase
      .from('transactions')
      .select(`
        *,
        customers (
          name,
          phone
        )
      `, { count: 'exact' });

    // Search filter - transactions table only has transaction_number
    if (search) {
      query = query.ilike('transaction_number', `%${search}%`);
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      query = query.eq('payment_method', paymentMethod);
    }

    // Status filter - use payment_status column
    if (status && status !== 'all') {
      query = query.eq('payment_status', status);
    }

    // Date range filter - dates come already formatted from frontend
    if (startDate) {
      query = query.gte('created_at', startDate);
      console.log('Start date filter (raw):', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
      console.log('End date filter (raw):', endDate);
    }

    // Sorting
    query = query.order(sortBy as string, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: transactions, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get items count for each transaction
    let transactionsWithItems = await Promise.all(
      (transactions || []).map(async (transaction) => {
        const { data: items } = await supabase
          .from('transaction_items')
          .select('*')
          .eq('transaction_id', transaction.id);

        // Map database fields to frontend expected fields
        return {
          id: transaction.id,
          transaction_number: transaction.transaction_number,
          customer_name: transaction.customers?.name || 'Walk-in Customer',
          customer_phone: transaction.customers?.phone || '',
          total: transaction.total_amount, // Map total_amount to total
          payment_method: transaction.payment_method,
          status: transaction.payment_status, // Map payment_status to status
          created_at: transaction.created_at,
          items_count: items?.length || 0,
          items: items || []
        };
      })
    );

    return res.status(200).json({
      transactions: transactionsWithItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
}
