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
    results.push({ step: 'Checking existing tables...' });
    
    const { error: cartError } = await supabase.from('cart_items').select('id').limit(1);
    const { error: txError } = await supabase.from('transactions').select('id').limit(1);
    const { error: itemsError } = await supabase.from('transaction_items').select('id').limit(1);
    
    results.push({
      cart_items: cartError ? 'missing' : 'exists',
      transactions: txError ? 'missing' : 'exists',
      transaction_items: itemsError ? 'missing' : 'exists'
    });

    // Step 2: Create transactions table using raw SQL via PostgREST
    if (txError) {
      results.push({ step: 'Creating transactions table...' });
      
      // Try to create by doing a dummy insert that will fail but might create table
      try {
        const { error: createError } = await supabase.rpc('exec_sql', {
          query: `
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
            
            ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
            
            DROP POLICY IF EXISTS "Allow all for anon" ON public.transactions;
            DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.transactions;
            
            CREATE POLICY "Allow all for anon" ON public.transactions FOR ALL TO anon USING (true);
            CREATE POLICY "Allow all for authenticated users" ON public.transactions FOR ALL TO authenticated USING (true);
            
            CREATE INDEX IF NOT EXISTS idx_transactions_customer ON public.transactions(customer_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at);
          `
        });
        
        if (createError) {
          results.push({ transactions_error: createError.message });
        } else {
          results.push({ transactions: 'created' });
        }
      } catch (e: any) {
        results.push({ transactions_error: e.message });
      }
    }

    // Step 3: Create transaction_items table
    if (itemsError) {
      results.push({ step: 'Creating transaction_items table...' });
      
      try {
        const { error: createError } = await supabase.rpc('exec_sql', {
          query: `
            CREATE TABLE IF NOT EXISTS public.transaction_items (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
              product_id UUID REFERENCES public.products(id),
              quantity INTEGER NOT NULL,
              unit_price DECIMAL(12, 2) NOT NULL,
              subtotal DECIMAL(12, 2) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
            
            DROP POLICY IF EXISTS "Allow all for anon" ON public.transaction_items;
            DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.transaction_items;
            
            CREATE POLICY "Allow all for anon" ON public.transaction_items FOR ALL TO anon USING (true);
            CREATE POLICY "Allow all for authenticated users" ON public.transaction_items FOR ALL TO authenticated USING (true);
            
            CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON public.transaction_items(transaction_id);
            CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON public.transaction_items(product_id);
          `
        });
        
        if (createError) {
          results.push({ transaction_items_error: createError.message });
        } else {
          results.push({ transaction_items: 'created' });
        }
      } catch (e: any) {
        results.push({ transaction_items_error: e.message });
      }
    }

    // Step 4: Verify tables
    results.push({ step: 'Verifying tables...' });
    
    const { error: cartCheck2 } = await supabase.from('cart_items').select('id').limit(1);
    const { error: txCheck2 } = await supabase.from('transactions').select('id').limit(1);
    const { error: itemsCheck2 } = await supabase.from('transaction_items').select('id').limit(1);
    
    const finalStatus = {
      cart_items: cartCheck2 ? 'failed' : 'ready',
      transactions: txCheck2 ? 'failed' : 'ready',
      transaction_items: itemsCheck2 ? 'failed' : 'ready'
    };
    
    results.push({ final_status: finalStatus });

    const allReady = !cartCheck2 && !txCheck2 && !itemsCheck2;

    return res.status(200).json({
      success: allReady,
      message: allReady 
        ? '✅ All tables created! POS is ready to use.' 
        : '⚠️ Some tables could not be created. Manual SQL execution required.',
      results,
      next_steps: allReady 
        ? 'Go to /pos and test a sale!'
        : 'Copy SQL from lib/create-transactions-table.sql and run manually'
    });

  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message,
      hint: 'RPC function may not be available. Manual SQL execution required.'
    });
  }
}
