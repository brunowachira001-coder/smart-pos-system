-- Add missing columns to customers table
-- Run this in Supabase SQL Editor

-- Add city column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='customers' AND column_name='city') THEN
    ALTER TABLE customers ADD COLUMN city VARCHAR(100);
  END IF;
END $$;

-- Add country column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='customers' AND column_name='country') THEN
    ALTER TABLE customers ADD COLUMN country VARCHAR(100) DEFAULT 'Kenya';
  END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name IN ('city', 'country')
ORDER BY column_name;

-- Done!
SELECT '✅ Customer columns added successfully!' as status;
