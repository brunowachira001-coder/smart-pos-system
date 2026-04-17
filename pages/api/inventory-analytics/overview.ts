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

    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      return res.status(500).json({ error: productsError.message });
    }

    // Calculate inventory metrics
    const totalProducts = products?.length || 0;
    const inventoryValueCost = products?.reduce((sum, p) => sum + (parseFloat(p.cost_price || 0) * parseInt(p.stock_quantity || 0)), 0) || 0;
    const inventoryValueSelling = products?.reduce((sum, p) => sum + (parseFloat(p.retail_price || 0) * parseInt(p.stock_quantity || 0)), 0) || 0;
    const potentialProfit = inventoryValueSelling - inventoryValueCost;

    // Low stock items (below minimum stock level)
    const lowStockItems = products?.filter(p => {
      const stock = parseInt(p.stock_quantity || 0);
      const minStock = parseInt(p.minimum_stock_level || 0);
      return stock > 0 && stock <= minStock;
    }) || [];

    // Items below minimum retail stock
    const lowStockAlerts = lowStockItems.filter(p => parseInt(p.stock_quantity || 0) < 5).length;

    // Get returns data
    let returnsQuery = supabase
      .from('returns')
      .select('*')
      .eq('status', 'approved');

    if (startDate) {
      returnsQuery = returnsQuery.gte('created_at', startDate);
    }
    if (endDate) {
      returnsQuery = returnsQuery.lte('created_at', endDate);
    }

    const { data: returns } = await returnsQuery;

    const totalReturns = returns?.length || 0;
    const pendingReturns = returns?.filter(r => r.status === 'pending').length || 0;
    const valueOfReturns = returns?.reduce((sum, r) => sum + parseFloat(r.refund_amount || 0), 0) || 0;

    // Archived items (products with 0 stock)
    const archivedItems = products?.filter(p => parseInt(p.stock_quantity || 0) === 0).length || 0;

    return res.status(200).json({
      overview: {
        inventoryValueCost: inventoryValueCost.toFixed(2),
        inventoryValueSelling: inventoryValueSelling.toFixed(2),
        potentialProfit: potentialProfit.toFixed(2),
        lowStockAlerts,
        totalReturns,
        pendingReturns,
        valueOfReturns: valueOfReturns.toFixed(2),
        archivedItems
      },
      lowStockItems: lowStockItems.slice(0, 10).map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantity: p.stock_quantity,
        minimumStock: p.minimum_stock_level || 0
      }))
    });

  } catch (error: any) {
    console.error('Error fetching inventory analytics:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch inventory analytics' });
  }
}
