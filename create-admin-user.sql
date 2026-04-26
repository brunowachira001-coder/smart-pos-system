-- Create admin user for login
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xqnteamrznvoqgaazhpu/sql/new

-- Insert admin user with bcrypt hashed password for "admin123"
INSERT INTO public.users (full_name, email, password_hash, role, phone, is_active) 
VALUES (
  'Bruno Wachira',
  'brunowachira001@gmail.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Admin',
  '+254700000000',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  role = 'Admin',
  is_active = true;

-- Verify the user was created
SELECT id, full_name, email, role, is_active, created_at 
FROM public.users 
WHERE email = 'brunowachira001@gmail.com';

-- Success message
SELECT '✅ Admin user created successfully!' as status,
       'Email: brunowachira001@gmail.com' as email,
       'Password: admin123' as password;
