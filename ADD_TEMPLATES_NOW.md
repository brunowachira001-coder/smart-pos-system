# 📝 Add Message Templates - Quick Fix

## Problem
The "Message Templates" tab is empty because no templates exist in the database.

## Solution
Run the SQL script to add 14 pre-made templates.

---

## 🚀 Step-by-Step Fix

### Step 1: Open Supabase
1. Go to: https://supabase.com/dashboard
2. Select your project: **xqnteamrznvoqgaazhpu**
3. Click **SQL Editor** in the left sidebar

### Step 2: Copy the SQL
Open the file: `lib/add-message-templates.sql`

Or copy this:

```sql
-- Add Message Templates for SMS System

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
```

### Step 3: Run the SQL
1. Paste the SQL into Supabase SQL Editor
2. Click **Run** button
3. You should see: "Success. 14 rows returned"

### Step 4: Verify
Run this to check:

```sql
SELECT 
  name,
  category,
  language,
  is_active
FROM message_templates
ORDER BY category, language;
```

You should see 14 templates!

### Step 5: Refresh Your App
1. Go to Customer Messages page
2. Click "Message Templates" tab
3. You should now see all 14 templates!

---

## 📋 Templates Added

### Thank You (2)
- ✅ Thank You After Purchase (English)
- ✅ Asante Baada ya Ununuzi (Swahili)

### Promotional (6)
- ✅ Special Discount Offer (English)
- ✅ Punguzo Maalum (Swahili)
- ✅ New Products Arrived (English)
- ✅ Bidhaa Mpya Zimefika (Swahili)
- ✅ Birthday Wishes (English)
- ✅ Product Back in Stock (English)

### Reminder (2)
- ✅ Payment Reminder (English)
- ✅ Ukumbusho wa Malipo (Swahili)

### Welcome (2)
- ✅ Welcome New Customer (English)
- ✅ Karibu Mteja Mpya (Swahili)

### Notification (1)
- ✅ Order Ready for Pickup (English)

### Other (1)
- ✅ Loyal Customer Appreciation (English)

---

## 🎯 How to Use Templates

### Placeholders Available:
- `{customer_name}` - Customer's name
- `{shop_name}` - Your shop name (from Shop Settings)
- `{shop_phone}` - Your shop phone (from Shop Settings)
- `{discount}` - Discount percentage (you provide)
- `{amount}` - Amount (for payment reminders)
- `{product_name}` - Product name (for restock alerts)

### Example:
Template: `Hi {customer_name}! Thank you for shopping at {shop_name}.`

Becomes: `Hi John! Thank you for shopping at Nyla Wigs.`

---

## ✅ Done!

After running the SQL, your Message Templates tab will show all 14 templates with:
- Template name
- Category
- Message text
- Active/Inactive status
- Language (EN/SW)
- AI personalization status
- Total sent count

You can now use these templates for automated messages!
