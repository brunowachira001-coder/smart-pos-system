-- Add is_active column to products table for e-commerce visibility control

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Set all existing products to active
UPDATE products SET is_active = true WHERE is_active IS NULL;

-- Verify the column was added
SELECT 
  id,
  name,
  retail_price,
  stock_quantity,
  is_active
FROM products
LIMIT 5;
