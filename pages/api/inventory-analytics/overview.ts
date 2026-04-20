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
    const { startDate, endDate, priceType = 'retail' } = req.query;

    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      return res.status(500).json({ error: productsError.message });
    }

    // Calculate inventory value at cost (always the same)
    const inventoryValueCost = products?.reduce((sum, p) => {
      const costPrice = parseFloat(p.cost_price) || 0;
      const stockQty = p.stock_quantity || 0;
      return sum + (costPrice * stockQty);
    }, 0) || 0;

    // Calculate inventory value at selling price (retail or wholesale)
    let inventoryValueRetail = 0;
    let inventoryValueWholesale = 0;
    let potentialProfitRetail = 0;
    let potentialProfitWholesale = 0;

    products?.forEach(p => {
      const costPrice = parseFloat(p.cost_price) || 0;
      const retailPrice = parseFloat(p.retail_price) || 0;
      const wholesalePrice = parseFloat(p.wholesale_price) || 0;
      const stockQty = p.stock_quantity || 0;

      inventoryValueRetail += retailPrice * stockQty;
      inventoryValueWholesale += wholesalePrice * stockQty;
      potentialProfitRetail += (retailPrice - costPrice) * stockQty;
      potentialProfitWholesale += (wholesalePrice - costPrice) * stockQty;
    });

    // Use selected price type for display
    const inventoryValueSelling = priceType === 'retail' ? inventoryValueRetail : inventoryValueWholesale;
    const potentialProfit = priceType === 'retail' ? potentialProfitRetail : potentialProfitWholesale;

    // Low stock items (stock at or below minimum_stock_level)
    const lowStockItems = products?.filter(p => {
      const stockQty = p.stock_quantity || 0;
      const minStock = p.minimum_stock_level || 10;
      return stockQty <= minStock;
    }) || [];

    const lowStockAlerts = lowStockItems.length;

    // Get returns data
    let returnsQuery = supabase
      .from('returns')
      .select('*');

    if (startDate) {
      returnsQuery = returnsQuery.gte('created_at', startDate);
    }
    if (endDate) {
      returnsQuery = returnsQuery.lte('created_at', endDate);
    }

    const { data: allReturns } = await returnsQuery;

    // Total returns (approved/completed)
    const totalReturns = allReturns?.filter(r => 
      r.status === 'Approved' || r.status === 'approved' || r.status === 'Completed' || r.status === 'completed'
    ).length || 0;

    // Pending returns
    const pendingReturns = allReturns?.filter(r => 
      r.status === 'Pending' || r.status === 'pending'
    ).length || 0;

    // Value of returns (approved/completed only)
    const valueOfReturns = allReturns?.filter(r => 
      r.status === 'Approved' || r.status === 'approved' || r.status === 'Completed' || r.status === 'completed'
    ).reduce((sum, r) => sum + (parseFloat(r.refund_amount) || 0), 0) || 0;

    // Archived items (products with is_archived flag or 0 stock)
    const archivedItems = products?.filter(p => 
      p.is_archived === true || (p.stock_quantity || 0) === 0
    ).length || 0;

    return res.status(200).json({
      overview: {
        inventoryValueCost: inventoryValueCost.toFixed(2),
        inventoryValueSelling: inventoryValueSelling.toFixed(2),
        inventoryValueRetail: inventoryValueRetail.toFixed(2),
        inventoryValueWholesale: inventoryValueWholesale.toFixed(2),
        potentialProfit: potentialProfit.toFixed(2),
        potentialProfitRetail: potentialProfitRetail.toFixed(2),
        potentialProfitWholesale: potentialProfitWholesale.toFixed(2),
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
        quantity: p.stock_quantity || 0,
        minimumStock: p.minimum_stock_level || 10
      }))
    });

  } catch (error: any) {
    console.error('Error fetching inventory analytics:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch inventory analytics' });
  }
}
