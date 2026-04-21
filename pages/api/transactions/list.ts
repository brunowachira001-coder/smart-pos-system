import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    let query = supabase
      .from('sales_transactions')
      .select('*', { count: 'exact' });

    // Search filter
    if (search) {
      query = query.or(`transaction_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      query = query.eq('payment_method', paymentMethod);
    }

    // Status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Date range filter - convert local dates to UTC for database query
    if (startDate) {
      // Parse the local date and convert to UTC
      const localStart = new Date(startDate as string);
      const utcStart = new Date(localStart.getTime() - (localStart.getTimezoneOffset() * 60000));
      query = query.gte('created_at', utcStart.toISOString());
      console.log('Start date filter:', {
        received: startDate,
        localStart: localStart.toISOString(),
        utcStart: utcStart.toISOString()
      });
    }
    if (endDate) {
      // Parse the local date and convert to UTC
      const localEnd = new Date(endDate as string);
      const utcEnd = new Date(localEnd.getTime() - (localEnd.getTimezoneOffset() * 60000));
      query = query.lte('created_at', utcEnd.toISOString());
      console.log('End date filter:', {
        received: endDate,
        localEnd: localEnd.toISOString(),
        utcEnd: utcEnd.toISOString()
      });
    }

    // Sorting
    query = query.order(sortBy as string, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: transactions, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get items count for each transaction and filter by price type if needed
    let transactionsWithItems = await Promise.all(
      (transactions || []).map(async (transaction) => {
        let itemsQuery = supabase
          .from('sales_transaction_items')
          .select('*')
          .eq('transaction_id', transaction.id);
        
        // Filter by price type if specified
        if (priceType && priceType !== 'all') {
          itemsQuery = itemsQuery.eq('price_type', priceType);
        }

        const { data: items } = await itemsQuery;

        return {
          ...transaction,
          items_count: items?.length || 0,
          items: items || []
        };
      })
    );

    // If filtering by price type, remove transactions with no matching items
    if (priceType && priceType !== 'all') {
      transactionsWithItems = transactionsWithItems.filter(t => t.items_count > 0);
    }

    return res.status(200).json({
      transactions: transactionsWithItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: transactionsWithItems.length, // Update count based on filtered results
        totalPages: Math.ceil(transactionsWithItems.length / limitNum)
      }
    });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
}
