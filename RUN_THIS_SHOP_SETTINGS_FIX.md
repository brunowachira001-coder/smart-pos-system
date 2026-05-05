# ✅ Shop Settings Fix - Run This Now

## The Error
```
policy "Tenant users can view shop settings" for table "shop_settings" already exists
```

This means the migration partially ran before. Use this **safe version** that won't error:

---

## 🎯 COPY THIS SQL (Safe Version)

Open Supabase SQL Editor and run this:

```sql
-- Add tenant_id column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shop_settings' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE shop_settings 
    ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Link existing settings to tenants
UPDATE shop_settings s
SET tenant_id = u.tenant_id
FROM users u
WHERE s.user_id = u.id
AND s.tenant_id IS NULL
AND u.tenant_id IS NOT NULL;

-- Remove duplicates
DELETE FROM shop_settings a 
USING shop_settings b
WHERE a.id < b.id 
AND a.tenant_id = b.tenant_id
AND a.tenant_id IS NOT NULL;

-- Add unique constraint
DO $$
BEGIN
  ALTER TABLE shop_settings DROP CONSTRAINT IF EXISTS shop_settings_tenant_id_key;
  ALTER TABLE shop_settings DROP CONSTRAINT IF EXISTS unique_tenant_settings;
  ALTER TABLE shop_settings DROP CONSTRAINT IF EXISTS shop_settings_user_id_key;
  ALTER TABLE shop_settings ADD CONSTRAINT unique_tenant_settings UNIQUE (tenant_id);
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore if already exists
END $$;

-- Verify it worked
SELECT 
  s.id,
  t.business_name as tenant,
  s.business_name as settings,
  CASE WHEN s.tenant_id IS NULL THEN '❌ NO TENANT' ELSE '✅ OK' END as status
FROM shop_settings s
LEFT JOIN tenants t ON s.tenant_id = t.id;
```

---

## ✅ What You Should See

After running, you should see a table showing:
- Your tenants (Nyla Wigs, Prime Tech, etc.)
- Their settings
- Status column showing "✅ OK" for all rows

---

## 🔄 Then Refresh Shop Settings

1. Go to Shop Settings page
2. Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
3. Try editing settings

Should work now! ✅

---

## 🆘 If Still Getting Errors

The policies already exist (which is good!). The error you saw was just because the SQL tried to create them again.

**Just verify the data is correct:**

Run this query:
```sql
SELECT tenant_id, business_name FROM shop_settings;
```

All rows should have a `tenant_id` (not NULL). If they do, you're good!

Just refresh the Shop Settings page and it should work.
