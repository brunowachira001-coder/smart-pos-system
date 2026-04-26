-- Fix debts table - add missing column
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS amount_remaining DECIMAL(12, 2);

-- Fix returns table - add missing column  
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);

-- Now manually import debts, returns, expenses
