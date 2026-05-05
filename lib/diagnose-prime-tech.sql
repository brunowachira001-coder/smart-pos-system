-- Diagnostic: Check Prime Tech Electronics data
-- Run this in Supabase SQL Editor to see what's actually in the database

-- 1. Check tenant record
SELECT 
  id,
  business_name,
  slug,
  business_email,
  business_phone,
  business_type,
  theme_color,
  currency,
  created_at
FROM tenants
WHERE business_name ILIKE '%prime tech%';

-- 2. Check shop_settings record
SELECT 
  s.id,
  s.tenant_id,
  s.business_name,
  s.business_email,
  s.business_phone,
  s.primary_color,
  s.currency,
  s.created_at,
  s.updated_at
FROM shop_settings s
JOIN tenants t ON t.id = s.tenant_id
WHERE t.business_name ILIKE '%prime tech%';

-- 3. Check users for Prime Tech
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.tenant_id,
  t.business_name
FROM users u
JOIN tenants t ON t.id = u.tenant_id
WHERE t.business_name ILIKE '%prime tech%';

-- 4. Check if tenant_id matches between tables
SELECT 
  t.id as tenant_id,
  t.business_name as tenant_name,
  t.slug as tenant_slug,
  s.id as shop_settings_id,
  s.business_name as shop_settings_name,
  u.id as user_id,
  u.email as user_email
FROM tenants t
LEFT JOIN shop_settings s ON s.tenant_id = t.id
LEFT JOIN users u ON u.tenant_id = t.id AND u.role = 'Admin'
WHERE t.business_name ILIKE '%prime tech%';

-- 5. Compare with Nyla Wigs (for reference)
SELECT 
  t.business_name,
  t.slug,
  s.business_name as shop_settings_name,
  COUNT(u.id) as user_count
FROM tenants t
LEFT JOIN shop_settings s ON s.tenant_id = t.id
LEFT JOIN users u ON u.tenant_id = t.id
WHERE t.business_name IN ('Nyla Wigs', 'Prime Tech Electronics Ltd')
GROUP BY t.id, t.business_name, t.slug, s.business_name
ORDER BY t.business_name;
