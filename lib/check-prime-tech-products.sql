-- Check what products Prime Tech Electronics actually has
SELECT 
  id,
  name,
  category,
  retail_price,
  stock_quantity,
  image_url
FROM products 
WHERE tenant_id = (SELECT id FROM tenants WHERE subdomain = 'prime-tech-electronics-ltd')
ORDER BY name;
