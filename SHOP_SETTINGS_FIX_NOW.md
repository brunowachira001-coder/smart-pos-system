# 🔧 Fix Shop Settings Error - Quick Guide

## Error You're Seeing
```
could not find the 'user_email' of 'shop_settings' in the schema cache
```

## ⚡ Quick Fix (5 minutes)

### 1. Open Supabase
Go to: https://supabase.com/dashboard
- Select your project
- Click **SQL Editor** (left sidebar)
- Click **New Query**

### 2. Copy This SQL
Open the file: `lib/fix-shop-settings-complete.sql`

Or use this shortened version:

```sql
-- Add tenant_id column
ALTER TABLE shop_settings 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Link existing settings to tenants
UPDATE shop_settings s
SET tenant_id = u.tenant_id
FROM users u
WHERE s.user_id = u.id AND s.tenant_id IS NULL;

-- Update security policies
DROP POLICY IF EXISTS "Users can view own shop settings" ON shop_settings;
DROP POLICY IF EXISTS "Users can insert own shop settings" ON shop_settings;
DROP POLICY IF EXISTS "Users can update own shop settings" ON shop_settings;
DROP POLICY IF EXISTS "Users can delete own shop settings" ON shop_settings;

CREATE POLICY "Tenant users can view shop settings"
  ON shop_settings FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can insert shop settings"
  ON shop_settings FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can update shop settings"
  ON shop_settings FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

-- Add unique constraint
ALTER TABLE shop_settings DROP CONSTRAINT IF EXISTS unique_tenant_settings;
ALTER TABLE shop_settings ADD CONSTRAINT unique_tenant_settings UNIQUE (tenant_id);
```

### 3. Click "Run"
You should see: "Success. No rows returned" ✅

### 4. Refresh Shop Settings Page
- Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Try editing settings again

## ✅ Done!
Shop Settings should now work perfectly.

---

## What This Does
- Adds `tenant_id` column to link settings to tenants
- Migrates your existing data
- Updates security policies for multi-tenant access
- Ensures each tenant has one settings record

## Why This Happened
The system was upgraded to multi-tenant architecture. The API code was updated but the database structure needed this migration.

## Need More Help?
See detailed guide: `FIX_SHOP_SETTINGS_ERROR.md`
