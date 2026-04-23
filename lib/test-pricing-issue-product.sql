-- Test Product with Pricing Issue
-- Run this in Supabase SQL Editor to add a product with pricing issues for testing

-- Add a product with missing cost price
INSERT INTO products (
  name, 
  sku,
  price,
  retail_price, 
  wholesale_price, 
  cost_price, 
  stock,
  stock_quantity, 
  minimum_stock_level, 
  category, 
  description,
  barcode,
  created_at
)
VALUES 
  ('Test Product - No Cost', 'TEST001', 100.00, 100.00, 90.00, 0, 10, 10, 5, 'Test', 'Product with no cost price', '9999999999001', NOW())
ON CONFLICT (sku) DO UPDATE SET
  price = 100.00,
  cost_price = 0,
  retail_price = 100.00,
  wholesale_price = 90.00,
  stock = 10,
  stock_quantity = 10;

-- Add a product with zero selling prices
INSERT INTO products (
  name, 
  sku,
  price,
  retail_price, 
  wholesale_price, 
  cost_price,
  stock,
  stock_quantity, 
  minimum_stock_level, 
  category, 
  description,
  barcode,
  created_at
)
VALUES 
  ('Test Product - Zero Price', 'TEST002', 0.01, 0, 0, 50.00, 10, 10, 5, 'Test', 'Product with zero selling prices', '9999999999002', NOW())
ON CONFLICT (sku) DO UPDATE SET
  price = 0.01,
  cost_price = 50.00,
  retail_price = 0,
  wholesale_price = 0,
  stock = 10,
  stock_quantity = 10;

-- Add a product selling below cost
INSERT INTO products (
  name, 
  sku,
  price,
  retail_price, 
  wholesale_price, 
  cost_price,
  stock,
  stock_quantity, 
  minimum_stock_level, 
  category, 
  description,
  barcode,
  created_at
)
VALUES 
  ('Test Product - Below Cost', 'TEST003', 40.00, 40.00, 35.00, 100.00, 10, 10, 5, 'Test', 'Product selling below cost', '9999999999003', NOW())
ON CONFLICT (sku) DO UPDATE SET
  price = 40.00,
  cost_price = 100.00,
  retail_price = 40.00,
  wholesale_price = 35.00,
  stock = 10,
  stock_quantity = 10;

-- Add a product with unrealistic markup (>500%)
INSERT INTO products (
  name, 
  sku,
  price,
  retail_price, 
  wholesale_price, 
  cost_price,
  stock,
  stock_quantity, 
  minimum_stock_level, 
  category, 
  description,
  barcode,
  created_at
)
VALUES 
  ('Test Product - High Markup', 'TEST004', 1000.00, 1000.00, 900.00, 10.00, 10, 10, 5, 'Test', 'Product with unrealistic markup', '9999999999004', NOW())
ON CONFLICT (sku) DO UPDATE SET
  price = 1000.00,
  cost_price = 10.00,
  retail_price = 1000.00,
  wholesale_price = 900.00,
  stock = 10,
  stock_quantity = 10;

-- Verify the test products were added
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
    WHEN ((retail_price - cost_price) / cost_price * 100) > 500 THEN 'High Markup'
    ELSE 'Valid'
  END as issue_type
FROM products 
WHERE sku LIKE 'TEST%'
ORDER BY sku;
