-- Admin provisioning schema additions
-- Run in Supabase SQL editor

-- Add slug to tenants (unique identifier used for routing)
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS slug VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS theme_color VARCHAR(20) DEFAULT '#10b981';

-- Backfill slug from existing subdomain or business_name
UPDATE tenants
SET slug = COALESCE(
  subdomain,
  LOWER(REGEXP_REPLACE(business_name, '[^a-z0-9]', '', 'g'))
)
WHERE slug IS NULL;

-- Add is_first_login to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;

-- Existing users have already logged in — mark them done
UPDATE users SET is_first_login = false;

-- Add system_role to identify platform admins (separate from tenant admins)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS system_role VARCHAR(20) DEFAULT 'user';
-- Values: 'superadmin', 'user'

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
