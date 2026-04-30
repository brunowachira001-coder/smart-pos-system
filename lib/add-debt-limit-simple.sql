-- Add debt_limit column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS debt_limit DECIMAL(10, 2) DEFAULT NULL;

-- Verify the column was added
SELECT 'debt_limit column added!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'debt_limit';
