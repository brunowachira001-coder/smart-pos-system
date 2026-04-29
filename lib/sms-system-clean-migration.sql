-- ============================================
-- AI-POWERED SMS COMMUNICATION SYSTEM
-- CLEAN MIGRATION (Handles Existing Objects)
-- ============================================

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON sms_config;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON message_templates;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON message_queue;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON ai_message_analytics;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON automation_rules;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON customer_communication_prefs;

-- 1. SMS Configuration Table
CREATE TABLE IF NOT EXISTS sms_config (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(50) DEFAULT 'africastalking',
  api_key TEXT,
  username VARCHAR(100),
  sender_id VARCHAR(20),
  is_active BOOLEAN DEFAULT false,
  test_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Message Templates (AI-Enhanced)
CREATE TABLE IF NOT EXISTS message_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  message_text TEXT NOT NULL,
  ai_personalization BOOLEAN DEFAULT true,
  language VARCHAR(10) DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  success_rate DECIMAL(5,2) DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Message Queue (AI-Managed)
CREATE TABLE IF NOT EXISTS message_queue (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL,
  priority INTEGER DEFAULT 5,
  status VARCHAR(20) DEFAULT 'pending',
  scheduled_for TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  delivery_status VARCHAR(50),
  cost DECIMAL(10,2),
  ai_generated BOOLEAN DEFAULT true,
  ai_confidence DECIMAL(5,2),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. AI Message Analytics
CREATE TABLE IF NOT EXISTS ai_message_analytics (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES message_queue(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  message_type VARCHAR(50),
  sent_at TIMESTAMP,
  customer_responded BOOLEAN DEFAULT false,
  response_time_hours INTEGER,
  resulted_in_sale BOOLEAN DEFAULT false,
  resulted_in_payment BOOLEAN DEFAULT false,
  customer_sentiment VARCHAR(20),
  ai_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Automation Rules (AI-Powered)
CREATE TABLE IF NOT EXISTS automation_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_condition JSONB,
  message_template_id INTEGER REFERENCES message_templates(id) ON DELETE SET NULL,
  ai_enabled BOOLEAN DEFAULT true,
  ai_personalization_level VARCHAR(20) DEFAULT 'high',
  is_active BOOLEAN DEFAULT true,
  success_rate DECIMAL(5,2) DEFAULT 0,
  total_triggered INTEGER DEFAULT 0,
  last_run_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Customer Communication Preferences
CREATE TABLE IF NOT EXISTS customer_communication_prefs (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
  opt_in_sms BOOLEAN DEFAULT true,
  opt_in_promotions BOOLEAN DEFAULT true,
  preferred_language VARCHAR(10) DEFAULT 'en',
  best_contact_time TIME,
  response_rate DECIMAL(5,2) DEFAULT 0,
  last_contacted_at TIMESTAMP,
  total_messages_sent INTEGER DEFAULT 0,
  total_messages_responded INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INSERT DEFAULT MESSAGE TEMPLATES (Only if empty)
-- ============================================

INSERT INTO message_templates (name, category, message_text, ai_personalization, language)
SELECT * FROM (VALUES
  ('Thank You - English', 'thank_you', 'Hi {customer_name}! Thank you for shopping at {shop_name} today. We appreciate your business! 🙏', true, 'en'),
  ('Thank You - Swahili', 'thank_you', 'Habari {customer_name}! Asante kwa kununua leo kwa {shop_name}. Tunashukuru biashara yako! 🙏', true, 'sw'),
  ('Follow-Up - English', 'follow_up', 'Hi {customer_name}! How are you enjoying your {product_name}? We''d love to hear your feedback! - {shop_name}', true, 'en'),
  ('Follow-Up - Swahili', 'follow_up', 'Habari {customer_name}! Unafurahiaje {product_name} yako? Tungependa kusikia maoni yako! - {shop_name}', true, 'sw'),
  ('Debt Reminder Friendly - English', 'debt_reminder', 'Hi {customer_name}, friendly reminder about your KES {amount} balance with {shop_name}. Please pay when convenient. Thank you! 🙏', true, 'en'),
  ('Debt Reminder Friendly - Swahili', 'debt_reminder', 'Habari {customer_name}, ukumbusho wa kirafiki kuhusu salio lako la KES {amount} na {shop_name}. Tafadhali lipa unapopatikana. Asante! 🙏', true, 'sw'),
  ('Debt Reminder Urgent - English', 'debt_reminder', 'Hi {customer_name}, your balance of KES {amount} is now overdue. Please clear it at your earliest convenience. Call {shop_phone} for payment options.', true, 'en'),
  ('Debt Reminder Urgent - Swahili', 'debt_reminder', 'Habari {customer_name}, salio lako la KES {amount} limechelewa. Tafadhali lipe haraka iwezekanavyo. Piga simu {shop_phone} kwa chaguzi za malipo.', true, 'sw'),
  ('Stock Alert - English', 'stock_alert', 'Good news {customer_name}! The {product_name} you asked about is now back in stock at {shop_name}. Visit us today! 🎉', true, 'en'),
  ('Stock Alert - Swahili', 'stock_alert', 'Habari njema {customer_name}! {product_name} uliyouliza iko sasa kwa {shop_name}. Tembelea leo! 🎉', true, 'sw'),
  ('Promotion - English', 'promotion', 'SPECIAL OFFER! Hi {customer_name}, get {discount}% OFF at {shop_name} this week only! Visit us today. 🔥', true, 'en'),
  ('Promotion - Swahili', 'promotion', 'OFA MAALUM! Habari {customer_name}, pata punguzo la {discount}% kwa {shop_name} wiki hii tu! Tembelea leo. 🔥', true, 'sw'),
  ('Re-engagement - English', 're_engagement', 'We miss you {customer_name}! It''s been a while since your last visit to {shop_name}. Come see our new collection! Special discount waiting for you. 😊', true, 'en'),
  ('Re-engagement - Swahili', 're_engagement', 'Tunakukosa {customer_name}! Imekuwa muda tangu ziara yako ya mwisho kwa {shop_name}. Kuja uone mkusanyiko wetu mpya! Punguzo maalum linakungoja. 😊', true, 'sw')
) AS v(name, category, message_text, ai_personalization, language)
WHERE NOT EXISTS (SELECT 1 FROM message_templates LIMIT 1);

-- ============================================
-- INSERT DEFAULT AUTOMATION RULES (Only if empty)
-- ============================================

INSERT INTO automation_rules (name, trigger_type, trigger_condition, message_template_id, ai_enabled, is_active)
SELECT * FROM (VALUES
  ('Thank You After Purchase', 'after_purchase', '{"delay_hours": 1}'::jsonb, 1, true, true),
  ('Follow-Up New Customers', 'after_purchase', '{"delay_days": 3, "first_purchase_only": true}'::jsonb, 3, true, true),
  ('Debt Reminder - Day 3', 'debt_overdue', '{"days_overdue": 3, "min_amount": 100}'::jsonb, 5, true, true),
  ('Debt Reminder - Day 7', 'debt_overdue', '{"days_overdue": 7, "min_amount": 100}'::jsonb, 7, true, true),
  ('Debt Reminder - Day 14', 'debt_overdue', '{"days_overdue": 14, "min_amount": 100}'::jsonb, 7, true, true),
  ('Inactive Customer Re-engagement', 'inactive_customer', '{"days_inactive": 30}'::jsonb, 11, true, false)
) AS v(name, trigger_type, trigger_condition, message_template_id, ai_enabled, is_active)
WHERE NOT EXISTS (SELECT 1 FROM automation_rules LIMIT 1);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_message_queue_status ON message_queue(status);
CREATE INDEX IF NOT EXISTS idx_message_queue_scheduled ON message_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_message_queue_customer ON message_queue(customer_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_prefs_customer ON customer_communication_prefs(customer_id);

-- ============================================
-- CREATE FUNCTION FOR AUTOMATION
-- ============================================

CREATE OR REPLACE FUNCTION should_send_message_to_customer(p_customer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_opt_in BOOLEAN;
  v_last_contacted TIMESTAMP;
BEGIN
  SELECT opt_in_sms, last_contacted_at
  INTO v_opt_in, v_last_contacted
  FROM customer_communication_prefs
  WHERE customer_id = p_customer_id;
  
  IF v_opt_in IS NULL THEN
    RETURN true;
  END IF;
  
  IF v_opt_in = false THEN
    RETURN false;
  END IF;
  
  IF v_last_contacted IS NOT NULL AND v_last_contacted > NOW() - INTERVAL '1 hour' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ENABLE RLS AND CREATE POLICIES
-- ============================================

ALTER TABLE sms_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communication_prefs ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for authenticated users)
CREATE POLICY "Allow all for authenticated users" ON sms_config FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON message_templates FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON message_queue FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON ai_message_analytics FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON automation_rules FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON customer_communication_prefs FOR ALL USING (true);

-- ============================================
-- VERIFICATION QUERY
-- ============================================

SELECT 
  'SMS System Migration Complete!' as status,
  (SELECT COUNT(*) FROM message_templates) as templates_count,
  (SELECT COUNT(*) FROM automation_rules) as automation_rules_count;

-- ============================================
-- COMPLETE! ✅
-- ============================================
