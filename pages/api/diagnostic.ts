import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      status: 'checking...',
      checks: {}
    };

    // Check shop settings
    const { data: shopSettings, error: shopError } = await supabase
      .from('shop_settings')
      .select('*')
      .limit(1)
      .single();

    results.checks.shopSettings = {
      status: shopError ? 'error' : 'success',
      hasData: !!shopSettings,
      businessName: shopSettings?.business_name || null,
      error: shopError?.message || null
    };

    // Check expenses
    const { data: expenses, error: expensesError, count: expensesCount } = await supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .limit(5);

    results.checks.expenses = {
      status: expensesError ? 'error' : 'success',
      count: expensesCount || 0,
      sampleDates: expenses?.map(e => e.expense_date) || [],
      error: expensesError?.message || null
    };

    // Check products
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    results.checks.products = {
      status: productsError ? 'error' : 'success',
      count: productsCount || 0,
      error: productsError?.message || null
    };

    // Check customers
    const { count: customersCount, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    results.checks.customers = {
      status: customersError ? 'error' : 'success',
      count: customersCount || 0,
      error: customersError?.message || null
    };

    // Overall status
    const allSuccess = Object.values(results.checks).every((check: any) => check.status === 'success');
    results.status = allSuccess ? 'all_systems_operational' : 'some_issues_detected';

    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
}
