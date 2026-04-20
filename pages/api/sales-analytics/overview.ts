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
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('sales_transactions')
      .select('*');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: transactions, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const totalTransactions = transactions?.length || 0;
    const totalRevenue = transactions?.reduce((sum, t) => sum + parseFloat(t.total || 0), 0) || 0;
    const totalDiscounts = transactions?.reduce((sum, t) => sum + parseFloat(t.discount || 0), 0) || 0;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Get transaction IDs to fetch items
    const transactionIds = transactions?.map(t => t.id) || [];
    
    let retailRevenue = 0;
    let wholesaleRevenue = 0;

    if (transactionIds.length > 0) {
      // Fetch all transaction items to determine retail vs wholesale
      const { data: items } = await supabase
        .from('sales_transaction_items')
        .select('transaction_id, unit_price, quantity, price_type')
        .in('transaction_id', transactionIds);

      // Calculate revenue by price type
      if (items) {
        for (const item of items) {
          const itemRevenue = parseFloat(item.unit_price || 0) * (item.quantity || 0);
          if (item.price_type === 'retail') {
            retailRevenue += itemRevenue;
          } else if (item.price_type === 'wholesale') {
            wholesaleRevenue += itemRevenue;
          }
        }
      }
    }

    const paymentMethods = transactions?.reduce((acc: any, t) => {
      const method = t.payment_method || 'cash';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const paymentMethodsPercentage = Object.entries(paymentMethods || {}).map(([method, count]: [string, any]) => ({
      method,
      count,
      percentage: ((count / totalTransactions) * 100).toFixed(1)
    }));

    return res.status(200).json({
      overview: {
        totalTransactions,
        averageTransactionValue: averageTransactionValue.toFixed(2),
        totalDiscounts: totalDiscounts.toFixed(2),
        grossSalesRevenue: totalRevenue.toFixed(2),
        retailRevenue: retailRevenue.toFixed(2),
        wholesaleRevenue: wholesaleRevenue.toFixed(2)
      },
      paymentMethods: paymentMethodsPercentage
    });

  } catch (error: any) {
    console.error('Error fetching sales analytics:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch sales analytics' });
  }
}
