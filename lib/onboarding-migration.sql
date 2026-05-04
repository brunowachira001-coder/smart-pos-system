-- Onboarding progress tracking
-- Run this in Supabase SQL editor

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;

-- 1 = business details
-- 2 = POS config (tax + payments)
-- 3 = first product (optional)
-- 4 = staff setup (optional)
-- 5 = complete

COMMENT ON COLUMN tenants.onboarding_step IS
  '1=business, 2=pos_config, 3=products, 4=staff, 5=complete';
