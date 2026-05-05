-- Create shop_settings for Prime Tech if it doesn't exist
INSERT INTO shop_settings (
  tenant_id,
  user_id,
  business_name,
  business_type,
  business_email,
  business_phone,
  business_address,
  business_tagline,
  logo_url,
  primary_color,
  currency,
  currency_symbol,
  created_at,
  updated_at
)
SELECT 
  t.id as tenant_id,
  tu.user_id,
  t.business_name,
  t.business_type,
  t.business_email,
  t.business_phone,
  'Nairobi, Kenya' as business_address,
  'Quality Electronics & Accessories' as business_tagline,
  NULL as logo_url,  -- Add your logo URL here
  t.primary_color,
  'KES' as currency,
  'KSh' as currency_symbol,
  NOW() as created_at,
  NOW() as updated_at
FROM tenants t
JOIN tenant_users tu ON tu.tenant_id = t.id
WHERE t.slug = 'prime-tech-electronics-ltd'
  AND tu.role = 'owner'
  AND NOT EXISTS (
    SELECT 1 FROM shop_settings WHERE tenant_id = t.id
  )
LIMIT 1;

-- Verify it was created
SELECT 
  ss.*,
  t.business_name,
  t.slug
FROM shop_settings ss
JOIN tenants t ON t.id = ss.tenant_id
WHERE t.slug = 'prime-tech-electronics-ltd';
