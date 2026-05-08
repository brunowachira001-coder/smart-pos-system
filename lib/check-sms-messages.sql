-- Check recent SMS messages
-- Run this in Supabase SQL Editor

-- Check last 10 messages
SELECT 
  id,
  phone_number,
  message_text,
  status,
  error_message,
  sent_at,
  created_at,
  message_type
FROM message_queue
ORDER BY created_at DESC
LIMIT 10;

-- Check failed messages
SELECT 
  id,
  phone_number,
  LEFT(message_text, 50) as message_preview,
  status,
  error_message,
  created_at
FROM message_queue
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 5;

-- Check sent messages
SELECT 
  id,
  phone_number,
  LEFT(message_text, 50) as message_preview,
  status,
  sent_at,
  created_at
FROM message_queue
WHERE status = 'sent'
ORDER BY created_at DESC
LIMIT 5;
