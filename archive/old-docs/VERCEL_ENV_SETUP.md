# CRITICAL: Vercel Environment Variables Setup

## Problem
The system shows empty because Vercel doesn't have the correct environment variables.

## Solution: Add These to Vercel

Go to: https://vercel.com/brunowachira001-coders-projects/smart-pos-system/settings/environment-variables

Add these variables:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://xqnteamrznvoqgaazhpu.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbnRlYW1yem52b3FnYWF6aHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzk5NjUsImV4cCI6MjA5MjY1NTk2NX0.5kfYBMtKYGC5Efu9EOJx1zL3HkUZeYAlbgwusWRbF8o
```

### 3. SUPABASE_SERVICE_ROLE_KEY
**YOU NEED TO GET THIS FROM SUPABASE:**
1. Go to: https://supabase.com/dashboard/project/xqnteamrznvoqgaazhpu/settings/api
2. Copy the "service_role" key (secret)
3. Add it to Vercel

### 4. Other Variables (Optional but recommended)
```
ENCRYPTION_KEY=b2a573b62dcdde600ca88c2d83c0f6ab6181d1b5999a6d3c05e14fd3fa836938
JWT_SECRET=PisrrctrHtXwGjenW4iGf3alBLZvx682AyLgvXZT+Jo=
JWT_REFRESH_SECRET=oBFcQCpfQA2qNyeDWTmCdAUIFBo60pVtQOkol6DgrrU=
REDIS_URL=redis://default:gQAAAAAAAX5TAAIncDE2Y2ViMWM0YTRlOTg0NTc0OGY3NWJmNGRhZmFiYzk0YXAxOTc4NzU@free-pig-97875.upstash.io:6379
```

## Steps:
1. Go to Supabase dashboard and get the service_role key
2. Add all variables to Vercel
3. Redeploy the app
4. Hard refresh (Ctrl + Shift + R)

## Test After Setup:
Visit: https://smart-pos-system-peach.vercel.app/api/test-db-connection
Should show: 121 products, 54 customers, etc.
