# Twilio SMS Setup Guide - 5 Minutes to Working SMS! 🚀

## Why Twilio?

✅ **Works immediately** - no waiting for activation
✅ **99.95% uptime** - most reliable SMS provider
✅ **Global reach** - works in Kenya and worldwide
✅ **Custom sender names** - can use "FULL_CIRCLE" or alphanumeric ID
✅ **Great support** - 24/7 customer service
✅ **Pay as you go** - ~$0.05 per SMS to Kenya

---

## Step 1: Create Twilio Account (2 minutes)

1. Go to: https://www.twilio.com/try-twilio
2. Click "Sign up for free"
3. Fill in your details:
   - Email: your email
   - Password: create a password
   - Phone: 0743794815 (for verification)
4. Verify your phone number (they'll send you a code)
5. Answer the questions:
   - "Which Twilio product?" → **Messaging**
   - "What do you plan to build?" → **Notifications & Alerts**
   - "How do you want to build?" → **With code**
   - "What's your preferred language?" → **Node.js**

---

## Step 2: Get Your Credentials (1 minute)

After signup, you'll see your dashboard with:

1. **Account SID** - looks like: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
2. **Auth Token** - click "Show" to reveal it
3. **Phone Number** - click "Get a Trial Number" (free)

**Copy these three values** - you'll need them in Step 3.

---

## Step 3: Add to Environment Variables (1 minute)

### Local (.env.local)

Add these lines to your `.env.local` file:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+15551234567"
SMS_PROVIDER="twilio"
SMS_TEST_MODE="false"
```

Replace with your actual values from Step 2.

### Vercel (Production)

1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add these variables:
   - `TWILIO_ACCOUNT_SID` = your Account SID
   - `TWILIO_AUTH_TOKEN` = your Auth Token
   - `TWILIO_PHONE_NUMBER` = your Twilio phone number (with +)
   - `SMS_PROVIDER` = `twilio`
   - `SMS_TEST_MODE` = `false`

---

## Step 4: Update SMS Service (30 seconds)

Update `services/sms.service.ts` to use Twilio:

```typescript
import twilioSMS from './twilio-sms.service';

// Change the export to use Twilio
export default twilioSMS;
```

---

## Step 5: Test It! (30 seconds)

Run the test script:

```bash
node test-twilio.js
```

You should see:
```
✅ SUCCESS! SMS sent via Twilio
📱 Check your phone (0743794815) for the message
```

---

## Trial Account Limitations

Twilio trial accounts have some limits:

1. **Verified numbers only** - can only send to numbers you verify
2. **Message prefix** - messages start with "Sent from your Twilio trial account"
3. **500 SMS limit** - 500 free messages

### To Remove Limitations (Upgrade Account)

1. Go to Twilio Console
2. Click "Upgrade" in the top banner
3. Add payment method (credit card)
4. **Cost**: ~$0.05 per SMS to Kenya
5. **No monthly fees** - pay only for what you use

After upgrading:
- ✅ Send to any number
- ✅ No message prefix
- ✅ Unlimited messages
- ✅ Custom sender names (alphanumeric ID)

---

## Custom Sender Name (After Upgrade)

To use "FULL_CIRCLE" as sender name:

1. Upgrade your account (add payment method)
2. Go to: Messaging → Services → Create Service
3. Name: "Nyla Wigs SMS"
4. Sender Pool → Add Sender → Alphanumeric Sender ID
5. Enter: `FULL_CIRCLE`
6. Submit for approval (usually approved in 24 hours)

Once approved, update the service to use alphanumeric sender ID instead of phone number.

---

## Pricing (After Upgrade)

**Kenya SMS Pricing:**
- Outbound SMS: ~$0.05 USD per message
- No monthly fees
- No setup fees
- Pay only for messages sent

**Example costs:**
- 100 messages = $5
- 500 messages = $25
- 1000 messages = $50

Much cheaper than Mobitech's KSH rates!

---

## Verify Phone Numbers (Trial Account)

To send to your phone during trial:

1. Go to: Phone Numbers → Verified Caller IDs
2. Click "Add a new number"
3. Enter: +254743794815
4. Verify with code they send

Now you can test SMS to your phone!

---

## Advantages Over Mobitech

| Feature | Twilio | Mobitech |
|---------|--------|----------|
| Activation | Instant | Days/weeks |
| Reliability | 99.95% | Unknown |
| Support | 24/7 | Limited |
| Documentation | Excellent | Poor |
| Custom sender | Yes (after upgrade) | Yes (if they activate) |
| API errors | Clear messages | Cryptic codes |
| Dashboard | Full analytics | Basic |

---

## Next Steps

1. **Create Twilio account** (2 min)
2. **Get credentials** (1 min)
3. **Add to .env.local** (1 min)
4. **Run test** (30 sec)
5. **Verify it works** ✅
6. **Deploy to Vercel** (2 min)
7. **Upgrade account** (optional, for production)

---

## Support

**Twilio Support:**
- Help Center: https://support.twilio.com
- Phone: Available in console after signup
- Email: help@twilio.com
- Chat: Available in console

**Your Test Phone:** 0743794815

---

## Files Created

- ✅ `services/twilio-sms.service.ts` - Twilio integration
- ✅ `test-twilio.js` - Test script
- ✅ `TWILIO_SETUP_GUIDE.md` - This guide

---

## Ready to Start?

1. Go to: https://www.twilio.com/try-twilio
2. Sign up (2 minutes)
3. Get your credentials
4. Add to `.env.local`
5. Run `node test-twilio.js`
6. See SMS arrive on your phone! 🎉

**No more waiting for Mobitech activation!**
