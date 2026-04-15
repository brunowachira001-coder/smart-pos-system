# Manual Vercel Redeploy Instructions

## Problem
Vercel is not deploying the latest code from the root directory. The deployment is stuck showing 404 errors.

## Solution - Manual Redeploy

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find your project**: "smart-pos-system"
3. **Click on the project**
4. **Go to Settings tab**
5. **Look for "Root Directory" setting**
   - It should be set to `.` (root) or empty
   - If it shows `smart-pos-system/`, change it to `.`
6. **Save changes**
7. **Go to Deployments tab**
8. **Click the three dots (...) on the latest deployment**
9. **Select "Redeploy"**
10. **Wait for the build to complete** (usually 2-3 minutes)

## What to Test After Redeploy

1. **Health Check**: https://smart-pos-system.vercel.app/health
   - Should show "✅ System is LIVE"
   
2. **Login Page**: https://smart-pos-system.vercel.app/login
   - Should show the login form
   
3. **Test Login**: 
   - Username: `admin`
   - Password: `admin123`
   - Should redirect to dashboard

## If Still Not Working

1. **Clear Vercel Cache**:
   - Go to Settings → Git
   - Click "Disconnect Git"
   - Reconnect Git
   - Trigger a new deployment

2. **Check Build Logs**:
   - Go to Deployments
   - Click on the latest deployment
   - Check the build logs for errors

3. **Alternative**: Deploy locally and test
   - Run: `npm run build && npm run start`
   - Visit: http://localhost:3000/login
