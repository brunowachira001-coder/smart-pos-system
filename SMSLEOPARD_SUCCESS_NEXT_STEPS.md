# SMS Leopard - Authentication Working! ✅

## Great News!

We've successfully figured out SMS Leopard's authentication! 🎉

### What We Discovered:

1. **Token Format**: The API key is base64-encoded `username:password`
2. **Authentication**: Use Basic Auth with decoded credentials
3. **API Endpoint**: `https://api.smsleopard.com/v1/sms/send`
4. **Request Format**:
   ```json
   {
     "message": "Your message",
     "recipients": [{ "phone_number": "254XXXXXXXXX" }],
     "source": "SENDER_ID"
   }
   ```

## Current Issue: Sender ID Not Approved

The API is working, but we're getting:
```
"Unrecognized sender id. Sender ID NYLAWIGS is not assigned to the account"
```

## What You Need to Do:

### Option 1: Check Approved Sender IDs (Recommended)

1. **Login to SMS Leopard Dashboard**: https://app.smsleopard.com/
2. **Go to Sender IDs section**
3. **Check which sender IDs are approved**
4. **Tell me the approved sender ID** and I'll use that

### Option 2: Register NYLAWIGS Sender ID

1. **Go to Sender IDs** in your dashboard
2. **Click "Add New Sender ID"**
3. **Enter**: `NYLAWIGS`
4. **Submit for approval**
5. **Wait for approval** (usually instant to 24 hours)

### Option 3: Use Default/Generic Sender

Some accounts have a default sender ID like:
- `SMSLEOPARD`
- `INFO`
- `ALERTS`
- Or your phone number

Check your dashboard for the default sender.

## Once You Have the Sender ID:

Just tell me the approved sender ID (e.g., "SMSLEOPARD" or "INFO"), and I'll:
1. Update the code
2. Test it
3. Deploy to production
4. Your SMS system will be live!

## Cost Reminder

✅ **SMS Leopard**: KSH 0.80/SMS
❌ **Twilio**: KSH 6.50/SMS
💰 **You save**: KSH 5.70 per SMS!

---

**What's the approved sender ID in your dashboard?**
