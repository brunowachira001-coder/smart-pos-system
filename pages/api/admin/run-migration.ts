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

  const { secret } = req.body;
  
  // Simple security check
  if (secret !== 'create-pos-tables-2024') {
    return res.status(403).json({ error: 'Invalid secret' });
  }

  try {
    const results: any[] = [];
    
    // Step 1: Check existing tables
    results.push({ step: '1. Checking existing tables' });
    
    const { error: cartError } = await supabase.from('cart_items').select('id').limit(1);
    const { error: txError } = await supabase.from('transactions').select('id').limit(1);
    const { error: itemsError } = await supabase.from('transaction_items').select('id').limit(1);
    
    const initialStatus = {
      cart_items: cartError ? '❌ missing' : '✅ exists',
      transactions: txError ? '❌ missing' : '✅ exists',
      transaction_items: itemsError ? '❌ missing' : '✅ exists'
    };
    
    results.push(initialStatus);

    // If all tables exist, we're done
    if (!cartError && !txError && !itemsError) {
      return res.status(200).json({
        success: true,
        message: '✅ All tables already exist! POS is ready.',
        results,
        next_steps: 'Go to /pos and test a sale!'
      });
    }

    // Step 2: Explain the situation
    results.push({ 
      step: '2. Attempting to create tables',
      note: 'API cannot create tables directly in Supabase'
    });

    // The API cannot create tables - Supabase doesn't allow DDL via REST API
    results.push({
      step: '3. Result',
      status: '⚠️ Cannot create tables via API',
      reason: 'Supabase REST API does not support CREATE TABLE operations',
      solution: 'Manual SQL execution required'
    });

    return res.status(200).json({
      success: false,
      message: '⚠️ Tables cannot be created via API. Manual SQL execution required.',
      results,
      manual_steps: [
        '1. Someone with Supabase dashboard access needs to run the SQL',
        '2. SQL file location: lib/create-transactions-table.sql',
        '3. Run in Supabase SQL Editor',
        '4. Or contact the person who originally set up the database'
      ],
      sql_preview: `
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  user_id UUID,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- See lib/create-transactions-table.sql for complete SQL with indexes and policies
      `.trim()
    });

  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}
