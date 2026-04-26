import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
      customerType = '',
      status = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' });

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Customer type filter
    if (customerType && customerType !== 'all') {
      query = query.eq('customer_type', customerType);
    }

    // Status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Sorting
    query = query.order(sortBy as string, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: customers, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      customers: customers || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });

  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch customers' });
  }
}
