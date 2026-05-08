-- ============================================================
-- E-COMMERCE SHOP SETUP
-- Run this to configure your shop for e-commerce
-- ============================================================

-- STEP 1: Find your tenant ID
SELECT 
  id,
  business_name,
  subdomain
FROM tenants
ORDER BY created_at DESC;

-- Copy your tenant ID from the results above, then run the commands below
-- Replace 'YOUR_TENANT_ID' with your actual tenant ID

-- ============================================================
-- STEP 2: Set your shop subdomain (slug)
-- This will be used in the URL: /shop/your-slug
-- ============================================================

-- Example: If your business is "Nyla Wigs", use subdomain "nylawigs"
UPDATE tenants
SET subdomain = 'nylawigs'  -- Change this to your shop name (lowercase, no spaces)
WHERE business_name = 'Nyla Wigs';  -- Or use: WHERE id = 'your-tenant-id'

-- Verify subdomain was set
SELECT id, business_name, subdomain FROM tenants;

-- ============================================================
-- STEP 3: Activate products for e-commerce
-- Makes your products visible in the online shop
-- ============================================================

-- Activate all products for your tenant (using subdomain)
UPDATE products
SET is_active = true
WHERE tenant_id IN (
  SELECT id FROM tenants WHERE subdomain = 'nylawigs'
);

-- Verify products are active
SELECT 
  id,
  name,
  retail_price,
  stock_quantity,
  is_active,
  category
FROM products
WHERE tenant_id IN (
  SELECT id FROM tenants WHERE subdomain = 'nylawigs'
)
LIMIT 10;

-- ============================================================
-- STEP 4: (Optional) Add product images
-- ============================================================

-- Example: Add image to a specific product
-- UPDATE products
-- SET image_url = 'https://your-image-url.com/product.jpg'
-- WHERE name = 'Product Name'
-- AND tenant_id = 'your-tenant-id';

-- ============================================================
-- STEP 5: Verify setup is complete
-- ============================================================

SELECT 
  t.business_name,
  t.subdomain,
  COUNT(p.id) as total_products,
  COUNT(CASE WHEN p.is_active THEN 1 END) as active_products,
  COUNT(CASE WHEN p.stock_quantity > 0 THEN 1 END) as in_stock_products
FROM tenants t
LEFT JOIN products p ON t.id = p.tenant_id
WHERE t.subdomain = 'nylawigs'  -- Change to your subdomain
GROUP BY t.id, t.business_name, t.subdomain;

-- ============================================================
-- DONE!
-- ============================================================
-- Your e-commerce shop is now configured!
-- 
-- Access your shop at:
-- http://localhost:3000/shop/nylawigs
-- 
-- (Replace 'nylawigs' with your subdomain)
-- ============================================================
