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

    // Simple query without join first
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' });

    // Search filter
    if (search) {
      query = query.ilike('transaction_number', `%${search}%`);
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      query = query.eq('payment_method', paymentMethod);
    }

    // Status filter
    if (status && status !== 'all') {
      query = query.eq('payment_status', status);
    }

    // Date range filter
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Sorting
    query = query.order(sortBy as string, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: transactions, error, count } = await query;

    if (error) {
      console.error('Transactions query error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Get customer names and items for each transaction
    let transactionsWithDetails = await Promise.all(
      (transactions || []).map(async (transaction) => {
        // Use customer_name from transaction, or look up if customer_id exists
        let customerName = transaction.customer_name || 'Walk-in Customer';
        let customerPhone = transaction.customer_phone || '';
        
        // If customer_id exists but no name stored, look it up
        if (transaction.customer_id && !transaction.customer_name) {
          const { data: customer } = await supabase
            .from('customers')
            .select('name, phone')
            .eq('id', transaction.customer_id)
            .single();
          
          if (customer) {
            customerName = customer.name;
            customerPhone = customer.phone || '';
          }
        }

        // Get transaction items
        const { data: items } = await supabase
          .from('transaction_items')
          .select('*')
          .eq('transaction_id', transaction.id);

        return {
          id: transaction.id,
          transaction_number: transaction.transaction_number,
          customer_name: customerName,
          customer_phone: customerPhone,
          total: transaction.total_amount,
          payment_method: transaction.payment_method,
          status: transaction.payment_status,
          created_at: transaction.created_at,
          items_count: items?.length || 0,
          items: items || []
        };
      })
    );

    return res.status(200).json({
      transactions: transactionsWithDetails,
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
