# ⚠️ CRITICAL: Missing Environment Variable in Vercel

## Problem
All SMS APIs are failing with 500 errors because `SUPABASE_SERVICE_KEY` is not set in Vercel.

## Solution

### Go to Vercel Dashboard:
1. Open: https://vercel.com/dashboard
2. Click on your project: `smart-pos-system`
3. Go to **Settings** → **Environment Variables**

### Add This Variable:

**Name**: `SUPABASE_SERVICE_KEY`

**Value**: Get it from Supabase:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **`service_role` key** (NOT the anon key!)
5. Paste it in Vercel

### Current Environment Variables in Vercel:
You should have these 5 variables:

1. ✅ `NEXT_PUBLIC_SUPABASE_URL`
2. ✅ `AFRICASTALKING_API_KEY`
3. ✅ `AFRICASTALKING_USERNAME`
4. ✅ `AFRICASTALKING_SENDER_ID`
5. ❌ `SUPABASE_SERVICE_KEY` ← **MISSING!**

### After Adding:
1. Click "Save"
2. Redeploy (Vercel will do this automatically)
3. Wait 2-3 minutes
4. Test again

## Why This Happened
The `SUPABASE_SERVICE_KEY` is needed for server-side operations (like inserting into message_queue table). Without it, all SMS APIs fail.
