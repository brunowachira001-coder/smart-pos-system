import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = [];

    // Check existing tables
    const { data: cartCheck } = await supabase.from('cart_items').select('id').limit(1);
    const { data: txCheck } = await supabase.from('transactions').select('id').limit(1);
    const { data: itemsCheck } = await supabase.from('transaction_items').select('id').limit(1);

    results.push({
      table: 'cart_items',
      exists: cartCheck !== null,
      status: cartCheck !== null ? 'already exists' : 'missing'
    });

    results.push({
      table: 'transactions',
      exists: txCheck !== null,
      status: txCheck !== null ? 'already exists' : 'missing'
    });

    results.push({
      table: 'transaction_items',
      exists: itemsCheck !== null,
      status: itemsCheck !== null ? 'already exists' : 'missing'
    });

    // Try to create transactions table by inserting a test record (will fail but might trigger table creation)
    if (!txCheck) {
      try {
        await supabase.from('transactions').insert({
          transaction_number: 'TEST-SETUP',
          total_amount: 0,
          payment_method: 'test',
          payment_status: 'test'
        });
      } catch (e) {
        // Expected to fail
      }
    }

    return res.status(200).json({
      message: 'Table check complete',
      results,
      instructions: txCheck === null || itemsCheck === null 
        ? 'Tables need to be created manually. SQL file: lib/create-transactions-table.sql'
        : 'All tables exist! POS is ready.'
    });

  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message,
      hint: 'Tables may need to be created via Supabase SQL Editor'
    });
  }
}
