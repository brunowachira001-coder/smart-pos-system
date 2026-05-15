-- Check the actual structure of the tables with RLS issues

-- Check sms_config structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sms_config'
ORDER BY ordinal_position;

-- Check automation_rules structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'automation_rules'
ORDER BY ordinal_position;

-- Check ai_message_analytics structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ai_message_analytics'
ORDER BY ordinal_position;
