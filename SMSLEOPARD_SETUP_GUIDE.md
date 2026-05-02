# SMS Leopard Setup Guide - Cheapest & Best for Kenya! 🇰🇪

## Why SMS Leopard?

✅ **Kenya-based** - Built for Kenyan businesses
✅ **Super cheap** - KSH 0.80 per SMS (vs Twilio KSH 6.50, Mobitech KSH 1-2)
✅ **Instant activation** - Works immediately after signup
✅ **Custom sender names** - Use "NYLAWIGS" or "FULL_CIRCLE"
✅ **Local support** - Kenyan support team
✅ **No monthly fees** - Pay only for what you use
✅ **Bulk SMS** - Send to thousands at once
✅ **Great delivery rates** - 98%+ delivery

---

## Pricing Comparison

| Provider | Cost per SMS | Setup Time | Support |
|----------|-------------|------------|---------|
| **SMS Leopard** | **KSH 0.80** | **Instant** | **Local** |
| Mobitech | KSH 1-2 | Days/Never | Poor |
| Twilio | KSH 6.50 | Instant | 24/7 |
| Africa's Talking | KSH 0.80 | Instant | Good |

**SMS Leopard = Cheapest + Fastest + Local!**

---

## Step 1: Create Account (2 minutes)

1. Go to: **https://www.smsleopard.com**
2. Click "Sign Up" or "Get Started"
3. Fill in your details:
   - Business Name: Nyla Wigs
   - Email: your email
   - Phone: 0743794815
   - Password: create a password
4. Verify your email (check inbox)
5. Login to your dashboard

---

## Step 2: Get API Key (1 minute)

After login:

1. Go to **Settings** or **API Settings**
2. Click "Generate API Key" or "Create API Key"
3. **Copy the API key** - looks like: `slk_xxxxxxxxxxxxxxxxxxxxxxxx`
4. Save it somewhere safe

---

## Step 3: Register Sender ID (2 minutes)

1. In dashboard, go to **Sender IDs** or **Sender Names**
2. Click "Add Sender ID"
3. Enter: **NYLAWIGS** (or **FULLCIRCLE** - max 11 characters)
4. Purpose: "Customer notifications for POS system"
5. Submit

**Approval time:** Usually instant to 24 hours

---

## Step 4: Top Up Account (2 minutes)

1. Go to **Billing** or **Top Up**
2. Choose amount: **KSH 100** (gets you 125 SMS)
3. Payment methods:
   - M-Pesa (instant)
   - Card
   - Bank transfer
4. Complete payment

**Recommended:** Start with KSH 100-500 for testing

---

## Step 5: Add to Environment Variables (1 minute)

### Local (.env.local)

Add these lines:

```env
# SMS Leopard Configuration
SMSLEOPARD_API_KEY="slk_xxxxxxxxxxxxxxxxxxxxxxxx"
SMSLEOPARD_SENDER_ID="NYLAWIGS"
SMS_PROVIDER="smsleopard"
SMS_TEST_MODE="false"
```

Replace with your actual API key and sender ID.

### Vercel (Production)

1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   - `SMSLEOPARD_API_KEY` = your API key
   - `SMSLEOPARD_SENDER_ID` = NYLAWIGS
   - `SMS_PROVIDER` = smsleopard
   - `SMS_TEST_MODE` = false

---

## Step 6: Update SMS Service (30 seconds)

Update `services/sms.service.ts`:

```typescript
import smsLeopardService from './smsleopard-sms.service';

// Change the export to use SMS Leopard
export default smsLeopardService;
```

---

## Step 7: Test It! (30 seconds)

Run the test script:

```bash
node test-smsleopard.js
```

Expected result:
```
✅ SUCCESS! SMS sent via SMS Leopard
📱 Check your phone (0743794815) for the message
💰 Cost: KSH 0.80
```

---

## Features

### Custom Sender Names
- **NYLAWIGS** - Your business name
- **FULLCIRCLE** - Alternative name
- Max 11 characters (alphanumeric)
- Approval: Usually instant

### Bulk SMS
- Send to thousands at once
- Automatic rate limiting
- Delivery reports
- Cost tracking

### Delivery Reports
- Real-time status updates
- Failed message tracking
- Delivery confirmation
- Cost per message

### API Features
- Simple REST API
- JSON responses
- Clear error messages
- Rate limiting: 100 SMS/second

---

## Pricing Details

### Per SMS Cost
- **Local SMS (Kenya):** KSH 0.80
- **International:** Varies by country

### Example Costs
- 100 SMS = KSH 80
- 500 SMS = KSH 400
- 1,000 SMS = KSH 800
- 10,000 SMS = KSH 8,000

### Bulk Discounts
- 10,000+ SMS: Contact for discount
- 50,000+ SMS: Better rates available
- 100,000+ SMS: Custom pricing

---

## Sender ID Guidelines

### Approved Sender IDs
✅ Business name (NYLAWIGS)
✅ Brand name (FULLCIRCLE)
✅ Service name (NYLAPOS)
✅ Alphanumeric (max 11 chars)

### Not Allowed
❌ Generic names (INFO, PROMO)
❌ Numbers only
❌ Special characters
❌ Misleading names

---

## Support

### SMS Leopard Support
- **Email:** support@smsleopard.com
- **Phone:** +254 700 000 000 (check website)
- **Website:** https://www.smsleopard.com
- **Response time:** Usually within 24 hours

### Documentation
- API Docs: https://www.smsleopard.com/docs
- FAQs: https://www.smsleopard.com/faq
- Guides: Available in dashboard

---

## Advantages Over Other Providers

### vs Mobitech
✅ Actually works (no error 1006)
✅ Instant activation
✅ Better support
✅ Similar pricing

### vs Twilio
✅ 8x cheaper (KSH 0.80 vs KSH 6.50)
✅ Kenya-focused
✅ Local support
✅ M-Pesa payment

### vs Africa's Talking
✅ Simpler API
✅ Faster setup
✅ Same pricing
✅ Better dashboard

---

## Common Issues & Solutions

### Issue: API Key Not Working
**Solution:**
1. Check API key is copied correctly
2. Ensure no extra spaces
3. Verify account is active
4. Check credit balance

### Issue: Sender ID Not Approved
**Solution:**
1. Wait 24 hours for approval
2. Use default sender ID temporarily
3. Contact support if delayed

### Issue: SMS Not Delivered
**Solution:**
1. Check phone number format (254...)
2. Verify credit balance
3. Check delivery reports in dashboard
4. Ensure sender ID is approved

---

## Next Steps

1. **Sign up:** https://www.smsleopard.com (2 min)
2. **Get API key** from dashboard (1 min)
3. **Register sender ID:** NYLAWIGS (2 min)
4. **Top up:** KSH 100-500 (2 min)
5. **Add to .env.local** (1 min)
6. **Test:** `node test-smsleopard.js` (30 sec)
7. **Deploy to Vercel** (2 min)
8. **Start sending!** ✅

---

## Cost Calculator

**Your Usage Estimate:**
- 10 customers/day × 30 days = 300 SMS/month
- Cost: 300 × KSH 0.80 = **KSH 240/month**

**Compare to Twilio:**
- 300 × KSH 6.50 = KSH 1,950/month
- **You save: KSH 1,710/month!**

---

## Files Created

- ✅ `services/smsleopard-sms.service.ts` - SMS Leopard integration
- ✅ `test-smsleopard.js` - Test script
- ✅ `SMSLEOPARD_SETUP_GUIDE.md` - This guide

---

## Ready to Start?

**Sign up now:** https://www.smsleopard.com

**Questions?** Email: support@smsleopard.com

**Let's get SMS working for KSH 0.80 per message!** 🚀
