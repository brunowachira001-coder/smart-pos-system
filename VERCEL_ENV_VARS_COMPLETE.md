# ✅ Add These Environment Variables to Vercel NOW

## Step 1: Go to Vercel Dashboard
https://vercel.com/your-project/settings/environment-variables

## Step 2: Add Each Variable Below

**IMPORTANT**: For each variable, select **Production**, **Preview**, AND **Development** environments.

---

### Database & Supabase (CRITICAL - Required for Login)

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

### Security Keys (CRITICAL)

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

### Redis

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

### SMS Providers

**Africa's Talking:**
```
AFRICASTALKING_USERNAME
NYLAWIGS
```

```
AFRICASTALKING_API_KEY
atsk_cf4801923009ba91db552ef5e38d86f847732c6e2f7e0ac34a9638381823a46919d79867
```

**Celcom Africa (Active):**
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

**SMS Leopard (Backup):**
```
SMSLEOPARD_ACCESS_TOKEN
NXBNYU9lbVFyUnB2QW5XekpLVzU6ZjI5T3F4Skt2SVVIUzQ5QXRURHQzSEt6Ykw5cG9Dcm1CMHlwNm9COA==
```

```
SMSLEOPARD_SENDER_ID
NYLAWIGS
```

**Mobitech (Backup):**
```
MOBITECH_API_KEY
5d684e0aebbcf9e829e9bbac4f6b0e875c00a90bd0ac83a682f6ef0a406a9695
```

```
MOBITECH_ACCOUNT
MT6896
```

```
MOBITECH_SENDER_ID
FULL_CIRCLE
```

---

## Step 3: Trigger Redeploy

After adding ALL variables:

1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (2-3 minutes)

---

## Step 4: Test Login

Once redeployed, go to your site and try logging in. The "Unexpected token" error should be gone!

---

## Why This Fixes the Login Error

The login API (`/api/auth/login`) uses `getAdminDb()` which requires `SUPABASE_SERVICE_ROLE_KEY`. Without this variable, the API crashes and returns an HTML error page instead of JSON, causing the "Unexpected token 'A'" error you saw.

Now that all variables are set, the API will work correctly! ✅
