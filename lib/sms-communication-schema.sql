-- AI-Powered SMS Communication System Schema
-- Run this after customers-schema.sql

-- ============================================
-- SMS CONFIGURATION
-- ============================================

CREATE TABLE IF NOT EXISTS sms_config (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(50) DEFAULT 'africastalking',
  api_key TEXT,
  username VARCHAR(100),
  sender_id VARCHAR(20) DEFAULT 'NYLAWIGS',
  is_active BOOLEAN DEFAULT false,
  test_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default config
INSERT INTO sms_config (provider, sender_id, is_active, test_mode)
VALUES ('africastalking', 'NYLAWIGS', false, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- MESSAGE TEMPLATES
-- ============================================

CREATE TABLE IF NOT EXISTS message_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'thank_you', 'follow_up', 'debt_reminder', 'promotion', 'stock_alert', 're_engagement'
  message_text TEXT NOT NULL,
  ai_personalization BOOLEAN DEFAULT true,
  language VARCHAR(10) DEFAULT 'en', -- 'en', 'sw'
  is_active BOOLEAN DEFAULT true,
  success_rate DECIMAL(5,2) DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default templates
INSERT INTO message_templates (name, category, message_text, ai_personalization) VALUES
('Thank You - English', 'thank_you', 'Hi {customer_name}! Thank you for shopping at {shop_name}. We appreciate your business! 🙏', true),
('Thank You - Swahili', 'thank_you', 'Habari {customer_name}! Asante kwa kununua {shop_name}. Tunashukuru biashara yako! 🙏', true),
('Follow Up - English', 'follow_up', 'Hi {customer_name}! How are you enjoying your {product_name}? We''d love to hear your feedback! - {shop_name}', true),
('Debt Reminder Friendly', 'debt_reminder', 'Hi {customer_name}, friendly reminder about your KES {amount} balance with {shop_name}. Pay when convenient. M-PESA: {mpesa_number}. Thank you! 🙏', true),
('Debt Reminder Urgent', 'debt_reminder', 'Hi {customer_name}, your balance of KES {amount} is now overdue. Please clear it soon. M-PESA: {mpesa_number} or visit us. Thank you.', true),
('Promotion', 'promotion', 'SPECIAL OFFER! {customer_name}, get {discount}% off at {shop_name} this week! Visit us today. 🔥', true),
('Stock Alert', 'stock_alert', 'Good news {customer_name}! {product_name} is back in stock at {shop_name}. Visit us today! 🎉', true),
('Re-engagement', 're_engagement', 'We miss you {customer_name}! It''s been a while. Come see our new collection at {shop_name}. Special discount waiting! 😊', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- MESSAGE QUEUE
-- ============================================

CREATE TABLE IF NOT EXISTS message_queue (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL,
  priority INTEGER DEFAULT 5, -- 1-10 (10 = highest)
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sending', 'sent', 'failed', 'cancelled'
  scheduled_for TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  delivery_status VARCHAR(50),
  cost DECIMAL(10,2),
  ai_generated BOOLEAN DEFAULT true,
  ai_confidence DECIMAL(5,2),
  error_message TEXT,
  metadata JSONB, -- Store additional context
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for message queue
CREATE INDEX IF NOT EXISTS idx_message_queue_customer ON message_queue(customer_id);
CREATE INDEX IF NOT EXISTS idx_message_queue_status ON message_queue(status);
CREATE INDEX IF NOT EXISTS idx_message_queue_scheduled ON message_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_message_queue_type ON message_queue(message_type);

-- ============================================
-- MESSAGE HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS message_history (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  message_type VARCHAR(50) NOT NULL,
  message_text TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  cost DECIMAL(10,2),
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  metadata JSONB
);

-- Indexes for message history
CREATE INDEX IF NOT EXISTS idx_message_history_customer ON message_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_message_history_sent ON message_history(sent_at);
CREATE INDEX IF NOT EXISTS idx_message_history_type ON message_history(message_type);

-- ============================================
-- AUTOMATION RULES
-- ============================================

CREATE TABLE IF NOT EXISTS automation_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL, -- 'after_purchase', 'debt_overdue', 'stock_arrival', 'inactive_customer', 'birthday'
  trigger_condition JSONB, -- {days: 3, amount_threshold: 1000, etc}
  message_template_id INTEGER REFERENCES message_templates(id),
  ai_enabled BOOLEAN DEFAULT true,
  ai_personalization_level VARCHAR(20) DEFAULT 'high', -- 'low', 'medium', 'high'
  is_active BOOLEAN DEFAULT true,
  success_rate DECIMAL(5,2) DEFAULT 0,
  total_triggered INTEGER DEFAULT 0,
  last_run_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default automation rules
INSERT INTO automation_rules (name, description, trigger_type, trigger_condition, message_template_id, is_active) VALUES
('Thank You After Purchase', 'Send thank you message 1 hour after purchase', 'after_purchase', '{"delay_hours": 1}', 1, true),
('Follow Up New Customers', 'Follow up 3 days after first purchase', 'after_purchase', '{"delay_days": 3, "first_purchase_only": true}', 3, true),
('Debt Reminder - Day 3', 'Friendly reminder 3 days after debt created', 'debt_overdue', '{"days_overdue": 3, "tone": "friendly"}', 4, true),
('Debt Reminder - Day 7', 'Urgent reminder 7 days after debt created', 'debt_overdue', '{"days_overdue": 7, "tone": "urgent"}', 5, true),
('Inactive Customer - 30 Days', 'Re-engage customers inactive for 30 days', 'inactive_customer', '{"days_inactive": 30}', 8, false)
ON CONFLICT DO NOTHING;

-- ============================================
-- AI ANALYTICS
-- ============================================

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
  sale_amount DECIMAL(10,2),
  payment_amount DECIMAL(10,2),
  customer_sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
  ai_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for AI analytics
CREATE INDEX IF NOT EXISTS idx_ai_analytics_customer ON ai_message_analytics(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_type ON ai_message_analytics(message_type);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_sent ON ai_message_analytics(sent_at);

-- ============================================
-- CUSTOMER COMMUNICATION PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS customer_communication_prefs (
  id SERIAL PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
  opt_in_sms BOOLEAN DEFAULT true,
  opt_in_promotions BOOLEAN DEFAULT true,
  preferred_language VARCHAR(10) DEFAULT 'en',
  best_contact_time TIME, -- AI learns optimal time
  response_rate DECIMAL(5,2) DEFAULT 0,
  last_contacted_at TIMESTAMP,
  total_messages_sent INTEGER DEFAULT 0,
  total_messages_responded INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for customer prefs
CREATE INDEX IF NOT EXISTS idx_customer_prefs_customer ON customer_communication_prefs(customer_id);

-- ============================================
-- SMS STATISTICS (for dashboard)
-- ============================================

CREATE TABLE IF NOT EXISTS sms_statistics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  total_sales_generated DECIMAL(10,2) DEFAULT 0,
  total_debts_collected DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for statistics
CREATE INDEX IF NOT EXISTS idx_sms_stats_date ON sms_statistics(date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update SMS statistics
CREATE OR REPLACE FUNCTION update_sms_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
    INSERT INTO sms_statistics (date, total_sent, total_cost)
    VALUES (CURRENT_DATE, 1, COALESCE(NEW.cost, 0))
    ON CONFLICT (date) DO UPDATE
    SET total_sent = sms_statistics.total_sent + 1,
        total_cost = sms_statistics.total_cost + COALESCE(NEW.cost, 0);
  END IF;
  
  IF NEW.delivery_status = 'delivered' AND (OLD.delivery_status IS NULL OR OLD.delivery_status != 'delivered') THEN
    UPDATE sms_statistics
    SET total_delivered = total_delivered + 1
    WHERE date = CURRENT_DATE;
  END IF;
  
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    UPDATE sms_statistics
    SET total_failed = total_failed + 1
    WHERE date = CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for SMS statistics
DROP TRIGGER IF EXISTS update_sms_stats_trigger ON message_queue;
CREATE TRIGGER update_sms_stats_trigger
  AFTER UPDATE ON message_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_sms_statistics();

-- Function to move sent messages to history
CREATE OR REPLACE FUNCTION archive_sent_messages()
RETURNS void AS $$
BEGIN
  INSERT INTO message_history (customer_id, phone_number, message_type, message_text, status, cost, sent_at, delivered_at, metadata)
  SELECT customer_id, phone_number, message_type, message_text, status, cost, sent_at, delivered_at, metadata
  FROM message_queue
  WHERE status IN ('sent', 'failed')
  AND sent_at < NOW() - INTERVAL '7 days';
  
  DELETE FROM message_queue
  WHERE status IN ('sent', 'failed')
  AND sent_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR EASY QUERYING
-- ============================================

-- View for pending messages
CREATE OR REPLACE VIEW pending_messages AS
SELECT 
  mq.id,
  mq.customer_id,
  c.name as customer_name,
  mq.phone_number,
  mq.message_text,
  mq.message_type,
  mq.priority,
  mq.scheduled_for,
  mq.ai_confidence
FROM message_queue mq
LEFT JOIN customers c ON mq.customer_id = c.id
WHERE mq.status = 'pending'
AND mq.scheduled_for <= NOW()
ORDER BY mq.priority DESC, mq.scheduled_for ASC;

-- View for today's SMS activity
CREATE OR REPLACE VIEW todays_sms_activity AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'sent') as sent_today,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_today,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_today,
  SUM(cost) FILTER (WHERE status = 'sent') as cost_today,
  COUNT(DISTINCT customer_id) as customers_contacted_today
FROM message_queue
WHERE DATE(created_at) = CURRENT_DATE;

-- View for customer SMS history
CREATE OR REPLACE VIEW customer_sms_summary AS
SELECT 
  c.id as customer_id,
  c.name as customer_name,
  c.phone,
  COUNT(mh.id) as total_messages_sent,
  MAX(mh.sent_at) as last_message_sent,
  SUM(mh.cost) as total_sms_cost,
  COUNT(*) FILTER (WHERE mh.status = 'sent') as successful_messages
FROM customers c
LEFT JOIN message_history mh ON c.id = mh.customer_id
GROUP BY c.id, c.name, c.phone;

-- ============================================
-- GRANT PERMISSIONS (if using RLS)
-- ============================================

-- Enable RLS on tables
ALTER TABLE sms_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communication_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_statistics ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for authenticated users)
CREATE POLICY "Allow all for authenticated users" ON sms_config FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON message_templates FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON message_queue FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON message_history FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON automation_rules FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON ai_message_analytics FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON customer_communication_prefs FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sms_statistics FOR ALL USING (true);

-- ============================================
-- COMPLETE!
-- ============================================

-- Verify installation
SELECT 'SMS Communication System installed successfully!' as status;
SELECT 'Total templates: ' || COUNT(*) as templates FROM message_templates;
SELECT 'Total automation rules: ' || COUNT(*) as rules FROM automation_rules;
