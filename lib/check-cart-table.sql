-- Check if cart_items table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'cart_items'
ORDER BY ordinal_position;

-- Check RLS policies on cart_items
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'cart_items';

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'cart_items';

-- Try to select from cart_items
SELECT * FROM cart_items LIMIT 5;
