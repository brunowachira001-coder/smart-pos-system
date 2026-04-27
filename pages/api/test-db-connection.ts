import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        url: supabaseUrl?.substring(0, 30) + '...'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection by counting products
    const { data: products, error: productsError, count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: false });

    const { data: customers, error: customersError, count: customersCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: false });

    const { data: returns, error: returnsError, count: returnsCount } = await supabase
      .from('returns')
      .select('*', { count: 'exact', head: false });

    const { data: expenses, error: expensesError, count: expensesCount } = await supabase
      .from('expenses')
      .select('*', { count: 'exact', head: false });

    const { data: debts, error: debtsError, count: debtsCount } = await supabase
      .from('debts')
      .select('*', { count: 'exact', head: false });

    const { data: shopSettings, error: shopError, count: shopCount } = await supabase
      .from('shop_settings')
      .select('*', { count: 'exact', head: false });

    return res.status(200).json({
      success: true,
      connection: 'OK',
      database: supabaseUrl,
      counts: {
        products: productsCount || 0,
        customers: customersCount || 0,
        returns: returnsCount || 0,
        expenses: expensesCount || 0,
        debts: debtsCount || 0,
        shop_settings: shopCount || 0
      },
      errors: {
        products: productsError?.message,
        customers: customersError?.message,
        returns: returnsError?.message,
        expenses: expensesError?.message,
        debts: debtsError?.message,
        shop_settings: shopError?.message
      },
      sampleProducts: products?.slice(0, 3).map(p => ({ sku: p.sku, name: p.name }))
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Connection failed',
      message: error.message,
      stack: error.stack
    });
  }
}
