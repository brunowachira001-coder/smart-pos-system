-- ============================================================
-- CLEAN PRIME TECH DATA
-- Removes any data that was incorrectly showing up for Prime Tech.
-- Prime Tech is a new tenant and should start with ZERO data.
--
-- Run this in Supabase SQL Editor.
-- ============================================================

-- First, confirm the Prime Tech tenant ID
SELECT id, business_name, slug FROM tenants WHERE slug = 'prime-tech-electronics-ltd';

-- ============================================================
-- SAFE DELETE: Remove all data scoped to Prime Tech tenant
-- This ensures Prime Tech starts completely fresh.
-- Nyla Wigs data is untouched (different tenant_id).
-- ============================================================

DO $$
DECLARE
  prime_tech_id UUID;
BEGIN
  SELECT id INTO prime_tech_id
  FROM tenants
  WHERE slug = 'prime-tech-electronics-ltd'
  LIMIT 1;

  IF prime_tech_id IS NULL THEN
    RAISE EXCEPTION 'Prime Tech tenant not found — aborting';
  END IF;

  RAISE NOTICE 'Cleaning data for Prime Tech tenant: %', prime_tech_id;

  -- Delete transaction items first (foreign key dependency)
  DELETE FROM transaction_items WHERE tenant_id = prime_tech_id;
  RAISE NOTICE 'Deleted transaction_items';

  -- Delete transactions
  DELETE FROM transactions WHERE tenant_id = prime_tech_id;
  RAISE NOTICE 'Deleted transactions';

  -- Delete debts
  DELETE FROM debts WHERE tenant_id = prime_tech_id;
  RAISE NOTICE 'Deleted debts';

  -- Delete cart items
  DELETE FROM cart_items WHERE tenant_id = prime_tech_id;
  RAISE NOTICE 'Deleted cart_items';

  -- Delete returns
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='returns') THEN
    DELETE FROM returns WHERE tenant_id = prime_tech_id;
    RAISE NOTICE 'Deleted returns';
  END IF;

  -- Delete expenses
  DELETE FROM expenses WHERE tenant_id = prime_tech_id;
  RAISE NOTICE 'Deleted expenses';

  -- Delete customers
  DELETE FROM customers WHERE tenant_id = prime_tech_id;
  RAISE NOTICE 'Deleted customers';

  -- Delete products
  DELETE FROM products WHERE tenant_id = prime_tech_id;
  RAISE NOTICE 'Deleted products';

  RAISE NOTICE '✅ Prime Tech data cleaned. Tenant starts fresh.';
END $$;

-- ============================================================
-- VERIFY: Prime Tech should now have 0 records everywhere
-- ============================================================
SELECT
  'transactions' AS table_name,
  COUNT(*) AS count
FROM transactions
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'prime-tech-electronics-ltd')

UNION ALL

SELECT 'debts', COUNT(*)
FROM debts
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'prime-tech-electronics-ltd')

UNION ALL

SELECT 'customers', COUNT(*)
FROM customers
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'prime-tech-electronics-ltd')

UNION ALL

SELECT 'products', COUNT(*)
FROM products
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'prime-tech-electronics-ltd')

UNION ALL

SELECT 'expenses', COUNT(*)
FROM expenses
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'prime-tech-electronics-ltd');

-- All counts should be 0
