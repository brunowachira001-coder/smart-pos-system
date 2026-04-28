-- Add customer_name and customer_phone columns to transactions table
-- This allows storing walk-in customer names without creating a customer record

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);

-- Create index for searching by customer name
CREATE INDEX IF NOT EXISTS idx_transactions_customer_name ON public.transactions(customer_name);

SELECT '✅ Added customer_name and customer_phone columns to transactions table' as message;
