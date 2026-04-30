-- Fix cart_items table RLS policies
-- This allows all operations on cart_items without authentication

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all for authenticated users" ON cart_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON cart_items;
DROP POLICY IF EXISTS "Enable insert access for all users" ON cart_items;
DROP POLICY IF EXISTS "Enable update access for all users" ON cart_items;
DROP POLICY IF EXISTS "Enable delete access for all users" ON cart_items;

-- Disable RLS temporarily to allow all operations
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, create permissive policies
-- ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all operations" ON cart_items
-- FOR ALL
-- USING (true)
-- WITH CHECK (true);

-- Verify the table is accessible
SELECT COUNT(*) as cart_items_count FROM cart_items;
