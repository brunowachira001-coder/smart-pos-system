-- Add balance column to debts table if it doesn't exist
ALTER TABLE public.debts
ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2);

-- Update existing debts: set balance = amount (for new debts) or calculate from amount - amount_paid
UPDATE public.debts
SET balance = amount - COALESCE(amount_paid, 0)
WHERE balance IS NULL;

-- Create trigger to ensure balance never goes negative and update status
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

SELECT 'Balance column populated and trigger created!' as message;

