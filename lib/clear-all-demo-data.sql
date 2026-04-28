-- ============================================
-- CLEAR ALL DEMO/TEST DATA FROM DATABASE
-- ============================================
-- This script removes all handcoded/demo data
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Clear all transactions and related data
DELETE FROM public.transaction_items;
DELETE FROM public.transactions;
DELETE FROM public.cart_items;

-- 2. Clear all returns
DELETE FROM public.returns;

-- 3. Clear all expenses
DELETE FROM public.expenses;

-- 4. Clear all debts
DELETE FROM public.debts;

-- 5. Clear all customers (except if you want to keep real ones)
DELETE FROM public.customers;

-- 6. Clear all products
DELETE FROM public.products;

-- 7. Clear shop settings (will need to be reconfigured)
DELETE FROM public.shop_settings;

-- 8. Keep only the admin user, delete all other users
-- Replace 'brunowachira001@gmail.com' with your actual admin email
DELETE FROM public.users 
WHERE email != 'brunowachira001@gmail.com';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify data is cleared:

SELECT 'transactions' as table_name, COUNT(*) as count FROM public.transactions
UNION ALL
SELECT 'transaction_items', COUNT(*) FROM public.transaction_items
UNION ALL
SELECT 'cart_items', COUNT(*) FROM public.cart_items
UNION ALL
SELECT 'returns', COUNT(*) FROM public.returns
UNION ALL
SELECT 'expenses', COUNT(*) FROM public.expenses
UNION ALL
SELECT 'debts', COUNT(*) FROM public.debts
UNION ALL
SELECT 'customers', COUNT(*) FROM public.customers
UNION ALL
SELECT 'products', COUNT(*) FROM public.products
UNION ALL
SELECT 'shop_settings', COUNT(*) FROM public.shop_settings
UNION ALL
SELECT 'users', COUNT(*) FROM public.users;
