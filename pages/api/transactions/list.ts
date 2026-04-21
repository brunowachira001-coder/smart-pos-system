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

    // Date range filter - handle timezone properly (EAT = UTC+3)
    if (startDate) {
      // The startDate comes as local date string (e.g., "2024-04-21T00:00:00")
      // We need to treat it as EAT and convert to UTC for database query
      const localDate = new Date(startDate as string);
      
      // Get the timezone offset in minutes (for EAT it's -180, meaning UTC+3)
      const timezoneOffset = localDate.getTimezoneOffset();
      
      // Convert to UTC by adding the offset
      const utcDate = new Date(localDate.getTime() + (timezoneOffset * 60000));
      
      query = query.gte('created_at', utcDate.toISOString());
      
      console.log('Start date filter:', {
        received: startDate,
        localDate: localDate.toISOString(),
        timezoneOffset,
        utcDate: utcDate.toISOString()
      });
    }
    if (endDate) {
      // The endDate comes as local date string (e.g., "2024-04-21T23:59:59.999")
      // We need to treat it as EAT and convert to UTC for database query
      const localDate = new Date(endDate as string);
      
      // Get the timezone offset in minutes
      const timezoneOffset = localDate.getTimezoneOffset();
      
      // Convert to UTC by adding the offset
      const utcDate = new Date(localDate.getTime() + (timezoneOffset * 60000));
      
      query = query.lte('created_at', utcDate.toISOString());
      
      console.log('End date filter:', {
        received: endDate,
        localDate: localDate.toISOString(),
        timezoneOffset,
        utcDate: utcDate.toISOString()
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
