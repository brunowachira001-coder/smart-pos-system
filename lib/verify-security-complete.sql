-- ============================================================
-- SECURITY VERIFICATION QUERIES
-- Run each block separately to verify the migration worked
-- ============================================================

-- 1. Verify tenant_id column exists on all key tables
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE column_name = 'tenant_id'
  AND table_schema = 'public'
ORDER BY table_name;

-- 2. Verify RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'tenants', 'tenant_users', 'users', 'products', 'customers',
    'transactions', 'transaction_items', 'cart_items',
    'expenses', 'debts', 'returns', 'message_queue', 'message_templates'
  )
ORDER BY tablename;

-- 3. Verify RLS policies exist (no USING true)
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. Verify get_current_tenant_id function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'get_current_tenant_id';

-- 5. Verify all existing data has tenant_id set
SELECT 'products' as tbl, COUNT(*) as total, COUNT(tenant_id) as with_tenant FROM products
UNION ALL
SELECT 'customers', COUNT(*), COUNT(tenant_id) FROM customers
UNION ALL
SELECT 'transactions', COUNT(*), COUNT(tenant_id) FROM transactions
UNION ALL
SELECT 'debts', COUNT(*), COUNT(tenant_id) FROM debts;

-- 6. Verify composite indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%tenant%'
ORDER BY tablename;
