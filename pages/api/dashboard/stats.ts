import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase-client';
import { getTodayStartInKenyaTime, getTodayEndInKenyaTime } from '../../../lib/timezone';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set aggressive no-cache headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get today's date range in UTC (Kenya is UTC+3)
    // Calculate Kenya time start/end and convert to UTC for database query
    const now = new Date();
    const kenyaOffset = 3 * 60; // Kenya is UTC+3 (180 minutes)
    const localOffset = now.getTimezoneOffset(); // Local offset in minutes (negative for ahead of UTC)
    
    // Get today's start in Kenya time (00:00:00 EAT)
    const kenyaNow = new Date(now.getTime() + (kenyaOffset + localOffset) * 60000);
    const kenyaTodayStart = new Date(kenyaNow.getFullYear(), kenyaNow.getMonth(), kenyaNow.getDate(), 0, 0, 0, 0);
    const kenyaTodayEnd = new Date(kenyaTodayStart.getTime() + 24 * 60 * 60 * 1000);
    
    // Convert Kenya time to UTC for database query
    const todayStartUTC = new Date(kenyaTodayStart.getTime() - kenyaOffset * 60000);
    const todayEndUTC = new Date(kenyaTodayEnd.getTime() - kenyaOffset * 60000);

    console.log('Dashboard Stats - Date Range:', {
      kenyaTodayStart: kenyaTodayStart.toISOString(),
      kenyaTodayEnd: kenyaTodayEnd.toISOString(),
      todayStartUTC: todayStartUTC.toISOString(),
      todayEndUTC: todayEndUTC.toISOString()
    });

    // Fetch products count and low stock
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, stock_quantity, minimum_stock_level');

    if (productsError) throw productsError;

    const totalProducts = products?.length || 0;
    const lowStockProducts = products?.filter(p => 
      p.stock_quantity <= p.minimum_stock_level
    ).length || 0;

    // Fetch customers count
    const { count: customersCount, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (customersError) throw customersError;

    // Fetch today's transactions using UTC timestamps
    const { data: todayTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        *,
        customers (
          name,
          phone
        )
      `)
      .gte('created_at', todayStartUTC.toISOString())
      .lt('created_at', todayEndUTC.toISOString());

    if (transactionsError) {
      console.error('Transactions error:', transactionsError);
      throw transactionsError;
    }

    console.log('Dashboard Stats - Transactions found:', todayTransactions?.length || 0);

    // Calculate today's sales stats
    const todaySales = todayTransactions?.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0) || 0;
    const todayProfit = 0; // We don't have cost data in transactions table
    const todayTax = 0; // We don't have tax data in transactions table
    const transactionCount = todayTransactions?.length || 0;
    const avgTransaction = transactionCount > 0 ? todaySales / transactionCount : 0;

    console.log('Dashboard Stats - Calculated:', {
      todaySales,
      transactionCount,
      avgTransaction,
      transactions: todayTransactions?.map(t => ({
        id: t.id,
        amount: t.total_amount,
        created: t.created_at
      }))
    });

    // Fetch recent transactions (last 5)
    const { data: recentTransactions, error: recentError } = await supabase
      .from('transactions')
      .select(`
        *,
        customers (
          name,
          phone
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Recent transactions error:', recentError);
      throw recentError;
    }

    // Format response
    res.status(200).json({
      success: true,
      data: {
        sales: {
          totalSales: todaySales,
          totalProfit: todayProfit,
          totalTax: todayTax,
          transactionCount,
          averageTransaction: avgTransaction
        },
        inventory: {
          totalProducts,
          lowStockCount: lowStockProducts,
          inStockCount: totalProducts - lowStockProducts
        },
        customers: {
          totalCustomers: customersCount || 0
        },
        recentTransactions: recentTransactions?.map(t => ({
          id: t.id,
          transactionNumber: t.transaction_number || `TXN-${t.id}`,
          customer: t.customers?.name || 'Walk-in Customer',
          itemCount: 0, // We'll need to count items separately
          total: parseFloat(t.total_amount) || 0,
          createdAt: t.created_at
        })) || []
      }
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch dashboard stats',
      data: {
        sales: {
          totalSales: 0,
          totalProfit: 0,
          totalTax: 0,
          transactionCount: 0,
          averageTransaction: 0
        },
        inventory: {
          totalProducts: 0,
          lowStockCount: 0,
          inStockCount: 0
        },
        customers: {
          totalCustomers: 0
        },
        recentTransactions: []
      }
    });
  }
}
