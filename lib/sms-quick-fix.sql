-- Quick SMS Fix: Update to 10 minutes and ensure data exists
-- Run this in Supabase SQL Editor

-- Step 1: Update existing automation rule to 10 minutes
UPDATE automation_rules
SET trigger_condition = '{"delay_minutes": 10}'::jsonb
WHERE trigger_type = 'after_purchase' 
AND name = 'Thank You After Purchase';

-- Step 2: If no automation rule exists, insert it
INSERT INTO automation_rules (name, trigger_type, trigger_condition, message_template_id, ai_enabled, is_active)
SELECT 
  'Thank You After Purchase',
  'after_purchase',
  '{"delay_minutes": 10}'::jsonb,
  (SELECT id FROM message_templates WHERE category = 'thank_you' AND language = 'en' LIMIT 1),
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM automation_rules WHERE trigger_type = 'after_purchase'
);

-- Step 3: Disable RLS on all SMS tables for system access
ALTER TABLE message_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communication_prefs DISABLE ROW LEVEL SECURITY;
ALTER TABLE sms_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_analytics DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify the setup
SELECT 
  'Automation Rules' as table_name,
  name,
  trigger_type,
  trigger_condition,
  is_active
FROM automation_rules
WHERE trigger_type = 'after_purchase';

-- Step 5: Check message templates
SELECT 
  'Message Templates' as info,
  COUNT(*) as total,
  COUNT(CASE WHEN is_active THEN 1 END) as active
FROM message_templates;

-- Done! ✅
