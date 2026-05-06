-- First check what slug Nyla Wigs actually has
SELECT id, business_name, slug, business_phone FROM tenants WHERE business_name ILIKE '%nyla%';

-- Update using business_name instead of slug (safer)
UPDATE shop_settings
SET business_phone = '0718307550',
    updated_at = NOW()
WHERE tenant_id = (
  SELECT id FROM tenants WHERE business_name ILIKE '%nyla%' LIMIT 1
);

UPDATE tenants
SET business_phone = '0718307550',
    updated_at = NOW()
WHERE business_name ILIKE '%nyla%';

-- Verify
SELECT t.business_name, t.slug, t.business_phone, s.business_phone as settings_phone
FROM tenants t
LEFT JOIN shop_settings s ON s.tenant_id = t.id
WHERE t.business_name ILIKE '%nyla%';
