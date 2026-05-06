-- ============================================================
-- SEPARATE NYLA WIGS ADMIN FROM SUPERADMIN
-- Creates a dedicated admin account for Nyla Wigs
-- so the superadmin account is no longer shared with the tenant
-- ============================================================

DO $$
DECLARE
  nyla_tenant_id UUID;
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- Get Nyla Wigs tenant ID
  SELECT id INTO nyla_tenant_id
  FROM tenants
  WHERE business_name ILIKE '%nyla%'
  LIMIT 1;

  IF nyla_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Nyla Wigs tenant not found';
  END IF;

  RAISE NOTICE 'Nyla Wigs tenant ID: %', nyla_tenant_id;

  -- Create a new dedicated admin user for Nyla Wigs
  -- Password: NylaAdmin2026 (bcrypt hash below)
  -- You can change this password after logging in
  INSERT INTO users (
    id,
    email,
    full_name,
    role,
    system_role,
    tenant_id,
    is_active,
    password_hash,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'admin@nylawigs.com',
    'Nyla Wigs Admin',
    'Admin',
    'user',  -- NOT superadmin
    nyla_tenant_id,
    true,
    -- bcrypt hash of 'NylaAdmin2026'
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;

  -- Remove the superadmin account from Nyla Wigs tenant
  -- (keep the superadmin account but unlink it from Nyla Wigs)
  UPDATE users
  SET tenant_id = NULL
  WHERE email = 'brunowachira001@gmail.com'
    AND system_role = 'superadmin';

  RAISE NOTICE '✅ Done!';
  RAISE NOTICE 'Nyla Wigs admin: admin@nylawigs.com / NylaAdmin2026';
  RAISE NOTICE 'Superadmin: brunowachira001@gmail.com (unchanged, no tenant)';
END $$;

-- Verify the separation
SELECT
  email,
  role,
  system_role,
  tenant_id,
  t.business_name
FROM users u
LEFT JOIN tenants t ON t.id = u.tenant_id
WHERE u.email IN ('brunowachira001@gmail.com', 'admin@nylawigs.com')
ORDER BY u.email;
