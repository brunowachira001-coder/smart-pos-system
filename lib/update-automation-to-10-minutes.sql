-- Update Automation Rule: Change from 1 hour to 10 minutes after purchase

-- Update the "after_purchase" automation rule
UPDATE automation_rules
SET 
  trigger_condition = jsonb_set(
    trigger_condition,
    '{minutes_after}',
    '10'::jsonb
  ),
  -- Remove old hours_after field if it exists
  trigger_condition = trigger_condition - 'hours_after'
WHERE trigger_type = 'after_purchase';

-- Verify the update
SELECT 
  id,
  name,
  trigger_type,
  trigger_condition,
  is_active,
  last_run_at
FROM automation_rules
WHERE trigger_type = 'after_purchase';
