-- Fix Nyla Wigs admin password
-- Sets password_hash to NULL so the fallback 'admin123' works
-- Login: admin@nylawigs.com / admin123

UPDATE users
SET password_hash = NULL
WHERE email = 'admin@nylawigs.com';

-- Verify
SELECT email, role, system_role, tenant_id,
  CASE WHEN password_hash IS NULL THEN 'uses admin123 fallback' ELSE 'has bcrypt hash' END as password_status
FROM users
WHERE email = 'admin@nylawigs.com';
