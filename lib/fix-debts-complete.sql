-- Complete fix for debts table
-- This ensures balance column exists and is populated

-- Step 1: Add balance column if it doesn't exist
ALTER TABLE public.debts
ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2);

-- Step 2: Populate balance for all existing debts
UPDATE public.debts
SET balance = amount - COALESCE(amount_paid, 0)
WHERE balance IS NULL OR balance = 0;

-- Step 3: Verify the data
SELECT 'Debts table fixed!' as message;
SELECT COUNT(*) as total_debts, SUM(balance) as total_outstanding FROM public.debts;
SELECT 'Sample debts:' as section;
SELECT id, customer_id, amount, amount_paid, balance, status FROM public.debts LIMIT 5;
