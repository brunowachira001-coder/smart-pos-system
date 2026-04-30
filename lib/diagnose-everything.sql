-- Complete System Diagnosis
-- Run this in Supabase SQL Editor

-- 1. Check if templates exist
SELECT '=== MESSAGE TEMPLATES ===' as section;
SELECT COUNT(*) as total_templates FROM message_templates;
SELECT id, name, category, language FROM message_templates LIMIT 5;

-- 2. Check if message_queue has any messages
SELECT '=== MESSAGE QUEUE ===' as section;
SELECT COUNT(*) as total_messages FROM message_queue;
SELECT 
  id,
  phone_number,
  LEFT(message_text, 50) as message_preview,
  status,
  error_message,
  created_at
FROM message_queue
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check customers with phone numbers
SELECT '=== CUSTOMERS ===' as section;
SELECT COUNT(*) as total_customers FROM customers;
SELECT COUNT(*) as customers_with_phone FROM customers WHERE phone IS NOT NULL AND phone != '';
SELECT id, name, phone FROM customers WHERE phone IS NOT NULL LIMIT 5;

-- 4. Check RLS policies on message_templates
SELECT '=== RLS STATUS ===' as section;
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('message_templates', 'message_queue', 'customers')
ORDER BY tablename;

-- 5. Check if SUPABASE_SERVICE_KEY is being used (check policies)
SELECT '=== POLICIES ===' as section;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('message_templates', 'message_queue')
ORDER BY tablename, policyname;
