-- Add Message Templates for SMS System
-- Run this in Supabase SQL Editor

-- Insert default message templates
INSERT INTO message_templates (name, template_key, message_text, variables, category, language, is_active, ai_enabled) VALUES

-- Thank You Messages
(
  'Thank You After Purchase',
  'thank_you_purchase',
  'Hi {customer_name}! Thank you for shopping at {shop_name}. We appreciate your business! For any questions, call us at {shop_phone}.',
  '["customer_name", "shop_name", "shop_phone"]'::jsonb,
  'thank_you',
  'en',
  true,
  true
),

(
  'Asante Baada ya Ununuzi',
  'thank_you_purchase_sw',
  'Habari {customer_name}! Asante kwa kununua kwenye {shop_name}. Tunashukuru biashara yako! Kwa maswali, piga simu {shop_phone}.',
  '["customer_name", "shop_name", "shop_phone"]'::jsonb,
  'thank_you',
  'sw',
  true,
  true
),

-- Promotional Messages
(
  'Special Discount Offer',
  'promo_discount',
  'Hi {customer_name}! Special offer at {shop_name}! Get {discount}% OFF on all wigs this week. Visit us today or call {shop_phone}.',
  '["customer_name", "shop_name", "discount", "shop_phone"]'::jsonb,
  'promotional',
  'en',
  true,
  true
),

(
  'Punguzo Maalum',
  'promo_discount_sw',
  'Habari {customer_name}! Ofa maalum kwenye {shop_name}! Pata punguzo la {discount}% kwa wigs zote wiki hii. Tembelea leo au piga {shop_phone}.',
  '["customer_name", "shop_name", "discount", "shop_phone"]'::jsonb,
  'promotional',
  'sw',
  true,
  true
),

-- New Arrival Messages
(
  'New Products Arrived',
  'new_arrival',
  'Hi {customer_name}! New wigs just arrived at {shop_name}! Come check out our latest collection. Call {shop_phone} for details.',
  '["customer_name", "shop_name", "shop_phone"]'::jsonb,
  'promotional',
  'en',
  true,
  true
),

(
  'Bidhaa Mpya Zimefika',
  'new_arrival_sw',
  'Habari {customer_name}! Wigs mpya zimefika {shop_name}! Njoo uone mkusanyiko wetu mpya. Piga simu {shop_phone} kwa maelezo.',
  '["customer_name", "shop_name", "shop_phone"]'::jsonb,
  'promotional',
  'sw',
  true,
  true
),

-- Reminder Messages
(
  'Payment Reminder',
  'payment_reminder',
  'Hi {customer_name}, this is a friendly reminder about your pending payment of KES {amount} at {shop_name}. Please contact us at {shop_phone}.',
  '["customer_name", "amount", "shop_name", "shop_phone"]'::jsonb,
  'reminder',
  'en',
  true,
  false
),

(
  'Ukumbusho wa Malipo',
  'payment_reminder_sw',
  'Habari {customer_name}, huu ni ukumbusho wa malipo yako ya KES {amount} kwenye {shop_name}. Tafadhali wasiliana nasi {shop_phone}.',
  '["customer_name", "amount", "shop_name", "shop_phone"]'::jsonb,
  'reminder',
  'sw',
  true,
  false
),

-- Birthday Messages
(
  'Birthday Wishes',
  'birthday_wish',
  'Happy Birthday {customer_name}! 🎉 Enjoy a special {discount}% discount at {shop_name} this month. Call {shop_phone} to redeem!',
  '["customer_name", "discount", "shop_name", "shop_phone"]'::jsonb,
  'promotional',
  'en',
  true,
  true
),

-- Restock Alert
(
  'Product Back in Stock',
  'restock_alert',
  'Hi {customer_name}! Good news! {product_name} is back in stock at {shop_name}. Get yours before they run out! Call {shop_phone}.',
  '["customer_name", "product_name", "shop_name", "shop_phone"]'::jsonb,
  'promotional',
  'en',
  true,
  true
),

-- Loyalty Messages
(
  'Loyal Customer Appreciation',
  'loyalty_thanks',
  'Hi {customer_name}! You are a valued customer at {shop_name}. Thank you for your continued support! Enjoy {discount}% off your next purchase. Call {shop_phone}.',
  '["customer_name", "shop_name", "discount", "shop_phone"]'::jsonb,
  'thank_you',
  'en',
  true,
  true
),

-- Order Ready Messages
(
  'Order Ready for Pickup',
  'order_ready',
  'Hi {customer_name}! Your order is ready for pickup at {shop_name}. Please collect it at your convenience. Call {shop_phone} for any questions.',
  '["customer_name", "shop_name", "shop_phone"]'::jsonb,
  'notification',
  'en',
  true,
  false
),

-- Welcome Messages
(
  'Welcome New Customer',
  'welcome_new',
  'Welcome to {shop_name}, {customer_name}! We are excited to serve you. Enjoy {discount}% off your first purchase! Call {shop_phone} for assistance.',
  '["customer_name", "shop_name", "discount", "shop_phone"]'::jsonb,
  'welcome',
  'en',
  true,
  true
),

(
  'Karibu Mteja Mpya',
  'welcome_new_sw',
  'Karibu {shop_name}, {customer_name}! Tunafurahi kukuhudumia. Furahia punguzo la {discount}% kwa ununuzi wako wa kwanza! Piga {shop_phone}.',
  '["customer_name", "shop_name", "discount", "shop_phone"]'::jsonb,
  'welcome',
  'sw',
  true,
  true
);

-- Verify templates were added
SELECT 
  'Templates Added' as status,
  COUNT(*) as total,
  COUNT(CASE WHEN language = 'en' THEN 1 END) as english,
  COUNT(CASE WHEN language = 'sw' THEN 1 END) as swahili,
  COUNT(CASE WHEN is_active THEN 1 END) as active
FROM message_templates;

-- Show all templates
SELECT 
  id,
  name,
  category,
  language,
  is_active,
  ai_enabled
FROM message_templates
ORDER BY category, language;
