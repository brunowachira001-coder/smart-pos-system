-- Complete RLS fix - disable ALL policies and RLS on ALL tables
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/xqnteamrznvoqgaazhpu/sql/new

-- Drop ALL existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Disable RLS on ALL tables
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transaction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shop_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS debts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS returns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses DISABLE ROW LEVEL SECURITY;

-- Grant full access to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verify products exist
SELECT 'Products in database:' as info, COUNT(*) as count FROM products;
SELECT 'Customers in database:' as info, COUNT(*) as count FROM customers;

SELECT '✅ All RLS disabled and permissions granted!' as status;
