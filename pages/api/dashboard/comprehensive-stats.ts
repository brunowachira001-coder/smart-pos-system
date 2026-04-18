import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch all products for inventory calculations
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) throw productsError;

    // Calculate inventory values
    const inventoryValueCost = products?.reduce((sum, p) => {
      const cost = parseFloat(p.cost_price) || 0;
      const qty = p.stock_quantity || 0;
      return sum + (cost * qty);
    }, 0) || 0;

    const inventoryValueSelling = products?.reduce((sum, p) => {
      const price = parseFloat(p.retail_price) || 0;
      const qty = p.stock_quantity || 0;
      return sum + (price * qty);
    }, 0) || 0;

    const totalUnits = products?.reduce((sum, p) => sum + (p.stock_quantity || 0), 0) || 0;

    // Potential profit (if all inventory sold at retail)
    const potentialProfit = inventoryValueSelling - inventoryValueCost;

    // Fetch all sales transactions for all-time profit
    const { data: allTransactions, error: allTxnError } = await supabase
      .from('sales_transactions')
      .select('*');

    if (allTxnError) throw allTxnError;

    // Calculate all-time verified profit
    const allTimeProfit = allTransactions?.reduce((sum, t) => {
      const total = parseFloat(t.total) || 0;
      const subtotal = parseFloat(t.subtotal) || 0;
      return sum + (total - subtotal);
    }, 0) || 0;

    // Calculate gross revenue (all-time)
    const grossRevenue = allTransactions?.reduce((sum, t) => {
      return sum + (parseFloat(t.total) || 0);
    }, 0) || 0;

    // Retail vs Wholesale breakdown
    const retailSales = allTransactions?.filter(t => t.payment_method !== 'wholesale').length || 0;
    const wholesaleSales = allTransactions?.filter(t => t.payment_method === 'wholesale').length || 0;
    
    const retailRevenue = allTransactions
      ?.filter(t => t.payment_method !== 'wholesale')
      .reduce((sum, t) => sum + (parseFloat(t.total) || 0), 0) || 0;
    
    const wholesaleRevenue = allTransactions
      ?.filter(t => t.payment_method === 'wholesale')
      .reduce((sum, t) => sum + (parseFloat(t.total) || 0), 0) || 0;

    // Fetch today's transactions
    const { data: todayTransactions, error: todayTxnError } = await supabase
      .from('sales_transactions')
      .select('*')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    if (todayTxnError) throw todayTxnError;

    // Calculate today's net revenue
    const todayNetRevenue = todayTransactions?.reduce((sum, t) => {
      return sum + (parseFloat(t.total) || 0);
    }, 0) || 0;

    // Fetch today's expenses (if expenses table exists)
    let todayExpenses = 0;
    try {
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());
      
      todayExpenses = expenses?.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0;
    } catch (e) {
      // Expenses table might not exist
      todayExpenses = 0;
    }

    // Count product categories
    const categories = new Set(products?.map(p => p.category).filter(Boolean));
    const productCategories = categories.size;

    // Count low stock items
    const lowStockCount = products?.filter(p => 
      p.stock_quantity <= (p.minimum_stock_level || 10)
    ).length || 0;

    // Fetch outstanding debt
    let outstandingDebt = 0;
    try {
      const { data: debts } = await supabase
        .from('debts')
        .select('amount')
        .eq('status', 'pending');
      
      outstandingDebt = debts?.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) || 0;
    } catch (e) {
      outstandingDebt = 0;
    }

    // Pricing audit
    const totalProducts = products?.length || 0;
    const validPricing = products?.filter(p => {
      const cost = parseFloat(p.cost_price) || 0;
      const retail = parseFloat(p.retail_price) || 0;
      return cost > 0 && retail > cost;
    }).length || 0;
    const pricingIssues = totalProducts - validPricing;

    res.status(200).json({
      success: true,
      data: {
        allTimeProfit,
        potentialProfit,
        grossRevenue,
        todayNetRevenue,
        todayExpenses,
        inventoryValueCost,
        inventoryValueSelling,
        totalUnits,
        retailRevenue,
        wholesaleRevenue,
        retailSales,
        wholesaleSales,
        productCategories,
        outstandingDebt,
        lowStockCount,
        pricingAudit: {
          total: totalProducts,
          valid: validPricing,
          issues: pricingIssues
        }
      }
    });
  } catch (error: any) {
    console.error('Comprehensive stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: {
        allTimeProfit: 0,
        potentialProfit: 0,
        grossRevenue: 0,
        todayNetRevenue: 0,
        todayExpenses: 0,
        inventoryValueCost: 0,
        inventoryValueSelling: 0,
        totalUnits: 0,
        retailRevenue: 0,
        wholesaleRevenue: 0,
        retailSales: 0,
        wholesaleSales: 0,
        productCategories: 0,
        outstandingDebt: 0,
        lowStockCount: 0,
        pricingAudit: {
          total: 0,
          valid: 0,
          issues: 0
        }
      }
    });
  }
}
