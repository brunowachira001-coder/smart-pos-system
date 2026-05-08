# 🚀 Start Sending SMS - Quick Guide

## Step 1: Switch Off Test Mode

Update your Vercel environment variables:

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Select your project**: nyla-wigs-pos (or your project name)
3. **Go to**: Settings → Environment Variables
4. **Find**: `SMS_TEST_MODE`
5. **Change value**: From `"true"` to `"false"`
6. **Click**: Save
7. **Redeploy**: Go to Deployments → Click "..." → Redeploy

## Step 2: How to Send Messages

### Option A: Automatic Messages (Already Working!)

When you make a sale in your POS:
- System automatically sends thank you SMS
- Customer receives message within seconds
- Message includes shop name and contact

**No action needed** - this happens automatically after you redeploy!

### Option B: Manual Messages

1. **Open your app**: https://your-app.vercel.app
2. **Go to**: Customer Messages page (in sidebar)
3. **Select a customer** from the list
4. **Choose a template**:
   - Thank You Message
   - Promotional Offer
   - Debt Reminder
   - Custom message
5. **Click**: Send Message
6. **Done!** SMS sent

### Option C: Bulk Messages

Send to multiple customers at once:

1. **Go to**: Customer Messages page
2. **Click**: "Bulk Send" button
3. **Select customers** (or select all)
4. **Choose template**
5. **Click**: Send to All
6. **Done!** Messages sent to all selected customers

## Step 3: Important - Customer Opt-In

**Before sending to a customer**, make sure they can receive SMS:

Most customers will receive messages fine. If a customer says they didn't receive SMS:

1. **Ask them to dial**: `*456*9#`
2. **Select**: Option 5 – Marketing messages
3. **Choose**: Option 5 – Activate all promo messages
4. **Done!** They can now receive your messages

## What Happens Now

Once you redeploy with `SMS_TEST_MODE="false"`:

✅ **Automatic thank you messages** sent after every sale
✅ **Manual messages** work from Customer Messages page
✅ **Bulk messaging** available
✅ **Message history** tracked in database
✅ **Cost**: KES 0.80 per SMS (~$0.006 USD)

## Your Current Balance

- **Balance**: KES 60
- **Can send**: ~75 messages
- **Top up**: Add more credit in Africa's Talking dashboard when needed

## Message Templates Available

Your system has these templates ready:

1. **Thank You** - Sent automatically after purchase
2. **Promotional** - For special offers
3. **Debt Reminder** - For customers with outstanding balance
4. **Custom** - Write your own message

## Monitoring

Track your SMS:
- **Dashboard**: See total messages sent
- **Customer Messages page**: View message history
- **Africa's Talking dashboard**: Check balance and delivery reports

## Cost Management

- Each SMS: KES 0.80
- Your balance shows in Africa's Talking dashboard
- Add credit when balance is low
- System tracks cost per message

## Quick Start Checklist

- [ ] Update `SMS_TEST_MODE` to `"false"` in Vercel
- [ ] Redeploy your app
- [ ] Make a test sale in POS
- [ ] Check if customer receives thank you SMS
- [ ] Try sending manual message from Customer Messages page
- [ ] Done! System is live

## Need Help?

If messages aren't being received:
1. Check customer has promo messages enabled (`*456*9#`)
2. Check your Africa's Talking balance
3. Check message queue in database
4. Check Vercel logs for errors

---

**You're ready to start sending messages to your customers!**
