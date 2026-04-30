# How to Send Thank You Message to Samuel

## 🎯 Quick Answer

The system has **2 ways** to send messages:

### **Option 1: Automatic (Already Working!)**
When Samuel makes a purchase, the system **automatically** sends him a thank you message within 1 hour.

### **Option 2: Manual (Send Now)**
You can manually send a message to Samuel right now.

---

## 🤖 How Automatic Messages Work

### Step-by-Step Flow:

1. **Samuel makes a purchase** at POS
   - Transaction is recorded in database
   - Customer ID is linked to transaction

2. **Automation Rule Triggers** (runs every hour via cron job)
   - System checks for new purchases in last hour
   - Finds Samuel's transaction
   - Gets his phone number from customer database

3. **AI Generates Personalized Message**
   - Uses message template
   - Adds Samuel's name
   - Adds purchase details
   - Makes it sound natural and friendly

4. **SMS is Sent via Africa's Talking**
   - Message goes to Samuel's phone
   - Works on ANY phone (not just smartphones)
   - Delivery status is tracked

5. **System Records Everything**
   - Message saved in `sms_queue` table
   - Status tracked (pending → sent → delivered)
   - Cost calculated and recorded

---

## 📱 Manual Method: Send Message to Samuel Now

### Using the API (Recommended):

```bash
# Send to specific customer by ID
curl -X POST https://your-site.vercel.app/api/sms/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "thank_you_purchase",
    "customerIds": ["samuel-customer-id"],
    "context": {
      "customerName": "Samuel",
      "amount": "5000"
    }
  }'
```

### Using the Dashboard:

1. Go to **Customer Messages** page
2. Click **"Send Message"** button
3. Select **"Thank You"** template
4. Choose **Samuel** from customer list
5. Click **"Send Now"**

---

## 📋 Message Templates Available

The system has these pre-built templates:

### 1. **Thank You After Purchase**
```
Hi {name}! 🎉 Thank you for shopping at Nyla Wigs today! 
We appreciate your business. Your purchase of KES {amount} 
has been recorded. Visit us again soon! 😊
```

### 2. **Debt Reminder**
```
Hello {name}, this is a friendly reminder that you have 
an outstanding balance of KES {amount} due on {due_date}. 
Please visit us to settle. Thank you!
```

### 3. **Welcome New Customer**
```
Welcome to Nyla Wigs, {name}! 🎊 We're excited to have you 
as our customer. Enjoy quality wigs and excellent service. 
Save our number for updates!
```

### 4. **Inactive Customer**
```
Hi {name}! We miss you at Nyla Wigs! 😊 It's been a while 
since your last visit. Come check out our new collection. 
Special discount waiting for you!
```

---

## ⚙️ Automation Rules (Already Configured)

### Active Rules:

1. **After Purchase Thank You**
   - Trigger: 1 hour after purchase
   - Message: Thank you template
   - Status: ✅ Active

2. **Debt Reminder**
   - Trigger: 3 days after due date
   - Message: Friendly reminder
   - Status: ✅ Active

3. **Inactive Customer**
   - Trigger: 30 days no purchase
   - Message: We miss you
   - Status: ✅ Active

---

## 🔧 How to Check if Samuel Got the Message

### Method 1: Check SMS Queue
```sql
-- Run in Supabase SQL Editor
SELECT 
  sq.id,
  sq.phone_number,
  sq.message,
  sq.status,
  sq.sent_at,
  sq.delivered_at,
  c.name as customer_name
FROM sms_queue sq
LEFT JOIN customers c ON sq.customer_id = c.id
WHERE c.name ILIKE '%samuel%'
ORDER BY sq.created_at DESC
LIMIT 10;
```

### Method 2: Check Customer Messages Dashboard
1. Go to **Customer Messages** page
2. Click **"Message Queue"** tab
3. Search for "Samuel"
4. See all messages sent to him

---

## 💡 Example: Samuel Just Made a Sale

### What Happens Automatically:

**Time: 2:00 PM** - Samuel buys a wig for KES 5,000
```
✅ Transaction recorded
✅ Customer ID linked
✅ Message queued for 3:00 PM
```

**Time: 3:00 PM** - Cron job runs
```
🤖 Automation checks new purchases
🤖 Finds Samuel's transaction
🤖 Generates personalized message:
   "Hi Samuel! 🎉 Thank you for shopping at Nyla Wigs today!
    We appreciate your business. Your purchase of KES 5,000
    has been recorded. Visit us again soon! 😊"
```

**Time: 3:01 PM** - SMS sent
```
📤 Message sent via Africa's Talking
📱 Samuel receives SMS on his phone
✅ Delivery confirmed
💰 Cost: KES 0.80 (recorded)
```

---

## 🚀 Quick Test: Send Message to Samuel Right Now

### Step 1: Get Samuel's Customer ID
```sql
SELECT id, name, phone FROM customers WHERE name ILIKE '%samuel%';
```

### Step 2: Send Message via API
```javascript
// In browser console or Postman
fetch('/api/sms/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'thank_you_purchase',
    customerIds: ['samuel-id-here'],
    context: {
      customerName: 'Samuel',
      amount: '5000'
    }
  })
})
.then(r => r.json())
.then(data => console.log('Message sent!', data));
```

---

## 📊 System Status

### Current Configuration:
- ✅ Africa's Talking API: Connected
- ✅ Sender ID: NYLAWIGS
- ✅ Automation: Active (runs every hour)
- ✅ AI Messages: Enabled
- ✅ Templates: 4 active templates
- ✅ Cron Job: `/api/cron/process-automations`

### Cron Schedule:
```
Every hour at :00 minutes
Example: 1:00 PM, 2:00 PM, 3:00 PM, etc.
```

---

## 🎯 Summary

**For Samuel's thank you message:**

1. **Automatic**: System sends within 1 hour of purchase ✅
2. **Manual**: Use Customer Messages dashboard or API
3. **Message**: Personalized with his name and amount
4. **Delivery**: Works on any phone (SMS, not WhatsApp)
5. **Tracking**: All messages logged in database

**The system is already working!** Every customer who makes a purchase gets an automatic thank you message within 1 hour. 🎉

---

## 📞 Need Help?

- Check `sms_queue` table for message history
- Check `automation_rules` table for active rules
- Check `.env.local` for Africa's Talking credentials
- View logs in Vercel dashboard for cron job execution
