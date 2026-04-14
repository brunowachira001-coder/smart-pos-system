# Vercel Redeploy Instructions - Force Latest Commit

## Current Status
- **Latest Commit**: d448afd (Fix jsonwebtoken version - use 9.0.0 instead of 9.1.0)
- **Vercel is Cloning**: dd19e87 (old commit with broken jsonwebtoken@^9.1.0)
- **Problem**: npm install fails because jsonwebtoken@^9.1.0 doesn't exist
- **Solution**: Force Vercel to pull and deploy the latest commit

## Why This Happened
Vercel caches deployments and may not automatically pull the latest commit if:
1. The deployment was triggered before the push completed
2. Vercel's cache hasn't refreshed
3. The GitHub webhook didn't trigger properly

## Solution: Force Redeploy

### Option 1: Redeploy from Vercel Dashboard (RECOMMENDED)
1. Go to https://vercel.com/dashboard
2. Click on your project: **smart-pos-system**
3. Go to **Deployments** tab
4. Find the latest failed deployment (showing commit dd19e87)
5. Click the **three dots (...)** menu on the right
6. Select **Redeploy**
7. A dialog will appear - click **Redeploy** again to confirm
8. **IMPORTANT**: This will clear the cache and pull the latest commit

### Option 2: Trigger from GitHub
1. Go to https://github.com/brunowachira001-coder/smart-pos-system
2. Make a small commit (e.g., update a comment in README.md)
3. Push to main branch
4. This will trigger Vercel's GitHub webhook automatically

### Option 3: Manual Git Push with Force
```bash
cd smart-pos-system
git push origin main --force
```
⚠️ Only use this if Option 1 doesn't work. This forces GitHub to update.

## What to Expect After Redeploy

### Build Process
1. Vercel will clone commit d448afd (latest)
2. Run: `cd smart-pos-system && npm install`
3. This time it will find jsonwebtoken@^9.0.0 ✅
4. Build should complete successfully
5. Deployment should succeed

### Verification Steps
Once deployment succeeds:

1. **Check API Test Endpoint**
   - Visit: `https://your-vercel-url.vercel.app/api/test`
   - Expected response: `{"success": true}`

2. **Check Health Endpoint**
   - Visit: `https://your-vercel-url.vercel.app/api/health`
   - Expected response: Database connection status

3. **Check Test Page**
   - Visit: `https://your-vercel-url.vercel.app/test`
   - Should load without 404 error

4. **Check Login Page**
   - Visit: `https://your-vercel-url.vercel.app/login`
   - Should load the login form

## Environment Variables Status
All 6 environment variables are already set in Vercel:
- ✅ DATABASE_URL
- ✅ REDIS_URL
- ✅ JWT_SECRET
- ✅ JWT_REFRESH_SECRET
- ✅ ENCRYPTION_KEY
- ✅ NODE_ENV

## Troubleshooting

### If Redeploy Still Shows Old Commit
1. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Wait 5 minutes for Vercel's cache to clear
3. Try redeploy again
4. Check GitHub webhook settings in Vercel project settings

### If npm install Still Fails
1. Check package.json shows `"jsonwebtoken": "^9.0.0"`
2. Verify the commit is d448afd
3. Look for other version conflicts in npm error log
4. Check if any other dependencies have version issues

### If Build Succeeds but Pages Show 404
1. Check that outputDirectory is `.next` in vercel.json
2. Verify buildCommand is `npm run build`
3. Check that pages exist in `smart-pos-system/pages/`

## Next Steps After Successful Deployment
1. Test all endpoints
2. Verify database connection works
3. Test login functionality
4. Monitor deployment logs for any runtime errors
5. Check Vercel analytics dashboard

---

**Last Updated**: April 14, 2026
**Status**: Ready for redeploy
**Commit**: d448afd (latest with jsonwebtoken fix)
