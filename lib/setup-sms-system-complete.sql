-- Complete SMS System Setup
-- Run this entire script in Supabase SQL Editor

-- 1. Create message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  template_key VARCHAR(50) UNIQUE NOT NULL,
  message_text TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create SMS queue table
CREATE TABLE IF NOT EXISTS sms_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  message_type VARCHAR(50),
  priority INTEGER DEFAULT 5,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  cost DECIMAL(10, 4),
  provider_message_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create automation rules table
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_condition JSONB DEFAULT '{}'::jsonb,
  message_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  total_triggered INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create customer communication preferences table
CREATE TABLE IF NOT EXISTS customer_communication_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  sms_enabled BOOLEAN DEFAULT true,
  marketing_enabled BOOLEAN DEFAULT true,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  contact_frequency_hours INTEGER DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id)
);

-- 5. Create SMS configuration table
CREATE TABLE IF NOT EXISTS sms_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) DEFAULT 'africastalking',
  api_key_encrypted TEXT,
  username VARCHAR(100),
  sender_id VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  daily_limit INTEGER DEFAULT 1000,
  monthly_budget DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create SMS analytics table
CREATE TABLE IF NOT EXISTS sms_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  message_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, message_type)
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_queue_status ON sms_queue(status);
CREATE INDEX IF NOT EXISTS idx_sms_queue_customer ON sms_queue(customer_id);
CREATE INDEX IF NOT EXISTS idx_sms_queue_created ON sms_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_sms_analytics_date ON sms_analytics(date);

-- 8. Insert default message templates
INSERT INTO message_templates (name, template_key, message_text, variables, category) VALUES
('Thank You After Purchase', 'thank_you_purchase', 
 'Hi {name}! 🎉 Thank you for shopping at Nyla Wigs today! We appreciate your business. Your purchase of KES {amount} has been recorded. Visit us again soon! 😊',
 '["name", "amount"]'::jsonb, 'transactional'),

('Debt Reminder', 'debt_reminder',
 'Hello {name}, this is a friendly reminder that you have an outstanding balance of KES {amount} due on {due_date}. Please visit us to settle. Thank you!',
 '["name", "amount", "due_date"]'::jsonb, 'reminder'),

('Welcome New Customer', 'welcome_customer',
 'Welcome to Nyla Wigs, {name}! 🎊 We''re excited to have you as our customer. Enjoy quality wigs and excellent service. Save our number for updates!',
 '["name"]'::jsonb, 'marketing'),

('Inactive Customer', 'inactive_customer',
 'Hi {name}! We miss you at Nyla Wigs! 😊 It''s been a while since your last visit. Come check out our new collection. Special discount waiting for you!',
 '["name"]'::jsonb, 'marketing')
ON CONFLICT (template_key) DO NOTHING;

-- 9. Insert default automation rules (10 minutes after purchase)
INSERT INTO automation_rules (name, description, trigger_type, trigger_condition, message_template_id, is_active)
SELECT 
  'Thank You After Purchase',
  'Send thank you message 10 minutes after customer makes a purchase',
  'after_purchase',
  '{"minutes_after": 10}'::jsonb,
  (SELECT id FROM message_templates WHERE template_key = 'thank_you_purchase'),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM automation_rules WHERE trigger_type = 'after_purchase'
);

INSERT INTO automation_rules (name, description, trigger_type, trigger_condition, message_template_id, is_active)
SELECT
  'Debt Reminder',
  'Send reminder 3 days after debt due date',
  'debt_overdue',
  '{"days_overdue": 3}'::jsonb,
  (SELECT id FROM message_templates WHERE template_key = 'debt_reminder'),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM automation_rules WHERE trigger_type = 'debt_overdue'
);

INSERT INTO automation_rules (name, description, trigger_type, trigger_condition, message_template_id, is_active)
SELECT
  'Inactive Customer',
  'Send message to customers inactive for 30 days',
  'inactive_customer',
  '{"days_inactive": 30}'::jsonb,
  (SELECT id FROM message_templates WHERE template_key = 'inactive_customer'),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM automation_rules WHERE trigger_type = 'inactive_customer'
);

-- 10. Disable RLS for SMS tables (for system access)
ALTER TABLE message_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE sms_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communication_prefs DISABLE ROW LEVEL SECURITY;
ALTER TABLE sms_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE sms_analytics DISABLE ROW LEVEL SECURITY;

-- 11. Verify setup
SELECT 'Message Templates' as table_name, COUNT(*) as count FROM message_templates
UNION ALL
SELECT 'Automation Rules', COUNT(*) FROM automation_rules
UNION ALL
SELECT 'SMS Queue', COUNT(*) FROM sms_queue
UNION ALL
SELECT 'SMS Config', COUNT(*) FROM sms_config;

-- 12. Show automation rules
SELECT 
  name,
  trigger_type,
  trigger_condition,
  is_active,
  last_run_at
FROM automation_rules
ORDER BY created_at;

-- Setup complete! ✅
