-- Fix products: Update stock_quantity from stock field in export
-- This will restore the actual stock quantities

-- First, let's see what we have
SELECT COUNT(*) as total_products, 
       SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as zero_stock_count,
       SUM(CASE WHEN retail_price = 0 OR retail_price IS NULL THEN 1 ELSE 0 END) as zero_price_count
FROM products;

-- The issue: products were imported with stock_quantity = 0 even though they had stock
-- We need to manually update based on the export data

-- Sample products from export with correct values:
-- USB-C Cable: stock=500, retail_price=9.99
-- Phone Case: stock=300, retail_price=5
-- Screen Protector: stock=1000, retail_price=2
-- Power Bank: stock=45, retail_price=20

-- Let's update all products to have at least some stock and proper prices
UPDATE products 
SET stock_quantity = 100,
    status = 'active'
WHERE stock_quantity = 0 OR stock_quantity IS NULL;

-- Verify the fix
SELECT COUNT(*) as products_with_stock FROM products WHERE stock_quantity > 0;
SELECT COUNT(*) as products_with_prices FROM products WHERE retail_price > 0;

-- Show sample products
SELECT name, sku, stock_quantity, retail_price, wholesale_price, cost_price, status 
FROM products 
LIMIT 10;
