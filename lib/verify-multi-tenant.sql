-- Run this to verify the multi-tenant migration worked correctly

-- 1. Check tenants table exists and has Nyla Wigs
SELECT id, business_name, subdomain, is_active, created_at 
FROM tenants;

-- 2. Check tenant_users table
SELECT tu.role, tu.full_name, au.email, tu.tenant_id
FROM tenant_users tu
JOIN auth.users au ON tu.user_id = au.id;

-- 3. Check which tables have tenant_id column
SELECT table_name, column_name
FROM information_schema.columns
WHERE column_name = 'tenant_id'
  AND table_schema = 'public'
ORDER BY table_name;

-- 4. Check RLS is enabled on key tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'tenant_users', 'products', 'customers', 'inventory')
ORDER BY tablename;

-- 5. Check get_tenant_id function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'get_tenant_id';
