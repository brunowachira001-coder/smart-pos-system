-- Update Nyla Wigs business phone number
UPDATE shop_settings
SET business_phone = '0718307550',
    updated_at = NOW()
WHERE tenant_id = (
  SELECT id FROM tenants WHERE slug = 'nyla-wigs' LIMIT 1
);

-- Also update the tenants table
UPDATE tenants
SET business_phone = '0718307550',
    updated_at = NOW()
WHERE slug = 'nyla-wigs';

-- Verify
SELECT t.business_name, t.business_phone, s.business_phone as settings_phone
FROM tenants t
LEFT JOIN shop_settings s ON s.tenant_id = t.id
WHERE t.slug = 'nyla-wigs';
