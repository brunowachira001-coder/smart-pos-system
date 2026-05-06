# ✅ Essential Environment Variables for Vercel (Celcom Only)

## Step 1: Go to Vercel Dashboard
https://vercel.com/your-project/settings/environment-variables

## Step 2: Add Each Variable Below

**IMPORTANT**: For each variable, select **Production**, **Preview**, AND **Development** environments.

---

### 🔴 CRITICAL - Database & Supabase (Required for Login)

```
NEXT_PUBLIC_SUPABASE_URL
https://xqnteamrznvoqgaazhpu.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbnRlYW1yem52b3FnYWF6aHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzk5NjUsImV4cCI6MjA5MjY1NTk2NX0.5kfYBMtKYGC5Efu9EOJx1zL3HkUZeYAlbgwusWRbF8o
```

```
SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbnRlYW1yem52b3FnYWF6aHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA3OTk2NSwiZXhwIjoyMDkyNjU1OTY1fQ.mbP8Wh08cSGDM05t
```

```
DATABASE_URL
postgresql://postgres.xqnteamrznvoqgaazhpu:mbP8Wh08cSGDM05t@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

### 🔴 CRITICAL - Security Keys

```
JWT_SECRET
PisrrctrHtXwGjenW4iGf3alBLZvx682AyLgvXZT+Jo=
```

```
JWT_REFRESH_SECRET
oBFcQCpfQA2qNyeDWTmCdAUIFBo60pVtQOkol6DgrrU=
```

```
ENCRYPTION_KEY
b2a573b62dcdde600ca88c2d83c0f6ab6181d1b5999a6d3c05e14fd3fa836938
```

---

### 🔴 CRITICAL - Redis

```
REDIS_URL
redis://default:gQAAAAAAAX5TAAIncDE2Y2ViMWM0YTRlOTg0NTc0OGY3NWJmNGRhZmFiYzk0YXAxOTc4NzU@free-pig-97875.upstash.io:6379
```

---

### Application Settings

```
NODE_ENV
production
```

```
SMS_TEST_MODE
false
```

```
SMS_PROVIDER
celcom
```

```
CRON_SECRET
sms_automation_secret_2026
```

---

### 📱 SMS Provider - Celcom Africa (Your Active Provider)

```
CELCOM_API_KEY
0621e4ea38a9d2b9000c97c90bf40c97
```

```
CELCOM_PARTNER_ID
36
```

```
CELCOM_SENDER_ID
TEXTME
```

---

## Step 3: Trigger Redeploy

After adding ALL variables above:

1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (2-3 minutes)

---

## Step 4: Test Login

Once redeployed, go to your site and try logging in. The error should be fixed! ✅

---

## Total Variables: 16 (Essential Only)

**Database & Auth**: 4 variables
**Security**: 3 variables  
**Redis**: 1 variable
**App Settings**: 4 variables
**SMS (Celcom)**: 3 variables

---

## Why This Fixes the Login Error

The login API requires `SUPABASE_SERVICE_ROLE_KEY` to connect to the database. Without it, the API crashes and returns HTML instead of JSON, causing the "Unexpected token 'A'" error.
