# Vercel Deployment Debug Guide

## Current Issue: 404 Errors

The Smart POS System is deployed to Vercel but returning 404 errors. This guide will help diagnose and fix the issue.

## Root Cause Analysis

**The `.env.production` file is NOT used by Vercel.** Environment variables must be set in the Vercel dashboard.

### Why 404 Errors Occur:
1. Environment variables not set in Vercel → Database connection fails
2. Database connection fails → Pages can't render (they may depend on DB queries)
3. Pages fail to render → 404 errors

## Step-by-Step Fix

### Step 1: Verify Environment Variables in Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click on your "smart-pos-system" project
3. Go to **Settings** → **Environment Variables**
4. Verify ALL 6 variables are set:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `ENCRYPTION_KEY`
   - `NODE_ENV` (should be `production`)

**If any are missing, add them now.**

### Step 2: Check Deployment Logs

1. In Vercel dashboard, go to **Deployments**
2. Click on the latest deployment (should show "Ready" or "Error")
3. Click **View Build Logs** to see if build succeeded
4. Look for errors like:
   - `Module not found`
   - `Cannot find module`
   - `Build failed`

### Step 3: Test API Endpoints

Once environment variables are set, try accessing:

```
https://your-vercel-url.vercel.app/api/health
```

This should return:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-04-14T...",
  "database": "connected"
}
```

If you get 404, the API routes aren't being served.
If you get an error, check the error message for clues.

### Step 4: Redeploy After Setting Variables

1. In Vercel dashboard, go to **Deployments**
2. Click the three dots on the latest deployment
3. Select **Redeploy**
4. Wait for build to complete

### Step 5: Test Root Page

Once redeployed, try accessing:
```
https://your-vercel-url.vercel.app/
```

Should redirect to `/login` or `/dashboard` depending on token.

## Common Issues & Solutions

### Issue: Still Getting 404 After Setting Variables

**Solution**: 
- Check if build actually succeeded (look at build logs)
- Try a full redeploy (not just rebuild)
- Check if `.next` folder exists in build output

### Issue: Database Connection Error

**Solution**:
- Verify DATABASE_URL is correct (check Supabase dashboard)
- Verify Supabase database is running
- Check if migrations were applied (see Step 6 below)

### Issue: Redis Connection Error

**Solution**:
- Verify REDIS_URL is correct (check Upstash dashboard)
- Verify Redis instance is running
- Try disabling Redis temporarily to isolate issue

## Step 6: Verify Database Migrations

The database schema must be created before the app can work.

### Option A: Run Migrations via Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Run migrations in production
vercel env pull  # Pull production env vars
npx prisma migrate deploy  # Apply migrations
```

### Option B: Run Migrations Manually in Supabase

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy the contents of `smart-pos-system/prisma/migrations/001_init.sql`
5. Paste into SQL Editor and run

## Verification Checklist

- [ ] All 6 environment variables set in Vercel dashboard
- [ ] Latest deployment shows "Ready" status
- [ ] Build logs show no errors
- [ ] `/api/health` endpoint returns 200 with "healthy" status
- [ ] Database migrations applied (tables exist in Supabase)
- [ ] Root page `/` loads without 404
- [ ] Can access `/login` page

## Next Steps

1. Set environment variables in Vercel dashboard
2. Redeploy the project
3. Test `/api/health` endpoint
4. If still failing, check build logs for specific errors
5. Apply database migrations if needed

## Support

If you're still getting errors:
1. Check Vercel build logs for specific error messages
2. Check Supabase database status
3. Check Upstash Redis status
4. Verify all credentials are correct
