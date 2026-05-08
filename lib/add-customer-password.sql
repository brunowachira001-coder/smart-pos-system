-- Add password_hash field to customers table for e-commerce authentication
-- Run this in Supabase SQL Editor

-- Add password_hash column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE customers ADD COLUMN password_hash VARCHAR(255);
  END IF;
END $$;

-- Add index for email lookups (for login)
CREATE INDEX IF NOT EXISTS idx_customers_email_lookup ON customers(email) WHERE email IS NOT NULL;

-- Add tenant_id if it doesn't exist (for multi-tenant support)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
  END IF;
END $$;

-- Update existing customers to have tenant_id (if needed)
-- This assumes you have a default tenant or want to assign all to first tenant
-- Uncomment and modify as needed:
-- UPDATE customers SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
