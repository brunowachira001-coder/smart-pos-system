-- Check cart items without tenant_id
SELECT 
  id,
  session_id,
  product_name,
  tenant_id,
  created_at
FROM cart_items
WHERE tenant_id IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- Count cart items by tenant
SELECT 
  tenant_id,
  COUNT(*) as item_count
FROM cart_items
GROUP BY tenant_id
ORDER BY item_count DESC;

-- Delete old cart items without tenant_id (older than 1 day)
-- DELETE FROM cart_items 
-- WHERE tenant_id IS NULL 
-- AND created_at < NOW() - INTERVAL '1 day';
