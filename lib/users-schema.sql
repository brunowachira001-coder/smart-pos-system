-- User Management Schema
-- Run this in Supabase SQL Editor

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Sales Person',
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert demo users
INSERT INTO public.users (full_name, email, role, phone, is_active, created_at) VALUES
  ('John Smart Traders', 'johnsmarttraders@gmail.com', 'Admin', '+254712345678', true, '2025-10-22'),
  ('Titus M', 'testuser@example.com', 'Sales Person', '+254723456789', true, '2025-10-22'),
  ('Dennis D', 'testuser@gmail.com', 'Sales Person', '+254734567890', true, '2025-10-22')
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users are viewable by authenticated users" 
  ON public.users FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can be created by authenticated users" 
  ON public.users FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Users can be updated by authenticated users" 
  ON public.users FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can be deleted by authenticated users" 
  ON public.users FOR DELETE 
  TO authenticated 
  USING (true);
