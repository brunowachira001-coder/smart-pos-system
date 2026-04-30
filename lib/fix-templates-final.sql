-- Step 1: Delete ALL existing templates (clean slate)
DELETE FROM message_templates;

-- Step 2: Add fresh templates
INSERT INTO message_templates (name, message_text, category, language, is_active, ai_personalization)
VALUES
  ('Thank You After Purchase', 'Hi {customer_name}! Thank you for shopping at {shop_name}. We appreciate your business! For any questions, call us at {shop_phone}.', 'thank_you', 'en', true, true),
  ('Asante Baada ya Ununuzi', 'Habari {customer_name}! Asante kwa kununua kwenye {shop_name}. Tunashukuru biashara yako! Kwa maswali, piga simu {shop_phone}.', 'thank_you', 'sw', true, true),
  ('Special Discount Offer', 'Hi {customer_name}! Special offer at {shop_name}! Get {discount}% OFF on all wigs this week. Visit us today or call {shop_phone}.', 'promotional', 'en', true, true),
  ('Punguzo Maalum', 'Habari {customer_name}! Ofa maalum kwenye {shop_name}! Pata punguzo la {discount}% kwa wigs zote wiki hii. Tembelea leo au piga {shop_phone}.', 'promotional', 'sw', true, true),
  ('New Products Arrived', 'Hi {customer_name}! New wigs just arrived at {shop_name}! Come check out our latest collection. Call {shop_phone} for details.', 'promotional', 'en', true, true),
  ('Bidhaa Mpya Zimefika', 'Habari {customer_name}! Wigs mpya zimefika {shop_name}! Njoo uone mkusanyiko wetu mpya. Piga simu {shop_phone} kwa maelezo.', 'promotional', 'sw', true, true),
  ('Payment Reminder', 'Hi {customer_name}, this is a friendly reminder about your pending payment of KES {amount} at {shop_name}. Please contact us at {shop_phone}.', 'reminder', 'en', true, false),
  ('Ukumbusho wa Malipo', 'Habari {customer_name}, huu ni ukumbusho wa malipo yako ya KES {amount} kwenye {shop_name}. Tafadhali wasiliana nasi {shop_phone}.', 'reminder', 'sw', true, false),
  ('Birthday Wishes', 'Happy Birthday {customer_name}! 🎉 Enjoy a special {discount}% discount at {shop_name} this month. Call {shop_phone} to redeem!', 'promotional', 'en', true, true),
  ('Product Back in Stock', 'Hi {customer_name}! Good news! {product_name} is back in stock at {shop_name}. Get yours before they run out! Call {shop_phone}.', 'promotional', 'en', true, true),
  ('Loyal Customer Appreciation', 'Hi {customer_name}! You are a valued customer at {shop_name}. Thank you for your continued support! Enjoy {discount}% off your next purchase. Call {shop_phone}.', 'thank_you', 'en', true, true),
  ('Order Ready for Pickup', 'Hi {customer_name}! Your order is ready for pickup at {shop_name}. Please collect it at your convenience. Call {shop_phone} for any questions.', 'notification', 'en', true, false),
  ('Welcome New Customer', 'Welcome to {shop_name}, {customer_name}! We are excited to serve you. Enjoy {discount}% off your first purchase! Call {shop_phone} for assistance.', 'welcome', 'en', true, true),
  ('Karibu Mteja Mpya', 'Karibu {shop_name}, {customer_name}! Tunafurahi kukuhudumia. Furahia punguzo la {discount}% kwa ununuzi wako wa kwanza! Piga {shop_phone}.', 'welcome', 'sw', true, true);

-- Step 3: Verify templates were added
SELECT 
  '✅ Templates Fixed!' as status,
  COUNT(*) as total,
  COUNT(CASE WHEN is_active THEN 1 END) as active
FROM message_templates;

-- Step 4: Show all templates
SELECT 
  id,
  name,
  category,
  language,
  LEFT(message_text, 60) as message_preview,
  is_active
FROM message_templates
ORDER BY category, language;
