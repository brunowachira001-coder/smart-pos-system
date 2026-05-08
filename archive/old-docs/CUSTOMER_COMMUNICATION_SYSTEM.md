# 📱 Customer Communication & Sales Tool

## Overview
Automated customer engagement system to increase sales, reduce debt, and improve customer retention through SMS/WhatsApp messaging.

---

## 🎯 Features

### 1. **Customer Follow-Up Automation**
- Automatic "Thank You" message after purchase
- Follow-up 3 days after first purchase
- Re-engagement for inactive customers (30+ days)
- Birthday/special occasion messages

### 2. **Debt Reminders**
- Automatic reminders for unpaid debts
- Escalating reminder schedule (3 days, 7 days, 14 days)
- Friendly tone with payment link
- Stop reminders when paid

### 3. **Promotions & Marketing**
- Bulk SMS for promotions
- Targeted campaigns (VIP customers, high spenders)
- New product announcements
- Special offers and discounts

### 4. **Stock Alerts**
- Notify customers when requested items are back in stock
- Alert VIP customers about new arrivals
- Low stock urgency messages

### 5. **Message Templates**
- Pre-written professional messages
- Customizable with customer name, amount, etc.
- Multi-language support (English, Swahili)

---

## 🔧 Technical Implementation

### Option 1: Africa's Talking (Recommended for Kenya)
**Best for:** Kenyan businesses, affordable, reliable

**Pricing:**
- SMS: KES 0.80 per message
- No monthly fees
- Pay as you go

**Setup:**
1. Sign up at https://africastalking.com
2. Get API key and username
3. Add to system settings
4. Start sending!

### Option 2: Twilio (International)
**Best for:** Multi-country support, WhatsApp integration

**Pricing:**
- SMS: ~KES 10 per message
- WhatsApp: ~KES 5 per message
- Monthly fees may apply

### Option 3: WhatsApp Business API
**Best for:** Rich media, customer conversations

**Pricing:**
- Free for first 1,000 conversations/month
- Then ~KES 5-10 per conversation

---

## 📊 Database Schema

### New Tables:

#### 1. `message_templates`
```sql
CREATE TABLE message_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'follow_up', 'debt_reminder', 'promotion', 'stock_alert', 'thank_you'
  message_text TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en', -- 'en', 'sw'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `message_queue`
```sql
CREATE TABLE message_queue (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
  scheduled_for TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  delivery_status VARCHAR(50),
  cost DECIMAL(10,2),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `message_campaigns`
```sql
CREATE TABLE message_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  message_template_id INTEGER REFERENCES message_templates(id),
  target_audience VARCHAR(50), -- 'all', 'vip', 'debtors', 'inactive', 'custom'
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'completed'
  scheduled_for TIMESTAMP,
  total_recipients INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. `automation_rules`
```sql
CREATE TABLE automation_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL, -- 'after_purchase', 'debt_overdue', 'stock_arrival', 'inactive_customer'
  trigger_condition JSONB, -- {days: 3, amount_threshold: 1000, etc}
  message_template_id INTEGER REFERENCES message_templates(id),
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. `customer_preferences`
```sql
CREATE TABLE customer_preferences (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) UNIQUE,
  opt_in_sms BOOLEAN DEFAULT true,
  opt_in_whatsapp BOOLEAN DEFAULT true,
  opt_in_promotions BOOLEAN DEFAULT true,
  preferred_language VARCHAR(10) DEFAULT 'en',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 User Interface

### New Page: `/messages` (Customer Communications)

**Sections:**

1. **Quick Send**
   - Select customer(s)
   - Choose template or write custom message
   - Preview and send

2. **Campaigns**
   - Create new campaign
   - View active/past campaigns
   - Campaign analytics

3. **Automation Rules**
   - Enable/disable rules
   - Configure triggers
   - View automation history

4. **Message Templates**
   - Create/edit templates
   - Preview with sample data
   - Organize by category

5. **Message History**
   - View all sent messages
   - Filter by customer, date, type
   - Delivery status tracking

6. **Analytics Dashboard**
   - Messages sent today/week/month
   - Delivery rates
   - Cost tracking
   - Response rates

---

## 📝 Pre-Built Message Templates

### Thank You Messages
```
Hi {customer_name}! Thank you for shopping at {shop_name}. We appreciate your business! 🙏
```

### Follow-Up (3 Days After Purchase)
```
Hi {customer_name}! How are you enjoying your {product_name}? We'd love to hear your feedback! Reply or call us at {shop_phone}.
```

### Debt Reminder (Friendly - Day 3)
```
Hi {customer_name}, this is a friendly reminder that you have a balance of KES {amount} with {shop_name}. Please pay when convenient. Thank you!
```

### Debt Reminder (Urgent - Day 14)
```
Hi {customer_name}, your balance of KES {amount} is now overdue. Please clear it at your earliest convenience. Call {shop_phone} for payment options.
```

### New Stock Alert
```
Good news {customer_name}! The {product_name} you asked about is now back in stock at {shop_name}. Visit us today! 🎉
```

### Promotion
```
SPECIAL OFFER! {customer_name}, get {discount}% off on {product_category} at {shop_name} this week only! Visit us today. 🔥
```

### Inactive Customer Re-engagement
```
We miss you {customer_name}! It's been a while since your last visit to {shop_name}. Come see our new collection! Special discount waiting for you. 😊
```

---

## 🤖 Automation Rules (Pre-Configured)

### 1. **Thank You After Purchase**
- **Trigger:** Sale completed
- **Delay:** 1 hour
- **Message:** Thank you template
- **Status:** Active by default

### 2. **Follow-Up New Customers**
- **Trigger:** First purchase
- **Delay:** 3 days
- **Message:** Follow-up template
- **Status:** Active by default

### 3. **Debt Reminder - First**
- **Trigger:** Debt unpaid
- **Delay:** 3 days after due date
- **Message:** Friendly reminder
- **Status:** Active by default

### 4. **Debt Reminder - Second**
- **Trigger:** Debt still unpaid
- **Delay:** 7 days after due date
- **Message:** Urgent reminder
- **Status:** Active by default

### 5. **Inactive Customer**
- **Trigger:** No purchase
- **Delay:** 30 days since last purchase
- **Message:** Re-engagement offer
- **Status:** Optional (can enable)

---

## 💰 Cost Estimation

### Using Africa's Talking (KES 0.80/SMS)

**Monthly Costs for Different Business Sizes:**

**Small Business (50 customers, 200 messages/month):**
- Thank you messages: 50 × KES 0.80 = KES 40
- Follow-ups: 20 × KES 0.80 = KES 16
- Debt reminders: 30 × KES 0.80 = KES 24
- Promotions: 100 × KES 0.80 = KES 80
- **Total: ~KES 160/month**

**Medium Business (200 customers, 800 messages/month):**
- **Total: ~KES 640/month**

**Large Business (500 customers, 2000 messages/month):**
- **Total: ~KES 1,600/month**

**ROI:** If just 5% of messages result in a sale, you'll recover costs easily!

---

## 🚀 Implementation Steps

### Phase 1: Database Setup (Day 1)
1. Run SQL migration to create tables
2. Add sample message templates
3. Configure automation rules

### Phase 2: API Integration (Day 2-3)
1. Sign up for Africa's Talking
2. Add API credentials to shop settings
3. Test SMS sending
4. Implement message queue processor

### Phase 3: UI Development (Day 4-5)
1. Create `/messages` page
2. Build quick send interface
3. Add campaign creator
4. Implement automation rules UI

### Phase 4: Automation (Day 6-7)
1. Set up cron jobs for automation
2. Test all automation rules
3. Configure default templates
4. Enable opt-in/opt-out system

### Phase 5: Testing & Launch (Day 8)
1. Send test messages
2. Verify delivery
3. Train users
4. Go live!

---

## 📱 Mobile-Friendly Features

- Send messages from mobile dashboard
- View message history on phone
- Quick templates for fast sending
- One-tap campaign launch
- Real-time delivery status

---

## 🔒 Privacy & Compliance

### Opt-In/Opt-Out System
- Customers can opt out of promotional messages
- Debt reminders always sent (business necessity)
- Easy unsubscribe: "Reply STOP to opt out"
- Respect customer preferences

### Data Protection
- Phone numbers encrypted
- Message history retained for 90 days
- GDPR-compliant (if needed)
- No sharing of customer data

---

## 📈 Success Metrics

Track these KPIs:
- **Delivery Rate:** % of messages delivered
- **Response Rate:** % of customers who respond
- **Debt Collection Rate:** % improvement in debt recovery
- **Customer Retention:** % of customers who return
- **ROI:** Revenue generated vs. SMS costs

---

## 🎓 Training Guide

### For Business Owners:
1. How to send quick messages
2. Creating campaigns
3. Reading analytics
4. Managing costs

### For Staff:
1. Sending thank you messages
2. Following up with customers
3. Using templates
4. Handling opt-outs

---

## 🔄 Future Enhancements

- WhatsApp integration
- Two-way conversations
- AI-powered message suggestions
- Customer segmentation
- A/B testing for messages
- Voice calls for VIP customers
- Email integration

---

## ✅ Next Steps

Ready to implement? Here's what we'll do:

1. **Choose SMS Provider** (Africa's Talking recommended)
2. **Create Database Tables** (I'll provide SQL)
3. **Build UI Pages** (Messages dashboard)
4. **Set Up Automation** (Background jobs)
5. **Add Templates** (Pre-written messages)
6. **Test & Launch** (Start engaging customers!)

**Estimated Time:** 1-2 weeks for full implementation
**Estimated Cost:** KES 160-1,600/month (depending on volume)
**Expected ROI:** 300-500% (based on increased sales and debt recovery)

---

Would you like me to start building this system? I can begin with:
1. Database schema and migrations
2. Message templates
3. UI for sending messages
4. Automation rules setup

Let me know and I'll get started! 🚀
