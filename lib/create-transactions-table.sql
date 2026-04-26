-- ============================================
-- POS TABLES SETUP - Run this in Supabase SQL Editor
-- Creates: transactions, transaction_items, cart_items
-- ============================================

-- 1. Create cart_items table (for temporary cart storage)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) NOT NULL,
  product_id UUID REFERENCES public.products(id),
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  price_type VARCHAR(50) DEFAULT 'retail',
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create transactions table (for completed sales)
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

-- 3. Create transaction_items table (for sale line items)
CREATE TABLE IF NOT EXISTS public.transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_payment ON public.transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON public.transaction_items(product_id);

-- 5. Enable RLS on all tables
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for cart_items
DROP POLICY IF EXISTS "Allow all for anon" ON public.cart_items;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.cart_items;
CREATE POLICY "Allow all for anon" ON public.cart_items FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.cart_items FOR ALL TO authenticated USING (true);

-- 7. Create policies for transactions
DROP POLICY IF EXISTS "Allow all for anon" ON public.transactions;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.transactions;
CREATE POLICY "Allow all for anon" ON public.transactions FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.transactions FOR ALL TO authenticated USING (true);

-- 8. Create policies for transaction_items
DROP POLICY IF EXISTS "Allow all for anon" ON public.transaction_items;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.transaction_items;
CREATE POLICY "Allow all for anon" ON public.transaction_items FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.transaction_items FOR ALL TO authenticated USING (true);

-- 9. Verify tables were created
SELECT 
  'cart_items' as table_name, 
  COUNT(*) as row_count 
FROM public.cart_items
UNION ALL
SELECT 
  'transactions' as table_name, 
  COUNT(*) as row_count 
FROM public.transactions
UNION ALL
SELECT 
  'transaction_items' as table_name, 
  COUNT(*) as row_count 
FROM public.transaction_items;

SELECT '✅ POS tables created successfully!' as message;
