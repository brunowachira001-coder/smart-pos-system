-- =====================================================
-- ADD TENANT ISOLATION TO SMS TABLES
-- =====================================================
-- This script adds tenant_id columns and implements
-- proper tenant isolation for multi-tenant security
-- =====================================================

-- =====================================================
-- STEP 1: Add tenant_id columns
-- =====================================================

-- Add tenant_id to sms_config
ALTER TABLE public.sms_config 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Add tenant_id to automation_rules
ALTER TABLE public.automation_rules 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Add tenant_id to ai_message_analytics
ALTER TABLE public.ai_message_analytics 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 2: Backfill tenant_id for existing data
-- =====================================================

-- Option A: If you have a default tenant, set all records to that tenant
-- Uncomment and replace 'YOUR_DEFAULT_TENANT_ID' with actual tenant ID
/*
UPDATE public.sms_config 
SET tenant_id = 'YOUR_DEFAULT_TENANT_ID'::UUID 
WHERE tenant_id IS NULL;

UPDATE public.automation_rules 
SET tenant_id = 'YOUR_DEFAULT_TENANT_ID'::UUID 
WHERE tenant_id IS NULL;

UPDATE public.ai_message_analytics 
SET tenant_id = 'YOUR_DEFAULT_TENANT_ID'::UUID 
WHERE tenant_id IS NULL;
*/

-- Option B: Get the first tenant and assign to all records
DO $$
DECLARE
  first_tenant_id UUID;
BEGIN
  -- Get the first tenant ID
  SELECT id INTO first_tenant_id FROM tenants LIMIT 1;
  
  IF first_tenant_id IS NOT NULL THEN
    -- Update sms_config
    UPDATE public.sms_config 
    SET tenant_id = first_tenant_id 
    WHERE tenant_id IS NULL;
    
    -- Update automation_rules
    UPDATE public.automation_rules 
    SET tenant_id = first_tenant_id 
    WHERE tenant_id IS NULL;
    
    -- Update ai_message_analytics
    UPDATE public.ai_message_analytics 
    SET tenant_id = first_tenant_id 
    WHERE tenant_id IS NULL;
    
    RAISE NOTICE 'Backfilled tenant_id with: %', first_tenant_id;
  ELSE
    RAISE NOTICE 'No tenants found. Please create a tenant first.';
  END IF;
END $$;

-- =====================================================
-- STEP 3: Make tenant_id NOT NULL
-- =====================================================

-- Make tenant_id required
ALTER TABLE public.sms_config 
  ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.automation_rules 
  ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.ai_message_analytics 
  ALTER COLUMN tenant_id SET NOT NULL;

-- =====================================================
-- STEP 4: Add indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_sms_config_tenant_id 
  ON public.sms_config(tenant_id);

CREATE INDEX IF NOT EXISTS idx_automation_rules_tenant_id 
  ON public.automation_rules(tenant_id);

CREATE INDEX IF NOT EXISTS idx_ai_message_analytics_tenant_id 
  ON public.ai_message_analytics(tenant_id);

-- =====================================================
-- STEP 5: Drop old policies and create tenant isolation
-- =====================================================

-- Drop old authenticated policies
DROP POLICY IF EXISTS sms_config_authenticated_all ON public.sms_config;
DROP POLICY IF EXISTS automation_rules_authenticated_all ON public.automation_rules;
DROP POLICY IF EXISTS ai_message_analytics_authenticated_all ON public.ai_message_analytics;

-- Create NEW tenant isolation policies for sms_config
CREATE POLICY sms_config_tenant_isolation ON public.sms_config
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- Create NEW tenant isolation policies for automation_rules
CREATE POLICY automation_rules_tenant_isolation ON public.automation_rules
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- Create NEW tenant isolation policies for ai_message_analytics
CREATE POLICY ai_message_analytics_tenant_isolation ON public.ai_message_analytics
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- Keep service_role policies (backend still has full access)
-- These were already created in the previous script

-- =====================================================
-- STEP 6: Add unique constraints where appropriate
-- =====================================================

-- Ensure only one SMS config per tenant
-- (Uncomment if you want to enforce this)
/*
ALTER TABLE public.sms_config 
  ADD CONSTRAINT sms_config_tenant_unique 
  UNIQUE (tenant_id);
*/

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check tenant_id columns exist and are NOT NULL
DO $$
DECLARE
  sms_config_has_tenant BOOLEAN;
  automation_rules_has_tenant BOOLEAN;
  ai_analytics_has_tenant BOOLEAN;
BEGIN
  -- Check sms_config
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'sms_config' 
    AND column_name = 'tenant_id'
    AND is_nullable = 'NO'
  ) INTO sms_config_has_tenant;
  
  -- Check automation_rules
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'automation_rules' 
    AND column_name = 'tenant_id'
    AND is_nullable = 'NO'
  ) INTO automation_rules_has_tenant;
  
  -- Check ai_message_analytics
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_message_analytics' 
    AND column_name = 'tenant_id'
    AND is_nullable = 'NO'
  ) INTO ai_analytics_has_tenant;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TENANT COLUMN VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'sms_config has tenant_id (NOT NULL): %', sms_config_has_tenant;
  RAISE NOTICE 'automation_rules has tenant_id (NOT NULL): %', automation_rules_has_tenant;
  RAISE NOTICE 'ai_message_analytics has tenant_id (NOT NULL): %', ai_analytics_has_tenant;
  RAISE NOTICE '========================================';
END $$;

-- List all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('sms_config', 'automation_rules', 'ai_message_analytics')
ORDER BY tablename, policyname;

-- Count records per tenant
SELECT 
  'sms_config' as table_name,
  tenant_id,
  COUNT(*) as record_count
FROM public.sms_config
GROUP BY tenant_id

UNION ALL

SELECT 
  'automation_rules' as table_name,
  tenant_id,
  COUNT(*) as record_count
FROM public.automation_rules
GROUP BY tenant_id

UNION ALL

SELECT 
  'ai_message_analytics' as table_name,
  tenant_id,
  COUNT(*) as record_count
FROM public.ai_message_analytics
GROUP BY tenant_id
ORDER BY table_name, tenant_id;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TENANT ISOLATION MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes Made:';
  RAISE NOTICE '  ✓ Added tenant_id columns to all 3 tables';
  RAISE NOTICE '  ✓ Backfilled existing data with tenant IDs';
  RAISE NOTICE '  ✓ Made tenant_id NOT NULL (required)';
  RAISE NOTICE '  ✓ Added indexes for performance';
  RAISE NOTICE '  ✓ Created tenant isolation RLS policies';
  RAISE NOTICE '  ✓ Kept service_role access for backend';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Security Improvements:';
  RAISE NOTICE '  • Each tenant can only see their own data';
  RAISE NOTICE '  • Cross-tenant data access is blocked';
  RAISE NOTICE '  • Automatic tenant filtering via RLS';
  RAISE NOTICE '  • Backend (service_role) still has full access';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Update your application code to set tenant context';
  RAISE NOTICE '  2. Use: SET app.current_tenant_id = ''tenant-uuid''';
  RAISE NOTICE '  3. Test that tenants can only see their own data';
  RAISE NOTICE '  4. Verify backend operations still work';
  RAISE NOTICE '========================================';
END $$;
