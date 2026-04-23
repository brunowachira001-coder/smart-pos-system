-- Minimal Demo Data Script
-- Creates ONLY customers and products (guaranteed to work)
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CUSTOMERS (50 customers)
-- ============================================
INSERT INTO customers (name, email, phone, address, city, country, customer_type, status, notes, debt_limit)
SELECT 
  'Customer ' || i,
  'customer' || i || '@example.com',
  '+254' || LPAD((700000000 + i)::text, 9, '0'),
  i || ' Main Street',
  CASE (i % 5)
    WHEN 0 THEN 'Nairobi'
    WHEN 1 THEN 'Mombasa'
    WHEN 2 THEN 'Kisumu'
    WHEN 3 THEN 'Nakuru'
    ELSE 'Eldoret'
  END,
  'Kenya',
  CASE WHEN i % 3 = 0 THEN 'wholesale' ELSE 'retail' END,
  'active',
  'Demo customer ' || i,
  CASE WHEN i % 3 = 0 THEN 50000 ELSE 10000 END
FROM generate_series(1, 50) AS i
WHERE NOT EXISTS (
  SELECT 1 FROM customers WHERE email = 'customer' || i || '@example.com'
);

-- ============================================
-- 2. PRODUCTS (100 products)
-- ============================================
INSERT INTO products (name, sku, category, price, stock, cost_price, retail_price, wholesale_price, stock_quantity, minimum_stock_level, status, description, image_url)
SELECT 
  'Product ' || i,
  'SKU-' || LPAD(i::text, 5, '0'),
  CASE (i % 8)
    WHEN 0 THEN 'Electronics'
    WHEN 1 THEN 'Clothing'
    WHEN 2 THEN 'Food & Beverages'
    WHEN 3 THEN 'Home & Garden'
    WHEN 4 THEN 'Sports'
    WHEN 5 THEN 'Books'
    WHEN 6 THEN 'Toys'
    ELSE 'Health & Beauty'
  END,
  (100 + (i * 15))::numeric,
  (100 + (i * 5)),
  (50 + (i * 10))::numeric,
  (100 + (i * 15))::numeric,
  (80 + (i * 12))::numeric,
  (100 + (i * 5)),
  20,
  CASE WHEN i % 20 = 0 THEN 'archived' ELSE 'active' END,
  'Demo product description for item ' || i,
  CASE WHEN i % 10 = 0 THEN 'https://i.imgur.com/placeholder.jpg' ELSE NULL END
FROM generate_series(1, 100) AS i
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE sku = 'SKU-' || LPAD(i::text, 5, '0')
);

-- ============================================
-- SUMMARY
-- ============================================
SELECT 
  'Customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'Products', COUNT(*) FROM products;
