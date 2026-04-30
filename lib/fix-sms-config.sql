-- Fix SMS Configuration

-- 1. Insert SMS config if it doesn't exist
INSERT INTO sms_config (
  provider,
  username,
  sender_id,
  is_active,
  test_mode
)
SELECT 
  'africastalking',
  'NYLAWIGS', -- Your Africa's Talking username
  'NYLAWIGS', -- Your Sender ID
  true,
  false -- Set to false for real SMS, true for testing
WHERE NOT EXISTS (SELECT 1 FROM sms_config LIMIT 1);

-- 2. Update existing config if it exists
UPDATE sms_config
SET 
  provider = 'africastalking',
  username = 'NYLAWIGS',
  sender_id = 'NYLAWIGS',
  is_active = true,
  test_mode = false, -- Change to true for testing without sending real SMS
  updated_at = NOW()
WHERE id IS NOT NULL;

-- 3. Verify configuration
SELECT 
  id,
  provider,
  username,
  sender_id,
  is_active,
  test_mode,
  CASE WHEN api_key IS NOT NULL THEN 'API Key is SET' ELSE 'API Key is MISSING' END as api_key_status
FROM sms_config;

-- NOTE: The API key is stored in environment variables (.env.local)
-- Make sure AFRICASTALKING_API_KEY is set in your .env.local file
