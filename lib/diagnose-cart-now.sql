-- Check if there are any cart items
SELECT 
  id,
  session_id,
  product_id,
  product_name,
  quantity,
  tenant_id,
  created_at
FROM cart_items
ORDER BY created_at DESC
LIMIT 10;

-- Count cart items by tenant
SELECT 
  tenant_id,
  COUNT(*) as count
FROM cart_items
GROUP BY tenant_id;

-- Check your user's tenant_id
SELECT 
  id,
  email,
  tenant_id,
  system_role
FROM users
WHERE email = 'YOUR_EMAIL_HERE'  -- Replace with your email
LIMIT 1;
