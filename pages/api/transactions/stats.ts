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
    const { startDate, endDate, priceType } = req.query;

    let query = supabase
      .from('sales_transactions')
      .select('*', { count: 'exact' });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: transactions, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Calculate statistics
    const totalRevenue = transactions?.reduce((sum, t) => sum + parseFloat(t.total), 0) || 0;
    const totalTransactions = count || 0;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Get transactions by payment method
    const paymentMethods = transactions?.reduce((acc: any, t) => {
      const method = t.payment_method || 'unknown';
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count++;
      acc[method].total += parseFloat(t.total);
      return acc;
    }, {});

    // Get transactions by status
    const statusBreakdown = transactions?.reduce((acc: any, t) => {
      const status = t.status || 'unknown';
      if (!acc[status]) {
        acc[status] = { count: 0, total: 0 };
      }
      acc[status].count++;
      acc[status].total += parseFloat(t.total);
      return acc;
    }, {});

    return res.status(200).json({
      totalRevenue,
      totalTransactions,
      averageTransaction,
      paymentMethods,
      statusBreakdown
    });

  } catch (error: any) {
    console.error('Transaction Stats Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
