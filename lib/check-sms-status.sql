-- Quick SMS System Status Check
-- Run this in Supabase SQL Editor to see current status

-- 1. Check if tables exist
SELECT 'Tables Check' as status;
SELECT 
  'message_queue' as table_name,
  COUNT(*) as total_records
FROM message_queue
UNION ALL
SELECT 
  'message_templates' as table_name,
  COUNT(*) as total_records
FROM message_templates
UNION ALL
SELECT 
  'automation_rules' as table_name,
  COUNT(*) as total_records
FROM automation_rules;

-- 2. Check recent messages (last 10)
SELECT 'Recent Messages' as status;
SELECT 
  mq.created_at,
  c.name as customer_name,
  mq.phone_number,
  LEFT(mq.message_text, 50) as message_preview,
  mq.status,
  mq.error_message,
  mq.cost
FROM message_queue mq
LEFT JOIN customers c ON mq.customer_id = c.id
ORDER BY mq.created_at DESC
LIMIT 10;

-- 3. Check message statistics
SELECT 'Message Statistics' as status;
SELECT 
  status,
  COUNT(*) as count,
  SUM(cost) as total_cost
FROM message_queue
GROUP BY status;

-- 4. Check automation rules
SELECT 'Automation Rules' as status;
SELECT 
  name,
  trigger_type,
  trigger_condition,
  is_active,
  ai_enabled
FROM automation_rules;

-- 5. Check message templates
SELECT 'Message Templates' as status;
SELECT 
  name,
  category,
  language,
  is_active,
  total_sent
FROM message_templates
ORDER BY total_sent DESC;

-- 6. Check customers with phone numbers
SELECT 'Customers with Phones' as status;
SELECT 
  COUNT(*) as total_customers,
  COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END) as with_phone,
  COUNT(CASE WHEN phone IS NULL OR phone = '' THEN 1 END) as without_phone
FROM customers;

-- 7. Check recent sales (for automation trigger)
SELECT 'Recent Sales (Last 24h)' as status;
SELECT 
  t.created_at,
  c.name as customer_name,
  c.phone,
  t.total_amount,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM message_queue mq 
      WHERE mq.customer_id = c.id 
      AND mq.created_at > t.created_at
      AND mq.message_type = 'thank_you'
    ) THEN 'Message Sent'
    ELSE 'No Message'
  END as sms_status
FROM transactions t
LEFT JOIN customers c ON t.customer_id = c.id
WHERE t.created_at > NOW() - INTERVAL '24 hours'
ORDER BY t.created_at DESC
LIMIT 10;

-- 8. Summary
SELECT 'SUMMARY' as status;
SELECT 
  (SELECT COUNT(*) FROM message_queue WHERE status = 'sent') as total_sent,
  (SELECT COUNT(*) FROM message_queue WHERE status = 'failed') as total_failed,
  (SELECT COUNT(*) FROM message_queue WHERE status = 'pending') as total_pending,
  (SELECT SUM(cost) FROM message_queue WHERE status = 'sent') as total_cost,
  (SELECT COUNT(*) FROM customers WHERE phone IS NOT NULL) as customers_with_phone,
  (SELECT COUNT(*) FROM automation_rules WHERE is_active = true) as active_automations;
