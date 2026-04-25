-- Fix Debt Negative Amount Issue
-- This script ensures amount_remaining never goes below 0

-- Add constraint to prevent negative amount_remaining
ALTER TABLE debts
ADD CONSTRAINT check_amount_remaining_non_negative 
CHECK (amount_remaining >= 0);

-- Update existing negative values to 0
UPDATE debts 
SET amount_remaining = 0 
WHERE amount_remaining < 0;

-- Update the trigger to ensure amount_remaining never goes negative
CREATE OR REPLACE FUNCTION update_debt_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure amount_remaining never goes below 0
  IF NEW.amount_remaining < 0 THEN
    NEW.amount_remaining := 0;
  END IF;
  
  -- Update status based on amount_remaining
  IF NEW.amount_remaining <= 0 THEN
    NEW.status := 'Paid';
  ELSIF NEW.amount_paid > 0 AND NEW.amount_remaining > 0 THEN
    NEW.status := 'Partial';
  ELSE
    NEW.status := 'Outstanding';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_update_debt_status ON debts;
CREATE TRIGGER trigger_update_debt_status
  BEFORE UPDATE ON debts
  FOR EACH ROW
  EXECUTE FUNCTION update_debt_status();
