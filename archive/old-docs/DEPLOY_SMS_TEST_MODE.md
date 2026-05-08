# Deploy SMS System with Test Mode - 2 Minutes

## Step 1: Add Environment Variable to Vercel

1. Go to https://vercel.com
2. Click on your project: **smart-pos-system**
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Add this new variable:
   - **Name**: `SMS_TEST_MODE`
   - **Value**: `true`
   - Click **Save**

## Step 2: Redeploy

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **...** (three dots) menu
4. Click **Redeploy**
5. Wait 2-3 minutes

## Step 3: Test Your SMS System

Once deployed, go to your app and:

### View Templates
- Navigate to **Customer Messages** page
- You'll see all 14 message templates

### Send a Test Message
1. Go to **Customer Messages**
2. Select a customer
3. Choose a template (e.g., "Thank You")
4. Click **Send Message**
5. You'll see: "✅ Message sent successfully!"

### Check Message History
- View the **Message Queue** section
- You'll see all "sent" messages
- Status shows as "sent" (simulated)

## What Test Mode Does

In test mode:
- ✅ All SMS features work perfectly
- ✅ Messages are logged in database
- ✅ UI shows "Message sent successfully"
- ✅ **NO actual SMS sent** (no costs)
- ✅ Perfect for testing and development

## When You're Ready for Real SMS

Once MoveSMS is activated (or you choose another provider):

1. Update Vercel environment variables:
   - `SMS_TEST_MODE`: Change to `false` (or delete it)
   - Add provider credentials (API key, etc.)
2. Redeploy
3. Real SMS will start sending!

---

**Your SMS system is ready to use in test mode right now!**

Just add that one environment variable and redeploy.
