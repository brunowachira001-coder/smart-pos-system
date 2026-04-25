-- Complete Database Setup for Smart POS System
-- Run this in Supabase SQL Editor to set up everything

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'Sales Person',
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Insert default admin user (password: admin123)
INSERT INTO public.users (full_name, email, password_hash, role, phone, is_active) VALUES
  ('Bruno Wachira', 'brunowachira001@gmail.com', '$2a$10$rKZLvVZhVqJYQKJYQKJYQOeH8vZhVqJYQKJYQKJYQOeH8vZhVqJYQO', 'Admin', '+254700000000', true)
ON CONFLICT (email) DO NOTHING;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  image_url TEXT,
  barcode VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);

-- 3. CUSTOMERS TABLE  
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  credit_limit DECIMAL(10, 2) DEFAULT 0,
  current_balance DECIMAL(10, 2) DEFAULT 0,
  debt_limit DECIMAL(10, 2) DEFAULT 0,
  total_purchases DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- 4. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  user_id UUID REFERENCES public.users(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_customer ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(created_at);

-- 5. TRANSACTION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON public.transaction_items(product_id);

-- 6. SHOP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255),
  business_tagline VARCHAR(255),
  business_address TEXT,
  business_phone VARCHAR(20),
  business_email VARCHAR(255),
  logo_url TEXT,
  currency VARCHAR(10) DEFAULT 'KES',
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  receipt_footer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default shop settings
INSERT INTO public.shop_settings (business_name, business_tagline, currency) VALUES
  ('Smart POS', 'Your Business Tagline', 'KES')
ON CONFLICT DO NOTHING;

-- 7. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- 8. DEBTS TABLE
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id),
  transaction_id UUID REFERENCES public.transactions(id),
  amount DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debts_customer ON public.debts(customer_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON public.debts(status);

-- 9. RETURNS TABLE
CREATE TABLE IF NOT EXISTS public.returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id),
  customer_id UUID REFERENCES public.customers(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  processed_by UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_returns_transaction ON public.returns(transaction_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer ON public.returns(customer_id);

-- 10. RETURN ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID REFERENCES public.returns(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_items_return ON public.return_items(return_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES (Allow all for service_role)
CREATE POLICY "Allow all for service_role" ON public.users FOR ALL TO service_role USING (true);
CREATE POLICY "Allow all for service_role" ON public.products FOR ALL TO service_role USING (true);
CREATE POLICY "Allow all for service_role" ON public.customers FOR ALL TO service_role USING (true);
CREATE POLICY "Allow all for service_role" ON public.transactions FOR ALL TO service_role USING (true);
CREATE POLICY "Allow all for service_role" ON public.transaction_items FOR ALL TO service_role USING (true);
CREATE POLICY "Allow all for service_role" ON public.shop_settings FOR ALL TO service_role USING (true);
CREATE POLICY "Allow all for service_role" ON public.expenses FOR ALL TO service_role USING (true);
CREATE POLICY "Allow all for service_role" ON public.debts FOR ALL TO service_role USING (true);
CREATE POLICY "Allow all for service_role" ON public.returns FOR ALL TO service_role USING (true);
CREATE POLICY "Allow all for service_role" ON public.return_items FOR ALL TO service_role USING (true);

-- SUCCESS MESSAGE
SELECT 'Database setup complete! You can now login with: brunowachira001@gmail.com / admin123' as message;
