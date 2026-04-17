# 📸 Visual Guide: Get Supabase Credentials

## 🎯 Step-by-Step with Exact Clicks

### Step 1: Open Your Project (10 seconds)
1. Go to: **https://supabase.com/dashboard**
2. You'll see your project: **smart-pos-system**
3. Click on it

---

### Step 2: Get URL & API Key (30 seconds)

**Exact clicks:**
1. Look at the left sidebar (bottom)
2. Click the **⚙️ gear icon** (says "Project Settings")
3. In the left menu, click **"API"**
4. You'll see a page with two sections:

**Copy these two values:**

```
Project URL
└─ https://xxxxxxxxxxxxx.supabase.co
   [Copy this entire URL]

Project API keys
└─ anon public
   └─ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
      [Click the copy icon next to this long string]
```

---

### Step 3: Get Database Password (20 seconds)

**If you remember your password:**
- Use the password you created when you made the project
- Skip to Step 4

**If you forgot your password:**
1. Still in Project Settings (left sidebar)
2. Click **"Database"**
3. Scroll down to **"Reset database password"**
4. Enter a new password
5. Click **"Reset password"**
6. Save this password!

---

### Step 4: Paste Here

Reply with this format:

```
URL: https://xxxxxxxxxxxxx.supabase.co
KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PASSWORD: your_password_here
```

---

## 🚨 Common Issues

**Can't find Project Settings?**
- Look at the very bottom of the left sidebar
- It's a gear icon ⚙️

**Can't find API section?**
- Make sure you clicked Project Settings first
- API is in the left menu inside Project Settings

**Don't see "anon public" key?**
- Scroll down on the API page
- It's under "Project API keys" section
- Look for the one labeled "anon" or "anon public"

---

## ✅ What Happens Next

Once you paste your credentials:
1. I create `.env.local` file (5 seconds)
2. Test database connection (10 seconds)
3. Update all pages to use database (30 seconds)
4. Verify everything works (20 seconds)
5. Deploy to Vercel (30 seconds)

**Total: 2 minutes to complete setup!**

---

Ready? Just paste your 3 values! 🚀
