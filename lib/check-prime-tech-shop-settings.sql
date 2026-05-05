-- Check if Prime Tech has shop_settings data
SELECT 
  t.id as tenant_id,
  t.business_name,
  t.slug,
  t.logo_url as tenant_logo,
  t.tagline as tenant_tagline,
  t.business_phone as tenant_phone,
  ss.id as shop_settings_id,
  ss.logo_url as settings_logo,
  ss.business_tagline as settings_tagline,
  ss.business_phone as settings_phone
FROM tenants t
LEFT JOIN shop_settings ss ON ss.tenant_id = t.id
WHERE t.slug = 'prime-tech-electronics-ltd';
