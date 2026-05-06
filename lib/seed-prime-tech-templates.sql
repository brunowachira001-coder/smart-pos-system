-- ============================================================
-- SEED DEFAULT SMS TEMPLATES FOR PRIME TECH
-- Run this in Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  prime_tech_id UUID;
BEGIN
  SELECT id INTO prime_tech_id
  FROM tenants
  WHERE slug = 'prime-tech-electronics-ltd'
  LIMIT 1;

  IF prime_tech_id IS NULL THEN
    RAISE EXCEPTION 'Prime Tech tenant not found';
  END IF;

  -- Insert default templates scoped to Prime Tech
  INSERT INTO message_templates (name, category, message_text, language, is_active, tenant_id)
  VALUES
    (
      'Thank You - After Purchase',
      'after_purchase',
      'Hi {customer_name}, thank you for shopping at {shop_name}! We appreciate your business. Call us: {shop_phone}',
      'en', true, prime_tech_id
    ),
    (
      'Debt Reminder',
      'debt_reminder',
      'Hi {customer_name}, this is a reminder that you have an outstanding balance of KES {amount} at {shop_name}. Please settle by your due date. Call: {shop_phone}',
      'en', true, prime_tech_id
    ),
    (
      'Debt Overdue',
      'debt_overdue',
      'Hi {customer_name}, your payment of KES {amount} at {shop_name} is overdue. Please contact us urgently at {shop_phone}.',
      'en', true, prime_tech_id
    ),
    (
      'Welcome New Customer',
      'welcome',
      'Welcome to {shop_name}, {customer_name}! We are glad to have you. Visit us again soon. {shop_phone}',
      'en', true, prime_tech_id
    ),
    (
      'Win Back - Inactive Customer',
      'win_back',
      'Hi {customer_name}, we miss you at {shop_name}! Come back and check out our latest products. Call: {shop_phone}',
      'en', true, prime_tech_id
    ),
    (
      'Promotional Offer',
      'promotion',
      'Hi {customer_name}, {shop_name} has a special offer just for you! Visit us today or call {shop_phone} for details.',
      'en', true, prime_tech_id
    )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Templates created for Prime Tech (tenant: %)', prime_tech_id;
END $$;

-- Verify
SELECT name, category, is_active
FROM message_templates
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'prime-tech-electronics-ltd')
ORDER BY category;
