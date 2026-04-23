-- Simple approach: Update existing products to create pricing issues
-- Run this in Supabase SQL Editor

-- First, let's see what products exist
SELECT id, name, sku, price, cost_price, retail_price, wholesale_price 
FROM products 
LIMIT 5;

-- Update the first product to have missing cost price
UPDATE products 
SET cost_price = 0
WHERE sku = 'PROD001'
RETURNING id, name, sku, cost_price, retail_price, wholesale_price;

-- Update the second product to have zero selling prices
UPDATE products 
SET retail_price = 0, wholesale_price = 0
WHERE sku = 'PROD002'
RETURNING id, name, sku, cost_price, retail_price, wholesale_price;

-- Update the third product to sell below cost
UPDATE products 
SET cost_price = 200, retail_price = 100, wholesale_price = 90
WHERE sku = 'PROD003'
RETURNING id, name, sku, cost_price, retail_price, wholesale_price;

-- Update the fourth product to have unrealistic markup (>500%)
UPDATE products 
SET cost_price = 10, retail_price = 1000, wholesale_price = 900
WHERE sku = 'PROD004'
RETURNING id, name, sku, cost_price, retail_price, wholesale_price;

-- Verify the issues were created
SELECT 
  name, 
  sku, 
  cost_price, 
  retail_price, 
  wholesale_price,
  CASE 
    WHEN cost_price = 0 OR cost_price IS NULL THEN 'Missing Cost'
    WHEN (retail_price = 0 OR retail_price IS NULL) AND (wholesale_price = 0 OR wholesale_price IS NULL) THEN 'Zero Price'
    WHEN retail_price < cost_price OR wholesale_price < cost_price THEN 'Below Cost'
    WHEN cost_price > 0 AND retail_price > 0 AND ((retail_price - cost_price) / cost_price * 100) > 500 THEN 'High Markup'
    ELSE 'Valid'
  END as issue_type
FROM products 
WHERE sku IN ('PROD001', 'PROD002', 'PROD003', 'PROD004')
ORDER BY sku;
