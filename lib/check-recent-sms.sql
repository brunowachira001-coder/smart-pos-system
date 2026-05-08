-- Check the most recent SMS messages sent from the system
-- Run this in Supabase SQL Editor

SELECT 
  id,
  phone_number,
  LEFT(message_text, 60) as message_preview,
  status,
  error_message,
  sent_at,
  created_at,
  message_type
FROM message_queue
ORDER BY created_at DESC
LIMIT 5;
