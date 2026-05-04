-- ============================================================
-- RLS FIX — ORDERED (run this instead of rls-security-fix.sql)
-- This adds tenant_id columns FIRST, then creates RLS policies.
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS).
-- ============================================================

-- ============================================================
-- STEP 1: Add tenant_id to ALL tables that are missing it
-- (Must happen before RLS policies reference the column)
-- ============================================================

DO $$ BEGIN
  -- transactions
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE transactions SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
  END IF;

  -- transaction_items
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transaction_items' AND table_schema = 'public') THEN
    ALTER TABLE transaction_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE transaction_items SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
  END IF;

  -- cart_items
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cart_items' AND table_schema = 'public') THEN
    ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE cart_items SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
  END IF;

  -- returns
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'returns' AND table_schema = 'public') THEN
    ALTER TABLE returns ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE returns SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
  END IF;

  -- products
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
    ALTER TABLE products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE products SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
  END IF;

  -- customers
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') THEN
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE customers SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
  END IF;

  -- expenses
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expenses' AND table_schema = 'public') THEN
    ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE expenses SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
  END IF;

  -- debts
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'debts' AND table_schema = 'public') THEN
    ALTER TABLE debts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE debts SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
  END IF;

  -- message_queue
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_queue' AND table_schema = 'public') THEN
    ALTER TABLE message_queue ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE message_queue SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
  END IF;

  -- message_templates
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_templates' AND table_schema = 'public') THEN
    ALTER TABLE message_templates ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE message_templates SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
  END IF;

  -- users
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    UPDATE users SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
  END IF;
END $$;

-- ============================================================
-- STEP 2: Add composite indexes for performance
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON transactions(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON transactions(tenant_id, created_at DESC);
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transaction_items' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_transaction_items_tenant ON transaction_items(tenant_id);
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'returns' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_returns_tenant ON returns(tenant_id);
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expenses' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_expenses_tenant_date ON expenses(tenant_id, expense_date DESC);
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'debts' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_debts_tenant_status ON debts(tenant_id, status);
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
  END IF;
END $$;

-- ============================================================
-- STEP 3: Drop all existing RLS policies (clean slate)
-- ============================================================
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- STEP 4: Drop old helper function and create new one
-- ============================================================
DROP FUNCTION IF EXISTS get_tenant_id();
DROP FUNCTION IF EXISTS get_current_tenant_id();

CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
  v_user_id TEXT;
BEGIN
  v_user_id := current_setting('app.current_user_id', true);
  IF v_user_id IS NULL OR v_user_id = '' THEN
    RETURN NULL;
  END IF;
  SELECT tenant_id INTO v_tenant_id
  FROM public.users
  WHERE id = v_user_id::UUID AND is_active = true
  LIMIT 1;
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- STEP 5: Enable RLS on all tables
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') THEN
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transaction_items' AND table_schema = 'public') THEN
    ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cart_items' AND table_schema = 'public') THEN
    ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expenses' AND table_schema = 'public') THEN
    ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'debts' AND table_schema = 'public') THEN
    ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'returns' AND table_schema = 'public') THEN
    ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_queue' AND table_schema = 'public') THEN
    ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_templates' AND table_schema = 'public') THEN
    ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================
-- STEP 6: Create RLS policies (columns now exist)
-- ============================================================

CREATE POLICY "tenants_isolation" ON tenants
  FOR ALL USING (id = get_current_tenant_id());

CREATE POLICY "tenant_users_isolation" ON tenant_users
  FOR ALL USING (tenant_id = get_current_tenant_id());

DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    CREATE POLICY "users_tenant_isolation" ON users FOR ALL USING (tenant_id = get_current_tenant_id());
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
    CREATE POLICY "products_tenant_isolation" ON products FOR ALL USING (tenant_id = get_current_tenant_id());
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') THEN
    CREATE POLICY "customers_tenant_isolation" ON customers FOR ALL USING (tenant_id = get_current_tenant_id());
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
    CREATE POLICY "transactions_tenant_isolation" ON transactions FOR ALL USING (tenant_id = get_current_tenant_id());
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transaction_items' AND table_schema = 'public') THEN
    CREATE POLICY "transaction_items_tenant_isolation" ON transaction_items FOR ALL USING (tenant_id = get_current_tenant_id());
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cart_items' AND table_schema = 'public') THEN
    CREATE POLICY "cart_items_tenant_isolation" ON cart_items FOR ALL USING (tenant_id = get_current_tenant_id());
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expenses' AND table_schema = 'public') THEN
    CREATE POLICY "expenses_tenant_isolation" ON expenses FOR ALL USING (tenant_id = get_current_tenant_id());
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'debts' AND table_schema = 'public') THEN
    CREATE POLICY "debts_tenant_isolation" ON debts FOR ALL USING (tenant_id = get_current_tenant_id());
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'returns' AND table_schema = 'public') THEN
    CREATE POLICY "returns_tenant_isolation" ON returns FOR ALL USING (tenant_id = get_current_tenant_id());
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_queue' AND table_schema = 'public') THEN
    CREATE POLICY "message_queue_tenant_isolation" ON message_queue FOR ALL USING (tenant_id = get_current_tenant_id());
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_templates' AND table_schema = 'public') THEN
    CREATE POLICY "message_templates_tenant_isolation" ON message_templates FOR ALL USING (tenant_id = get_current_tenant_id());
  END IF;
END $$;

-- ============================================================
-- DONE
-- All tenant_id columns added, backfilled, indexed.
-- RLS enabled and policies created on all tables.
-- ============================================================
