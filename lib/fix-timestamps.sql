-- Fix timestamps to use server time (NOW())
-- This ensures all transactions, debts, and other records use real-time

-- Update transactions table
ALTER TABLE public.transactions
ALTER COLUMN created_at SET DEFAULT NOW();

-- Update transaction_items table
ALTER TABLE public.transaction_items
ALTER COLUMN created_at SET DEFAULT NOW();

-- Update debts table
ALTER TABLE public.debts
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Update returns table
ALTER TABLE public.returns
ALTER COLUMN created_at SET DEFAULT NOW();

-- Update return_items table
ALTER TABLE public.return_items
ALTER COLUMN created_at SET DEFAULT NOW();

-- Update expenses table
ALTER TABLE public.expenses
ALTER COLUMN created_at SET DEFAULT NOW();

-- Update products table
ALTER TABLE public.products
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Update customers table
ALTER TABLE public.customers
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Update users table
ALTER TABLE public.users
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Update shop_settings table
ALTER TABLE public.shop_settings
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();

SELECT 'All timestamps updated to use server time (NOW())!' as message;
