-- ============================================
-- BARCODE ASSIGNMENT SCRIPT
-- ============================================
-- This script helps you assign barcodes to products

-- ============================================
-- OPTION 1: Auto-Generate Sequential Barcodes
-- ============================================
-- This creates barcodes like: 1000000000001, 1000000000002, etc.
-- Only updates products that don't have a SKU

WITH numbered_products AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM products
  WHERE sku IS NULL OR sku = '' OR sku = 'N/A'
)
UPDATE products p
SET sku = LPAD((1000000000000 + np.row_num)::TEXT, 13, '0')
FROM numbered_products np
WHERE p.id = np.id;

-- Verify the update
SELECT id, name, sku FROM products ORDER BY sku;


-- ============================================
-- OPTION 2: Simple Sequential (1001, 1002, 1003...)
-- ============================================
-- Simpler format, easier to remember

WITH numbered_products AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM products
  WHERE sku IS NULL OR sku = '' OR sku = 'N/A'
)
UPDATE products p
SET sku = (1000 + np.row_num)::TEXT
FROM numbered_products np
WHERE p.id = np.id;

-- Verify
SELECT id, name, sku FROM products ORDER BY sku;


-- ============================================
-- OPTION 3: Category-Based Barcodes
-- ============================================
-- Format: CATEGORY-001, CATEGORY-002, etc.
-- Replace 'DRINKS' with your category

WITH numbered_products AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY name) as row_num
  FROM products
  WHERE (sku IS NULL OR sku = '' OR sku = 'N/A')
    AND category = 'DRINKS'  -- Change this to your category
)
UPDATE products p
SET sku = 'DRINKS-' || LPAD(np.row_num::TEXT, 3, '0')
FROM numbered_products np
WHERE p.id = np.id;

-- Verify
SELECT id, name, category, sku FROM products WHERE category = 'DRINKS' ORDER BY sku;


-- ============================================
-- OPTION 4: Manual Assignment (One by One)
-- ============================================
-- Update specific products with specific barcodes

-- Example: Update by product name
UPDATE products SET sku = '5449000000996' WHERE name = 'Coca Cola 500ml';
UPDATE products SET sku = '5449000131872' WHERE name = 'Fanta Orange 500ml';
UPDATE products SET sku = '5449000054227' WHERE name = 'Sprite 500ml';
UPDATE products SET sku = '5000112637588' WHERE name = 'Pepsi 500ml';

-- Example: Update by product ID
UPDATE products SET sku = '1234567890123' WHERE id = 'your-product-id-1';
UPDATE products SET sku = '1234567890124' WHERE id = 'your-product-id-2';


-- ============================================
-- OPTION 5: Prefix-Based System
-- ============================================
-- Add a prefix to existing product IDs
-- Format: PROD-{product-id}

UPDATE products
SET sku = 'PROD-' || id
WHERE sku IS NULL OR sku = '' OR sku = 'N/A';

-- Verify
SELECT id, name, sku FROM products ORDER BY created_at;


-- ============================================
-- USEFUL QUERIES
-- ============================================

-- 1. Check which products don't have barcodes
SELECT id, name, sku, stock_quantity
FROM products
WHERE sku IS NULL OR sku = '' OR sku = 'N/A'
ORDER BY name;

-- 2. Check for duplicate barcodes (should return nothing)
SELECT sku, COUNT(*) as count
FROM products
WHERE sku IS NOT NULL AND sku != ''
GROUP BY sku
HAVING COUNT(*) > 1;

-- 3. View all products with their barcodes
SELECT id, name, sku, retail_price, wholesale_price, stock_quantity
FROM products
ORDER BY sku;

-- 4. Count products with and without barcodes
SELECT 
  COUNT(*) FILTER (WHERE sku IS NOT NULL AND sku != '' AND sku != 'N/A') as with_barcode,
  COUNT(*) FILTER (WHERE sku IS NULL OR sku = '' OR sku = 'N/A') as without_barcode,
  COUNT(*) as total
FROM products;

-- 5. Export products for CSV (copy results to Excel)
SELECT 
  id,
  name,
  sku,
  category,
  retail_price,
  wholesale_price,
  stock_quantity,
  reorder_level
FROM products
ORDER BY name;


-- ============================================
-- RESET BARCODES (Use with caution!)
-- ============================================
-- This removes all barcodes - only use if you want to start over

-- Uncomment to use:
-- UPDATE products SET sku = NULL;


-- ============================================
-- VALIDATION CHECKS
-- ============================================

-- Check 1: Ensure all products have unique SKUs
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT sku
    FROM products
    WHERE sku IS NOT NULL AND sku != ''
    GROUP BY sku
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE 'WARNING: Found % duplicate SKUs!', duplicate_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All SKUs are unique!';
  END IF;
END $$;

-- Check 2: Ensure all products have barcodes
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM products
  WHERE sku IS NULL OR sku = '' OR sku = 'N/A';
  
  IF missing_count > 0 THEN
    RAISE NOTICE 'WARNING: % products are missing barcodes!', missing_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All products have barcodes!';
  END IF;
END $$;


-- ============================================
-- EXAMPLE: Complete Setup for New Store
-- ============================================

-- Step 1: Assign sequential barcodes to all products
WITH numbered_products AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY name) as row_num
  FROM products
)
UPDATE products p
SET sku = LPAD((1000 + np.row_num)::TEXT, 4, '0')
FROM numbered_products np
WHERE p.id = np.id;

-- Step 2: Verify all products have barcodes
SELECT 
  id,
  name,
  sku,
  retail_price,
  stock_quantity
FROM products
ORDER BY sku;

-- Step 3: Check for any issues
SELECT 
  COUNT(*) FILTER (WHERE sku IS NOT NULL) as with_barcode,
  COUNT(*) FILTER (WHERE sku IS NULL) as without_barcode
FROM products;

-- Done! Your products now have barcodes.
-- Next: Print barcode labels and stick them on products.
