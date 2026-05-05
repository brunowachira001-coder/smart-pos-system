-- SAFE FIX for shop_settings - handles already-run migrations
-- This version won't error if policies already exist
-- Run this in Supabase SQL Editor

-- Step 1: Add tenant_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shop_settings' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE shop_settings 
    ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added tenant_id column';
  ELSE
    RAISE NOTICE 'tenant_id column already exists';
  END IF;
END $$;

-- Step 2: Add business_type column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shop_settings' AND column_name = 'business_type'
  ) THEN
    ALTER TABLE shop_settings 
    ADD COLUMN business_type VARCHAR(100);
    RAISE NOTICE 'Added business_type column';
  ELSE
    RAISE NOTICE 'business_type column already exists';
  END IF;
END $$;

-- Step 3: Migrate existing data - link settings to tenant
UPDATE shop_settings s
SET tenant_id = u.tenant_id
FROM users u
WHERE s.user_id = u.id
AND s.tenant_id IS NULL
AND u.tenant_id IS NOT NULL;

-- Step 4: Check for orphaned settings
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM shop_settings
  WHERE tenant_id IS NULL;
  
  IF orphan_count > 0 THEN
    RAISE NOTICE 'WARNING: % shop_settings records have no tenant_id', orphan_count;
  ELSE
    RAISE NOTICE 'All shop_settings have tenant_id - good!';
  END IF;
END $$;

-- Step 5: Drop old policies (ignore errors if they don't exist)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own shop settings" ON shop_settings;
  DROP POLICY IF EXISTS "Users can insert own shop settings" ON shop_settings;
  DROP POLICY IF EXISTS "Users can update own shop settings" ON shop_settings;
  DROP POLICY IF EXISTS "Users can delete own shop settings" ON shop_settings;
  RAISE NOTICE 'Dropped old user-based policies';
END $$;

-- Step 6: Create new tenant-based policies (drop first if they exist)
DO $$ 
BEGIN
  -- View policy
  BEGIN
    DROP POLICY IF EXISTS "Tenant users can view shop settings" ON shop_settings;
    CREATE POLICY "Tenant users can view shop settings"
      ON shop_settings FOR SELECT
      USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));
    RAISE NOTICE 'Created view policy';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'View policy already exists or error: %', SQLERRM;
  END;

  -- Insert policy
  BEGIN
    DROP POLICY IF EXISTS "Tenant users can insert shop settings" ON shop_settings;
    CREATE POLICY "Tenant users can insert shop settings"
      ON shop_settings FOR INSERT
      WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));
    RAISE NOTICE 'Created insert policy';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Insert policy already exists or error: %', SQLERRM;
  END;

  -- Update policy
  BEGIN
    DROP POLICY IF EXISTS "Tenant users can update shop settings" ON shop_settings;
    CREATE POLICY "Tenant users can update shop settings"
      ON shop_settings FOR UPDATE
      USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));
    RAISE NOTICE 'Created update policy';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Update policy already exists or error: %', SQLERRM;
  END;

  -- Delete policy
  BEGIN
    DROP POLICY IF EXISTS "Tenant users can delete shop settings" ON shop_settings;
    CREATE POLICY "Tenant users can delete shop settings"
      ON shop_settings FOR DELETE
      USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));
    RAISE NOTICE 'Created delete policy';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Delete policy already exists or error: %', SQLERRM;
  END;
END $$;

-- Step 7: Create index (if not exists)
CREATE INDEX IF NOT EXISTS idx_shop_settings_tenant_id ON shop_settings(tenant_id);

-- Step 8: Remove duplicates (keep most recent per tenant)
DELETE FROM shop_settings a 
USING shop_settings b
WHERE a.id < b.id 
AND a.tenant_id = b.tenant_id
AND a.tenant_id IS NOT NULL;

-- Step 9: Add unique constraint (drop old ones first)
DO $$
BEGIN
  ALTER TABLE shop_settings DROP CONSTRAINT IF EXISTS shop_settings_tenant_id_key;
  ALTER TABLE shop_settings DROP CONSTRAINT IF EXISTS unique_tenant_settings;
  ALTER TABLE shop_settings DROP CONSTRAINT IF EXISTS shop_settings_user_id_key;
  
  -- Add new constraint
  ALTER TABLE shop_settings ADD CONSTRAINT unique_tenant_settings UNIQUE (tenant_id);
  RAISE NOTICE 'Added unique constraint on tenant_id';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Constraint already exists or error: %', SQLERRM;
END $$;

-- Step 10: Verify the migration
SELECT 
  s.id,
  s.tenant_id,
  t.business_name as tenant_name,
  t.slug as tenant_slug,
  s.business_name as settings_name,
  s.user_id,
  u.email as user_email
FROM shop_settings s
LEFT JOIN tenants t ON s.tenant_id = t.id
LEFT JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC;
