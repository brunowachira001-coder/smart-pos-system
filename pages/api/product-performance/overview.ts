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
    const { startDate, endDate, search = '' } = req.query;

    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      return res.status(500).json({ error: productsError.message });
    }

    // Get all transactions in date range
    let transactionsQuery = supabase
      .from('sales_transactions')
      .select('id, created_at, status');

    if (startDate) {
      transactionsQuery = transactionsQuery.gte('created_at', startDate);
    }
    if (endDate) {
      transactionsQuery = transactionsQuery.lte('created_at', endDate);
    }

    const { data: transactions, error: transactionsError } = await transactionsQuery;

    if (transactionsError) {
      console.error('Transactions query error:', transactionsError);
      return res.status(500).json({ error: transactionsError.message });
    }

    const transactionIds = transactions?.map(t => t.id) || [];

    // Get all transaction items for these transactions
    let salesItems: any[] = [];
    if (transactionIds.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from('sales_transaction_items')
        .select('*')
        .in('transaction_id', transactionIds);

      if (itemsError) {
        console.error('Sales items query error:', itemsError);
      } else {
        salesItems = items || [];
      }
    }

    // Get returns data in date range
    let returnsQuery = supabase
      .from('returns')
      .select('*')
      .in('status', ['Approved', 'approved', 'Completed', 'completed']);

    if (startDate) {
      returnsQuery = returnsQuery.gte('created_at', startDate);
    }
    if (endDate) {
      returnsQuery = returnsQuery.lte('created_at', endDate);
    }

    const { data: returns } = await returnsQuery;

    // Calculate performance metrics for each product
    const performanceData = products?.map(product => {
      // Calculate sales metrics from transaction items
      const productSales = salesItems.filter(item => item.product_id === product.id);
      const unitsSold = productSales.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const netRevenue = productSales.reduce((sum, item) => 
        sum + (parseFloat(item.unit_price || 0) * (item.quantity || 0)), 0
      );

      // Calculate cost
      const costPrice = parseFloat(product.cost_price) || 0;
      const netCost = unitsSold * costPrice;

      // Calculate profit
      const netProfit = netRevenue - netCost;
      const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

      // Calculate return rate
      const productReturns = returns?.filter(r => r.product_id === product.id) || [];
      const returnedUnits = productReturns.reduce((sum, r) => sum + (r.quantity || 0), 0);
      const returnRate = unitsSold > 0 ? (returnedUnits / unitsSold) * 100 : 0;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        unitsSold,
        netRevenue: netRevenue.toFixed(2),
        netCost: netCost.toFixed(2),
        netProfit: netProfit.toFixed(2),
        profitMargin: profitMargin.toFixed(2),
        returnRate: returnRate.toFixed(2)
      };
    }) || [];

    // Filter by search if provided
    let filteredData = performanceData;
    if (search) {
      const searchLower = search.toString().toLowerCase();
      filteredData = performanceData.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.sku.toLowerCase().includes(searchLower)
      );
    }

    // Sort by units sold (descending) - most performing to least performing
    filteredData.sort((a, b) => b.unitsSold - a.unitsSold);

    return res.status(200).json({
      products: filteredData
    });

  } catch (error: any) {
    console.error('Error fetching product performance:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch product performance' });
  }
}
