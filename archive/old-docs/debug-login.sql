-- Debug: Check if user exists and verify password hash
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/xqnteamrznvoqgaazhpu/sql/new

-- Check if user exists
SELECT 
  id,
  full_name,
  email,
  role,
  is_active,
  password_hash,
  created_at
FROM public.users 
WHERE email = 'brunowachira001@gmail.com';

-- If no results, user doesn't exist - run create-admin-user.sql again
-- If you see results, copy the output and send it to me
