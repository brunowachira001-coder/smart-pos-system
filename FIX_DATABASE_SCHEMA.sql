-- DROP AND RECREATE PRODUCTS TABLE WITH CORRECT SCHEMA
-- This matches your original database structure

DROP TABLE IF EXISTS public.products CASCADE;

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100),
  cost_price DECIMAL(12, 2) DEFAULT 0,
  retail_price DECIMAL(12, 2) DEFAULT 0,
  wholesale_price DECIMAL(12, 2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  minimum_stock_level INTEGER DEFAULT 10,
  variant_of UUID REFERENCES public.products(id),
  image_url TEXT,
  description TEXT,
  barcode VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DROP AND RECREATE CUSTOMERS TABLE WITH CORRECT SCHEMA
DROP TABLE IF EXISTS public.customers CASCADE;

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  customer_type VARCHAR(50) DEFAULT 'retail',
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  debt_limit DECIMAL(12, 2) DEFAULT 0,
  balance DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS but don't add policies (we'll keep it open for now)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Grant full access to anon and authenticated roles
GRANT ALL ON public.products TO anon, authenticated;
GRANT ALL ON public.customers TO anon, authenticated;

-- Create policies that allow everything
CREATE POLICY "Allow all on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
