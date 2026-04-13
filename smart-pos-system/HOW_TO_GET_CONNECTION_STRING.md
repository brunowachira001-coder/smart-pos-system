# How to Get Connection String in Supabase

**Date**: April 13, 2026  
**Status**: Step-by-step guide  
**Estimated Time**: 2 minutes

---

## 🎯 Overview

The connection string is what your app uses to connect to your Supabase PostgreSQL database. This guide shows you exactly how to find and copy it.

---

## 📍 Location in Supabase Dashboard

The connection string is located in:
```
Settings → Database → Connection string
```

---

## 🚀 Step-by-Step: Get Connection String

### Step 1: Go to Settings

1. Log in to Supabase dashboard
2. Select your project (smart-pos-system)
3. In the **left sidebar**, scroll down to the bottom
4. Click **"Settings"** (gear icon)

**Expected:** Settings page opens

---

### Step 2: Click Database

1. In Settings, look for the menu on the left
2. Click **"Database"**

**Expected:** Database settings page appears

---

### Step 3: Find Connection String Section

On the Database settings page, you'll see several sections:

```
┌─────────────────────────────────────────────────────┐
│ Connection string                                   │
│                                                     │
│ [Connection Pooling] [Direct connection]            │
│                                                     │
│ Session mode:                                       │
│ postgresql://postgres:PASSWORD@db.xxx.supabase.co  │
│ :5432/postgres                                      │
│                                                     │
│ [Copy button]                                       │
└─────────────────────────────────────────────────────┘
```

---

### Step 4: Choose Connection Mode

You'll see two tabs:

**1. Connection Pooling** (Recommended for Vercel)
```
postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
```

**2. Direct connection** (For local development)
```
postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
```

**For Vercel deployment, use "Connection Pooling"**

---

### Step 5: Copy Connection String

1. Click the **"Copy"** button next to the connection string
2. The string is now copied to your clipboard

**Expected:** You see a "Copied!" notification

---

### Step 6: Save Connection String

Paste the connection string somewhere safe:

**Option A: Save to .env.local file**
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
```

**Option B: Save to password manager**
- 1Password
- LastPass
- Bitwarden
- KeePass

**Option C: Save to text file** (temporary, delete after use)

---

## 📋 Connection String Format

Your connection string will look like:

```
postgresql://postgres:YOUR_PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
```

**Components:**
- `postgresql://` - Protocol (PostgreSQL)
- `postgres` - Username
- `:YOUR_PASSWORD` - Your database password
- `@db.PROJECT_ID.supabase.co` - Supabase host
- `:5432` - Port number
- `/postgres` - Database name

**Example:**
```
postgresql://postgres:Tr0pic@lSunset#2024!Secure@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

## 🔍 Visual Guide: Where to Find It

### Dashboard View
```
┌─────────────────────────────────────────────────────┐
│ Supabase Dashboard                                  │
├─────────────────────────────────────────────────────┤
│ Left Sidebar:                                       │
│ • Home                                              │
│ • SQL Editor                                        │
│ • Database                                          │
│ • Auth                                              │
│ • Storage                                           │
│ • Realtime                                          │
│ • Vector                                            │
│ • Settings ← CLICK HERE                             │
└─────────────────────────────────────────────────────┘
```

### Settings Page
```
┌─────────────────────────────────────────────────────┐
│ Settings                                            │
├─────────────────────────────────────────────────────┤
│ Left Menu:                                          │
│ • General                                           │
│ • Database ← CLICK HERE                             │
│ • API                                               │
│ • Auth                                              │
│ • Billing                                           │
└─────────────────────────────────────────────────────┘
```

### Database Settings
```
┌─────────────────────────────────────────────────────┐
│ Database Settings                                   │
├─────────────────────────────────────────────────────┤
│ Connection string                                   │
│                                                     │
│ [Connection Pooling] [Direct connection]            │
│                                                     │
│ Session mode:                                       │
│ postgresql://postgres:PASSWORD@db.xxx.supabase.co  │
│ :5432/postgres                                      │
│                                                     │
│ [Copy] ← CLICK HERE                                 │
└─────────────────────────────────────────────────────┘
```

---

## ⚠️ Important Notes

### Connection Pooling vs Direct Connection

**Connection Pooling (Recommended for Vercel):**
- Better for serverless functions
- Handles connection limits
- More reliable for web apps
- Use this one!

**Direct Connection:**
- Better for local development
- Better for persistent connections
- Use for development only

### Password Contains Special Characters?

If your password has special characters, you may need to URL encode them:

```
@ → %40
# → %23
! → %21
: → %3A
$ → %24
& → %26
% → %25
```

**Example:**
```
Password: Tr0pic@lSunset#2024!Secure
Encoded: Tr0pic%40lSunset%232024%21Secure

Connection String:
postgresql://postgres:Tr0pic%40lSunset%232024%21Secure@db.xxx.supabase.co:5432/postgres
```

---

## 🔐 Security Best Practices

1. **Never commit to Git**
   - Add to `.gitignore`
   - Use environment variables
   - Don't share in code

2. **Save securely**
   - Use password manager
   - Don't save in plain text files
   - Don't share with others

3. **Rotate regularly**
   - Change password periodically
   - Update connection string
   - Monitor access logs

4. **Use environment variables**
   - Store in `.env.local`
   - Use in Vercel secrets
   - Never hardcode

---

## ✅ Verification Checklist

- [ ] Logged into Supabase
- [ ] Selected correct project
- [ ] Went to Settings → Database
- [ ] Clicked "Connection Pooling" tab
- [ ] Copied connection string
- [ ] Saved connection string securely
- [ ] Verified format is correct
- [ ] Ready to use in Vercel

---

## 🆘 Troubleshooting

### Can't Find Connection String?

**Solution:**
1. Make sure you're in Settings (not Dashboard)
2. Click "Database" in left menu
3. Look for "Connection string" section
4. Click "Connection Pooling" tab
5. Copy the "Session mode" string

### Connection String Looks Wrong?

**Should look like:**
```
postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
```

**If missing parts:**
- Check you're on the right page
- Refresh the page
- Try copying again

### Password Not Showing?

**Solution:**
1. The password is hidden for security
2. It's the password you set when creating the project
3. If you forgot it, you can reset it in Database settings

### Can't Copy?

**Solution:**
1. Click the copy button again
2. Try right-click → Copy
3. Manually select and copy the text
4. Refresh page and try again

---

## 📝 What to Do With Connection String

Once you have the connection string:

1. **For Vercel deployment:**
   - Add to Vercel environment variables
   - Name it: `DATABASE_URL`
   - Keep it secret

2. **For local development:**
   - Add to `.env.local` file
   - Don't commit to Git
   - Use for testing

3. **For migrations:**
   - Use with Prisma
   - Run: `npx prisma migrate deploy`
   - Run: `npx prisma db seed`

---

## 🎯 Next Steps

1. ✅ Get connection string
2. ✅ Save it securely
3. ⏳ Create Upstash Redis
4. ⏳ Deploy to Vercel
5. ⏳ Run migrations

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs/guides/database/connecting-to-postgres
- **Connection Pooling**: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling-with-supavisor
- **Support**: https://github.com/supabase/supabase/discussions

---

*Last Updated: April 13, 2026*  
*System: Smart POS System v1.0.0*  
*Status: Connection String Guide*
