-- Demo Products for POS System
-- Run this in Supabase SQL Editor to add sample products

-- First, check if products already exist
-- SELECT COUNT(*) FROM products;

-- If count is 0, run the INSERT below:

INSERT INTO products (
  name, 
  sku, 
  retail_price, 
  wholesale_price, 
  cost_price, 
  stock_quantity, 
  minimum_stock_level, 
  category, 
  description,
  barcode,
  created_at
)
VALUES 
  ('Milk (1L)', 'PROD001', 150.00, 140.00, 80.00, 100, 10, 'Dairy', 'Fresh milk', '1234567890001', NOW()),
  ('Bread (Loaf)', 'PROD002', 80.00, 75.00, 40.00, 50, 5, 'Bakery', 'Fresh bread', '1234567890002', NOW()),
  ('Eggs (Dozen)', 'PROD003', 200.00, 190.00, 120.00, 75, 10, 'Dairy', 'Fresh eggs', '1234567890003', NOW()),
  ('Rice (2kg)', 'PROD004', 300.00, 280.00, 180.00, 120, 15, 'Grains', 'White rice', '1234567890004', NOW()),
  ('Sugar (1kg)', 'PROD005', 120.00, 110.00, 70.00, 90, 10, 'Groceries', 'White sugar', '1234567890005', NOW()),
  ('Cooking Oil (1L)', 'PROD006', 250.00, 240.00, 150.00, 60, 10, 'Oils', 'Vegetable oil', '1234567890006', NOW()),
  ('Beans (1kg)', 'PROD007', 180.00, 170.00, 100.00, 80, 10, 'Grains', 'Dried beans', '1234567890007', NOW()),
  ('Flour (2kg)', 'PROD008', 140.00, 130.00, 80.00, 100, 15, 'Grains', 'Wheat flour', '1234567890008', NOW()),
  ('Tea Leaves (250g)', 'PROD009', 180.00, 170.00, 100.00, 60, 10, 'Beverages', 'Premium tea', '1234567890009', NOW()),
  ('Coffee (500g)', 'PROD010', 350.00, 330.00, 200.00, 40, 5, 'Beverages', 'Ground coffee', '1234567890010', NOW()),
  ('Salt (1kg)', 'PROD011', 50.00, 45.00, 25.00, 150, 20, 'Groceries', 'Iodized salt', '1234567890011', NOW()),
  ('Pasta (500g)', 'PROD012', 120.00, 110.00, 65.00, 70, 10, 'Grains', 'Spaghetti pasta', '1234567890012', NOW())
ON CONFLICT (sku) DO NOTHING;

-- Verify products were added
SELECT COUNT(*) as total_products FROM products;
SELECT * FROM products ORDER BY name LIMIT 10;
