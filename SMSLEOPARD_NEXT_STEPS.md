# SMS Leopard - Next Steps to Get It Working

## Current Status

✅ API Key added: `Bz3LDHWNx1tL6A2BL4ie`
✅ Code integrated and ready
✅ Test script working
❌ Getting "Unauthorized" error

## Why "Unauthorized"?

The API key is being rejected. This usually means:

1. **Account not activated** - Need to verify email or complete signup
2. **No credit balance** - Need to top up account
3. **API key not enabled** - Need to activate it in dashboard

---

## Fix It Now (5 Minutes)

### Step 1: Log In to Dashboard

Go to: **https://www.smsleopard.com/login**

Use the email/password you signed up with.

### Step 2: Verify Your Account

Check your email for verification link from SMS Leopard.
Click it to activate your account.

### Step 3: Check API Key

1. In dashboard, go to **Settings** → **API Keys**
2. Check if your API key is **Active**
3. If not, click "Activate" or "Enable"

### Step 4: Top Up Your Account

1. Go to **Billing** or **Top Up**
2. Add credit: **KSH 100** minimum (gets you 125 SMS)
3. Payment options:
   - **M-Pesa** (instant) - Recommended
   - Card
   - Bank transfer

**M-Pesa Instructions:**
- Paybill/Till number will be shown
- Amount: KSH 100 (or more)
- Account: Your phone number or account ID
- Complete payment
- Credit appears instantly

### Step 5: Register Sender ID (Optional but Recommended)

1. Go to **Sender IDs**
2. Click "Add Sender ID"
3. Enter: **NYLAWIGS**
4. Purpose: "Customer notifications"
5. Submit

**Approval:** Usually instant to 24 hours

### Step 6: Test Again

After completing steps above, run:

```bash
node test-smsleopard.js
```

Expected result:
```
✅ SUCCESS! SMS sent via SMS Leopard
📱 Check your phone (0743794815) for the message
```

---

## Alternative: Get New API Key

If the current API key doesn't work:

1. Log in to dashboard
2. Go to **Settings** → **API Keys**
3. Click "Generate New API Key"
4. Copy the new key
5. Update `.env.local`:
   ```env
   SMSLEOPARD_API_KEY="your_new_key_here"
   ```
6. Test again

---

## Common Issues

### Issue: "Unauthorized"
**Solution:**
- Verify email address
- Check API key is active in dashboard
- Ensure account has credit

### Issue: "Insufficient Balance"
**Solution:**
- Top up via M-Pesa (instant)
- Minimum: KSH 100

### Issue: "Sender ID not approved"
**Solution:**
- Register NYLAWIGS as sender ID
- Wait for approval (usually instant)
- Or use default sender temporarily

---

## Contact SMS Leopard Support

If you're stuck:

**Email:** support@smsleopard.com
**Subject:** "API Key Unauthorized - Need Help"

**Message:**
```
Hello,

I signed up for SMS Leopard and got API key: Bz3LDHWNx1tL6A2BL4ie

When I try to send SMS, I get "Unauthorized" error.

Can you please:
1. Verify my account is activated
2. Check if my API key is enabled
3. Confirm I can start sending SMS

My phone: 0743794815
Business: Nyla Wigs

Thank you!
```

---

## Once It Works

After successful test:

### 1. Update Vercel

Add to Vercel environment variables:
```
SMSLEOPARD_API_KEY=Bz3LDHWNx1tL6A2BL4ie
SMSLEOPARD_SENDER_ID=NYLAWIGS
SMS_PROVIDER=smsleopard
SMS_TEST_MODE=false
```

### 2. Deploy

```bash
git add .
git commit -m "Switch to SMS Leopard"
git push
```

### 3. Start Sending!

Your POS system will now send SMS at KSH 0.80 per message!

---

## Cost Estimate

**Your Usage:**
- 10 customers/day × 30 days = 300 SMS/month
- Cost: 300 × KSH 0.80 = **KSH 240/month**

**Top Up Recommendation:**
- Start with: KSH 500 (625 SMS)
- Lasts: ~2 months
- Top up when balance is low

---

## Summary

**What to do now:**

1. ✅ Log in to SMS Leopard dashboard
2. ✅ Verify your email
3. ✅ Top up KSH 100 via M-Pesa
4. ✅ Check API key is active
5. ✅ Test: `node test-smsleopard.js`
6. ✅ Deploy to Vercel

**Dashboard:** https://www.smsleopard.com/dashboard

**Support:** support@smsleopard.com

---

## Your Credentials

**API Key:** `Bz3LDHWNx1tL6A2BL4ie`
**Sender ID:** NYLAWIGS
**Test Phone:** 0743794815

---

**Let's get this working! Start with logging in and topping up KSH 100.** 🚀
