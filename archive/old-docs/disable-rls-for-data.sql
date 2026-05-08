-- Disable RLS on main tables so data shows up
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/xqnteamrznvoqgaazhpu/sql/new

-- Disable RLS on products
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Disable RLS on customers  
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Disable RLS on transactions
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on transaction_items
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;

-- Disable RLS on shop_settings
ALTER TABLE shop_settings DISABLE ROW LEVEL SECURITY;

-- Verify data exists
SELECT 'Products:' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Customers:', COUNT(*) FROM customers
UNION ALL
SELECT 'Shop Settings:', COUNT(*) FROM shop_settings;

SELECT '✅ RLS disabled - data should show now!' as status;
