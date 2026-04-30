-- Diagnose SMS Issues

-- 1. Check if sms_config exists and has data
SELECT 'SMS Config' as check_name, COUNT(*) as count, 
       MAX(is_active::text) as is_active,
       MAX(test_mode::text) as test_mode
FROM sms_config;

-- 2. Check message_queue for any messages
SELECT 'Message Queue' as check_name, 
       COUNT(*) as total,
       COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
       COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
       COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
FROM message_queue;

-- 3. Check recent messages
SELECT 
  mq.id,
  mq.phone_number,
  mq.message_text,
  mq.status,
  mq.error_message,
  mq.created_at,
  c.name as customer_name
FROM message_queue mq
LEFT JOIN customers c ON mq.customer_id = c.id
ORDER BY mq.created_at DESC
LIMIT 10;

-- 4. Check if Africa's Talking credentials are in sms_config
SELECT 
  id,
  provider,
  username,
  sender_id,
  is_active,
  test_mode,
  CASE WHEN api_key IS NOT NULL THEN 'SET' ELSE 'NOT SET' END as api_key_status
FROM sms_config;
