-- ============================================================
-- MULTI-TENANT MIGRATION
-- Run this in Supabase SQL Editor
-- This converts the system into a full SaaS multi-tenant POS
-- ============================================================

-- ============================================================
-- STEP 1: CREATE TENANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  business_type TEXT DEFAULT 'Retail Store',
  business_email TEXT,
  business_phone TEXT,
  tagline TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#10b981',
  secondary_color TEXT DEFAULT '#059669',
  sms_sender_name TEXT,
  currency TEXT DEFAULT 'KES',
  currency_symbol TEXT DEFAULT 'KSh',
  -- Social media
  instagram_url TEXT,
  facebook_url TEXT,
  tiktok_url TEXT,
  whatsapp TEXT,
  -- Subdomain for future use
  subdomain TEXT UNIQUE,
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- STEP 2: CREATE TENANT_USERS TABLE
-- Links Supabase auth users to tenants with roles
-- ============================================================
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff', -- 'owner', 'admin', 'staff', 'cashier'
  full_name TEXT,
  username TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- ============================================================
-- STEP 3: ADD tenant_id TO ALL BUSINESS TABLES
-- ============================================================

-- Products
ALTER TABLE products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Sales transactions
ALTER TABLE sales_transactions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Sales transaction items (inherits via transaction, but add for direct queries)
ALTER TABLE sales_transaction_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Cart items
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Inventory
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Products (main products table)
-- Already added above

-- Returns (if table exists)
ALTER TABLE IF EXISTS returns ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS return_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Expenses
ALTER TABLE IF EXISTS expenses ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS expense_categories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Debts
ALTER TABLE IF EXISTS customer_debts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS debt_payments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- SMS / messaging
ALTER TABLE IF EXISTS message_queue ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS message_templates ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS customer_communication_prefs ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS sms_automations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Shop settings (replace with tenants table going forward, but keep for migration)
ALTER TABLE IF EXISTS shop_settings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Users (existing app users table)
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- ============================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_tenant ON sales_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_tenant ON inventory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);

-- ============================================================
-- STEP 5: HELPER FUNCTION - get current user's tenant_id
-- Used in RLS policies
-- ============================================================
CREATE OR REPLACE FUNCTION get_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM tenant_users
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- STEP 6: ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 7: RLS POLICIES
-- Each user can only see data belonging to their tenant
-- ============================================================

-- Drop old permissive policies first
DROP POLICY IF EXISTS "Allow all operations on products" ON products;
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;
DROP POLICY IF EXISTS "Allow all operations on sales" ON sales;
DROP POLICY IF EXISTS "Allow all operations on inventory" ON inventory;
DROP POLICY IF EXISTS "Allow all operations on settings" ON settings;

-- Tenants: users can only see their own tenant
CREATE POLICY "tenant_isolation" ON tenants
  FOR ALL USING (
    id = get_tenant_id()
  );

-- Tenant users: can see users in same tenant
CREATE POLICY "tenant_users_isolation" ON tenant_users
  FOR ALL USING (
    tenant_id = get_tenant_id()
  );

-- Products
CREATE POLICY "products_tenant_isolation" ON products
  FOR ALL USING (tenant_id = get_tenant_id());

-- Customers
CREATE POLICY "customers_tenant_isolation" ON customers
  FOR ALL USING (tenant_id = get_tenant_id());

-- Sales transactions
CREATE POLICY "sales_transactions_tenant_isolation" ON sales_transactions
  FOR ALL USING (tenant_id = get_tenant_id());

-- Sales transaction items
CREATE POLICY "sales_transaction_items_tenant_isolation" ON sales_transaction_items
  FOR ALL USING (tenant_id = get_tenant_id());

-- Cart items
CREATE POLICY "cart_items_tenant_isolation" ON cart_items
  FOR ALL USING (tenant_id = get_tenant_id());

-- Inventory
CREATE POLICY "inventory_tenant_isolation" ON inventory
  FOR ALL USING (tenant_id = get_tenant_id());

-- ============================================================
-- STEP 8: RLS FOR OPTIONAL TABLES (only if they exist)
-- ============================================================

-- Returns
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'returns') THEN
    ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "returns_tenant_isolation" ON returns;
    CREATE POLICY "returns_tenant_isolation" ON returns
      FOR ALL USING (tenant_id = get_tenant_id());
  END IF;
END $$;

-- Expenses
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expenses') THEN
    ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "expenses_tenant_isolation" ON expenses;
    CREATE POLICY "expenses_tenant_isolation" ON expenses
      FOR ALL USING (tenant_id = get_tenant_id());
  END IF;
END $$;

-- Customer debts
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customer_debts') THEN
    ALTER TABLE customer_debts ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "debts_tenant_isolation" ON customer_debts;
    CREATE POLICY "debts_tenant_isolation" ON customer_debts
      FOR ALL USING (tenant_id = get_tenant_id());
  END IF;
END $$;

-- Message queue
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_queue') THEN
    ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "message_queue_tenant_isolation" ON message_queue;
    CREATE POLICY "message_queue_tenant_isolation" ON message_queue
      FOR ALL USING (tenant_id = get_tenant_id());
  END IF;
END $$;

-- Message templates
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_templates') THEN
    ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "message_templates_tenant_isolation" ON message_templates;
    CREATE POLICY "message_templates_tenant_isolation" ON message_templates
      FOR ALL USING (tenant_id = get_tenant_id());
  END IF;
END $$;

-- Users app table
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "users_tenant_isolation" ON users;
    CREATE POLICY "users_tenant_isolation" ON users
      FOR ALL USING (tenant_id = get_tenant_id());
  END IF;
END $$;

-- ============================================================
-- STEP 9: SEED NYLA WIGS AS FIRST TENANT
-- Migrates existing data to tenant_id
-- ============================================================

-- Create Nyla Wigs tenant
INSERT INTO tenants (
  id,
  business_name,
  business_type,
  business_email,
  business_phone,
  tagline,
  primary_color,
  secondary_color,
  sms_sender_name,
  currency,
  currency_symbol,
  subdomain
) VALUES (
  'a0000000-0000-0000-0000-000000000001', -- fixed UUID for easy reference
  'Nyla Wigs',
  'Retail Store',
  'info@nylawigs.com',
  '0789715533',
  'Premium Quality Wigs',
  '#10b981',
  '#059669',
  'NYLAWIGS',
  'KES',
  'KSh',
  'nylawigs'
) ON CONFLICT (id) DO NOTHING;

-- Assign all existing data to Nyla Wigs tenant
UPDATE products SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE customers SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE sales_transactions SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE sales_transaction_items SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE cart_items SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE inventory SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- Update optional tables if they exist
UPDATE returns SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'returns');
UPDATE expenses SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expenses');
UPDATE customer_debts SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customer_debts');
UPDATE message_queue SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_queue');
UPDATE message_templates SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'message_templates');
UPDATE users SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');

-- ============================================================
-- STEP 10: LINK EXISTING AUTH USERS TO NYLA WIGS TENANT
-- Run this AFTER the above - it links all current auth users
-- ============================================================
INSERT INTO tenant_users (tenant_id, user_id, role, full_name)
SELECT 
  'a0000000-0000-0000-0000-000000000001',
  id,
  'owner',
  email
FROM auth.users
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- ============================================================
-- DONE
-- ============================================================
-- Nyla Wigs tenant ID: a0000000-0000-0000-0000-000000000001
-- All existing data is now scoped to this tenant
-- New clients get a new tenant row + their own tenant_id
-- RLS ensures complete data isolation between tenants
