-- Verify admin user exists in new database
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xqnteamrznvoqgaazhpu/sql/new

SELECT 
  id, 
  full_name, 
  email, 
  role, 
  is_active,
  password_hash IS NOT NULL as has_password,
  created_at
FROM public.users 
WHERE email = 'brunowachira001@gmail.com';

-- If no results, the user doesn't exist yet
-- If you see results, the user exists and login should work
