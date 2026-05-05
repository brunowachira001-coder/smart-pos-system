-- ============================================================
-- VERIFY TENANT ISOLATION
-- Run this in Supabase SQL Editor to verify RLS is working
-- ============================================================

-- Step 1: Check all tenants
SELECT 
  id,
  business_name,
  slug,
  created_at,
  is_active
FROM tenants
ORDER BY created_at;

-- Step 2: Check which tenant owns existing data
SELECT 
  'transactions' as table_name,
  t.business_name,
  t.slug,
  COUNT(tr.id) as record_count,
  SUM(tr.total_amount::numeric) as total_amount
FROM tenants t
LEFT JOIN transactions tr ON tr.tenant_id = t.id
GROUP BY t.id, t.business_name, t.slug

UNION ALL

SELECT 
  'debts' as table_name,
  t.business_name,
  t.slug,
  COUNT(d.id) as record_count,
  SUM(d.amount::numeric) as total_amount
FROM tenants t
LEFT JOIN debts d ON d.tenant_id = t.id
GROUP BY t.id, t.business_name, t.slug

UNION ALL

SELECT 
  'customers' as table_name,
  t.business_name,
  t.slug,
  COUNT(c.id) as record_count,
  NULL as total_amount
FROM tenants t
LEFT JOIN customers c ON c.tenant_id = t.id
GROUP BY t.id, t.business_name, t.slug

UNION ALL

SELECT 
  'products' as table_name,
  t.business_name,
  t.slug,
  COUNT(p.id) as record_count,
  NULL as total_amount
FROM tenants t
LEFT JOIN products p ON p.tenant_id = t.id
GROUP BY t.id, t.business_name, t.slug

UNION ALL

SELECT 
  'expenses' as table_name,
  t.business_name,
  t.slug,
  COUNT(e.id) as record_count,
  SUM(e.amount::numeric) as total_amount
FROM tenants t
LEFT JOIN expenses e ON e.tenant_id = t.id
GROUP BY t.id, t.business_name, t.slug

ORDER BY table_name, business_name;

-- Step 3: Check for records with NULL tenant_id (CRITICAL ISSUE)
SELECT 
  'transactions' as table_name,
  COUNT(*) as null_tenant_count
FROM transactions
WHERE tenant_id IS NULL

UNION ALL

SELECT 
  'debts' as table_name,
  COUNT(*) as null_tenant_count
FROM debts
WHERE tenant_id IS NULL

UNION ALL

SELECT 
  'customers' as table_name,
  COUNT(*) as null_tenant_count
FROM customers
WHERE tenant_id IS NULL

UNION ALL

SELECT 
  'products' as table_name,
  COUNT(*) as null_tenant_count
FROM products
WHERE tenant_id IS NULL

UNION ALL

SELECT 
  'expenses' as table_name,
  COUNT(*) as null_tenant_count
FROM expenses
WHERE tenant_id IS NULL;

-- Step 4: Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'tenants', 'tenant_users', 'users', 'products', 'customers',
    'transactions', 'transaction_items', 'cart_items', 'expenses',
    'debts', 'returns', 'message_queue', 'message_templates'
  )
ORDER BY tablename;

-- Step 5: List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Step 6: Check if get_current_tenant_id() function exists
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'get_current_tenant_id';

-- Step 7: Test the function (should return NULL when not set)
SELECT get_current_tenant_id() as current_tenant_id;

-- Step 8: Check user-tenant mappings
SELECT 
  u.id,
  u.email,
  u.role,
  u.system_role,
  u.tenant_id,
  t.business_name,
  t.slug,
  u.is_active
FROM users u
LEFT JOIN tenants t ON t.id = u.tenant_id
ORDER BY u.email;

-- Step 9: Verify Prime Tech user mapping
SELECT 
  u.id,
  u.email,
  u.tenant_id,
  t.business_name,
  t.slug
FROM users u
LEFT JOIN tenants t ON t.id = u.tenant_id
WHERE u.email = 'samuelmboogo234@gmail.com';

-- ============================================================
-- EXPECTED RESULTS:
-- - Prime Tech should have 0 transactions, 0 debts, 0 customers
-- - Nyla Wigs should have all the existing data
-- - No records should have NULL tenant_id
-- - RLS should be enabled on all tables
-- - get_current_tenant_id() function should exist
-- - User samuelmboogo234@gmail.com should be mapped to Prime Tech
-- ============================================================
