-- Add debt_limit column to customers table
-- Run this in Supabase SQL Editor

-- Add debt_limit column if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS debt_limit DECIMAL(10, 2) DEFAULT NULL;

-- Add comment to the column
COMMENT ON COLUMN customers.debt_limit IS 'Maximum credit limit allowed for this customer';

-- Create index for better performance when querying customers with credit
CREATE INDEX IF NOT EXISTS idx_customers_debt_limit ON customers(debt_limit) WHERE debt_limit IS NOT NULL;

-- Update some existing customers with sample credit limits (optional - for testing)
-- You can skip this section if you want to set credit limits manually through the UI

-- Example: Set credit limits for first 3 customers
UPDATE customers 
SET debt_limit = 50000.00 
WHERE id IN (
  SELECT id FROM customers 
  WHERE debt_limit IS NULL 
  ORDER BY created_at 
  LIMIT 1
);

UPDATE customers 
SET debt_limit = 30000.00 
WHERE id IN (
  SELECT id FROM customers 
  WHERE debt_limit IS NULL 
  ORDER BY created_at 
  LIMIT 1
);

UPDATE customers 
SET debt_limit = 100000.00 
WHERE id IN (
  SELECT id FROM customers 
  WHERE debt_limit IS NULL 
  ORDER BY created_at 
  LIMIT 1
);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'debt_limit';
