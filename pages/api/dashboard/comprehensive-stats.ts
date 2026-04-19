import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Date range helper function
function getDateRange(range: string): { startDate: Date | null; endDate: Date | null } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return { startDate: today, endDate: now };
    
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { startDate: yesterday, endDate: today };
    
    case 'last7days':
      const last7 = new Date(today);
      last7.setDate(last7.getDate() - 7);
      return { startDate: last7, endDate: now };
    
    case 'last30days':
      const last30 = new Date(today);
      last30.setDate(last30.getDate() - 30);
      return { startDate: last30, endDate: now };
    
    case 'thisMonth':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: monthStart, endDate: now };
    
    case 'lastMonth':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: lastMonthStart, endDate: lastMonthEnd };
    
    case 'thisYear':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return { startDate: yearStart, endDate: now };
    
    case 'all':
    default:
      return { startDate: null, endDate: null };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const range = (req.query.range as string) || 'all';
    
    // Log current server time for debugging
    const serverTime = new Date();
    console.log('Server time:', serverTime.toISOString());
    console.log('Date range requested:', range);
    
    const { startDate, endDate } = getDateRange(range);
    
    console.log('Start date:', startDate?.toISOString());
    console.log('End date:', endDate?.toISOString());

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

    // Fetch all sales transactions for all-time profit (or filtered by date range)
    let allTransactionsQuery = supabase.from('sales_transactions').select('*');
    
    if (startDate && endDate) {
      allTransactionsQuery = allTransactionsQuery
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
    }

    const { data: allTransactions, error: allTxnError } = await allTransactionsQuery;

    if (allTxnError) throw allTxnError;

    // Calculate actual profit by fetching transaction items and comparing with cost prices
    let allTimeProfit = 0;
    
    if (allTransactions && allTransactions.length > 0) {
      const transactionIds = allTransactions.map(t => t.id);
      
      // Fetch all transaction items for these transactions
      const { data: transactionItems, error: itemsError } = await supabase
        .from('sales_transaction_items')
        .select('product_id, quantity, unit_price, transaction_id')
        .in('transaction_id', transactionIds);

      if (transactionItems && transactionItems.length > 0) {
        // Create a map of product IDs to cost prices for faster lookup
        const productCostMap = new Map();
        products?.forEach(p => {
          productCostMap.set(p.id, parseFloat(p.cost_price) || 0);
        });

        // Calculate profit for each item
        for (const item of transactionItems) {
          const costPrice = productCostMap.get(item.product_id) || 0;
          const sellingPrice = parseFloat(item.unit_price) || 0;
          const quantity = item.quantity || 0;
          const itemProfit = (sellingPrice - costPrice) * quantity;
          allTimeProfit += itemProfit;
        }
      }
    }

    // Calculate gross revenue
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

    // Fetch expenses for the selected date range
    let todayExpenses = 0;
    try {
      let expensesQuery = supabase.from('expenses').select('amount, created_at');
      
      if (startDate && endDate) {
        expensesQuery = expensesQuery
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
      } else {
        // Default to today if no range specified
        expensesQuery = expensesQuery
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString());
      }
      
      const { data: expenses } = await expensesQuery;
      
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

    // Get sales trend data (based on date range or last 30 days)
    let trendStartDate: Date;
    if (startDate) {
      trendStartDate = startDate;
    } else {
      trendStartDate = new Date();
      trendStartDate.setDate(trendStartDate.getDate() - 30);
    }

    const trendEndDate = endDate || new Date();

    const { data: trendTransactions, error: trendError } = await supabase
      .from('sales_transactions')
      .select('created_at, total, subtotal, tax')
      .gte('created_at', trendStartDate.toISOString())
      .lte('created_at', trendEndDate.toISOString())
      .order('created_at', { ascending: true });

    if (trendError) console.error('Trend error:', trendError);

    // Prepare chart data
    let chartData: Array<{ date: string; gross: number; net: number; expenses: number; profit: number }> = [];

    if (trendTransactions && trendTransactions.length > 0) {
      // Fetch transactions with IDs for chart
      const { data: trendTransactionsWithIds } = await supabase
        .from('sales_transactions')
        .select('id, created_at, total, subtotal')
        .gte('created_at', trendStartDate.toISOString())
        .lte('created_at', trendEndDate.toISOString())
        .order('created_at', { ascending: true });

      const trendTransactionIds = trendTransactionsWithIds?.map(t => t.id) || [];

      if (trendTransactionIds.length > 0) {
        // Fetch transaction items
        const { data: trendItems } = await supabase
          .from('sales_transaction_items')
          .select('transaction_id, product_id, quantity, unit_price')
          .in('transaction_id', trendTransactionIds);

        // Create a map of product IDs to cost prices
        const productCostMap = new Map();
        products?.forEach(p => {
          productCostMap.set(p.id, parseFloat(p.cost_price) || 0);
        });

        // Create a map of transaction_id to profit
        const profitByTransaction: { [key: string]: number } = {};
        
        if (trendItems) {
          for (const item of trendItems) {
            const costPrice = productCostMap.get(item.product_id) || 0;
            const sellingPrice = parseFloat(item.unit_price) || 0;
            const quantity = item.quantity || 0;
            const itemProfit = (sellingPrice - costPrice) * quantity;
            
            if (!profitByTransaction[item.transaction_id]) {
              profitByTransaction[item.transaction_id] = 0;
            }
            profitByTransaction[item.transaction_id] += itemProfit;
          }
        }

        // Fetch expenses for the trend period
        let trendExpenses: any[] = [];
        try {
          const { data: expensesData } = await supabase
            .from('expenses')
            .select('amount, created_at')
            .gte('created_at', trendStartDate.toISOString())
            .lte('created_at', trendEndDate.toISOString());
          
          trendExpenses = expensesData || [];
        } catch (e) {
          trendExpenses = [];
        }

        // Group transactions by date with actual profit
        const salesByDate: { [key: string]: { gross: number; net: number; expenses: number; profit: number } } = {};
        
        trendTransactionsWithIds?.forEach(t => {
          const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!salesByDate[date]) {
            salesByDate[date] = { gross: 0, net: 0, expenses: 0, profit: 0 };
          }
          const total = parseFloat(t.total) || 0;
          const subtotal = parseFloat(t.subtotal) || 0;
          const profit = profitByTransaction[t.id] || 0;
          
          salesByDate[date].gross += total;
          salesByDate[date].net += subtotal;
          salesByDate[date].profit += profit;
        });

        // Add expenses by date
        trendExpenses.forEach(e => {
          const date = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!salesByDate[date]) {
            salesByDate[date] = { gross: 0, net: 0, expenses: 0, profit: 0 };
          }
          salesByDate[date].expenses += parseFloat(e.amount) || 0;
        });

        // Convert to array and get last 11 data points
        chartData = Object.entries(salesByDate)
          .map(([date, values]) => ({ date, ...values }))
          .slice(-11);
        
        console.log('=== CHART DATA GENERATED ===');
        console.log('Sales by date:', salesByDate);
        console.log('Final chart data:', JSON.stringify(chartData, null, 2));
      }
    }

    // Send response
    res.status(200).json({
      success: true,
      serverTime: new Date().toISOString(),
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
        },
        chartData
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
        },
        chartData: []
      }
    });
  }
}
