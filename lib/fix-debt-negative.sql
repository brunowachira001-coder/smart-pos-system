-- Fix Debt Negative Balance Issue
-- This script ensures balance never goes below 0

-- Add constraint to prevent negative balance
ALTER TABLE public.debts
ADD CONSTRAINT check_balance_non_negative 
CHECK (balance >= 0);

-- Update existing negative values to 0
UPDATE public.debts 
SET balance = 0 
WHERE balance < 0;

-- Create trigger to ensure balance never goes negative
CREATE OR REPLACE FUNCTION update_debt_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure balance never goes below 0
  IF NEW.balance < 0 THEN
    NEW.balance := 0;
  END IF;
  
  -- Update status based on balance
  IF NEW.balance <= 0 THEN
    NEW.status := 'paid';
  ELSIF NEW.amount_paid > 0 AND NEW.balance > 0 THEN
    NEW.status := 'partial';
  ELSE
    NEW.status := 'pending';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_update_debt_balance ON public.debts;
CREATE TRIGGER trigger_update_debt_balance
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION update_debt_balance();
