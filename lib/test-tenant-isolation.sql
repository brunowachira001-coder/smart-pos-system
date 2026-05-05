-- ============================================================
-- TEST TENANT ISOLATION
-- This script tests that RLS policies are working correctly
-- Run this AFTER deploying the API changes
-- ============================================================

-- Get tenant IDs for testing
DO $
DECLARE
  prime_tech_id UUID;
  nyla_wigs_id UUID;
  prime_tech_user_id UUID;
  nyla_wigs_user_id UUID;
BEGIN
  -- Get Prime Tech tenant ID
  SELECT id INTO prime_tech_id
  FROM tenants
  WHERE slug = 'prime-tech-electronics-ltd'
  LIMIT 1;
  
  -- Get Nyla Wigs tenant ID
  SELECT id INTO nyla_wigs_id
  FROM tenants
  WHERE slug = 'nyla-wigs'
  LIMIT 1;
  
  -- Get Prime Tech user ID
  SELECT id INTO prime_tech_user_id
  FROM users
  WHERE email = 'samuelmboogo234@gmail.com'
  LIMIT 1;
  
  -- Get a Nyla Wigs user ID (if exists)
  SELECT id INTO nyla_wigs_user_id
  FROM users
  WHERE tenant_id = nyla_wigs_id
  LIMIT 1;
  
  RAISE NOTICE 'Prime Tech Tenant ID: %', prime_tech_id;
  RAISE NOTICE 'Nyla Wigs Tenant ID: %', nyla_wigs_id;
  RAISE NOTICE 'Prime Tech User ID: %', prime_tech_user_id;
  RAISE NOTICE 'Nyla Wigs User ID: %', nyla_wigs_user_id;
  
  -- Test 1: Set session as Prime Tech user
  RAISE NOTICE '=== TEST 1: Prime Tech User Context ===';
  PERFORM set_config('app.current_user_id', prime_tech_user_id::TEXT, true);
  
  -- Verify tenant context
  RAISE NOTICE 'Current tenant ID: %', get_current_tenant_id();
  
  -- Count visible transactions (should be 0 for Prime Tech)
  RAISE NOTICE 'Visible transactions: %', (SELECT COUNT(*) FROM transactions);
  RAISE NOTICE 'Visible debts: %', (SELECT COUNT(*) FROM debts);
  RAISE NOTICE 'Visible customers: %', (SELECT COUNT(*) FROM customers);
  RAISE NOTICE 'Visible products: %', (SELECT COUNT(*) FROM products);
  
  -- Test 2: Set session as Nyla Wigs user (if exists)
  IF nyla_wigs_user_id IS NOT NULL THEN
    RAISE NOTICE '=== TEST 2: Nyla Wigs User Context ===';
    PERFORM set_config('app.current_user_id', nyla_wigs_user_id::TEXT, true);
    
    -- Verify tenant context
    RAISE NOTICE 'Current tenant ID: %', get_current_tenant_id();
    
    -- Count visible transactions (should be > 0 for Nyla Wigs)
    RAISE NOTICE 'Visible transactions: %', (SELECT COUNT(*) FROM transactions);
    RAISE NOTICE 'Visible debts: %', (SELECT COUNT(*) FROM debts);
    RAISE NOTICE 'Visible customers: %', (SELECT COUNT(*) FROM customers);
    RAISE NOTICE 'Visible products: %', (SELECT COUNT(*) FROM products);
  END IF;
  
  -- Test 3: Clear session (no tenant context)
  RAISE NOTICE '=== TEST 3: No User Context ===';
  PERFORM set_config('app.current_user_id', '', true);
  
  -- Verify tenant context (should be NULL)
  RAISE NOTICE 'Current tenant ID: %', get_current_tenant_id();
  
  -- Count visible transactions (should be 0 with RLS)
  RAISE NOTICE 'Visible transactions: %', (SELECT COUNT(*) FROM transactions);
  RAISE NOTICE 'Visible debts: %', (SELECT COUNT(*) FROM debts);
  RAISE NOTICE 'Visible customers: %', (SELECT COUNT(*) FROM customers);
  RAISE NOTICE 'Visible products: %', (SELECT COUNT(*) FROM products);
  
END $;

-- ============================================================
-- EXPECTED RESULTS:
-- Test 1 (Prime Tech user):
--   - Current tenant ID should be Prime Tech's UUID
--   - All counts should be 0 (Prime Tech has no data yet)
--
-- Test 2 (Nyla Wigs user):
--   - Current tenant ID should be Nyla Wigs' UUID
--   - Counts should show existing data (transactions, debts, etc.)
--
-- Test 3 (No user context):
--   - Current tenant ID should be NULL
--   - All counts should be 0 (RLS blocks access without tenant)
--
-- If Test 1 shows data from Nyla Wigs, RLS is NOT working!
-- ============================================================
