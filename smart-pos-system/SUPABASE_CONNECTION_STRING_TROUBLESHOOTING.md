# Supabase Connection String - Troubleshooting Guide

**Date**: April 13, 2026  
**Status**: Troubleshooting guide  
**Estimated Time**: 5 minutes

---

## ⚠️ Problem: Connection String Not Visible

If you don't see the connection string in Connection Pooling, follow these solutions.

---

## 🔍 Solution 1: Check if Database is Ready

### Step 1: Verify Database Status

1. Go to **Settings → Database**
2. Look at the top of the page
3. Check the **Database Status**

**You should see:**
```
Status: Active
```

**If you see:**
```
Status: Creating...
```

**Solution:** Wait 2-3 minutes for the database to finish creating. Then refresh the page.

---

## 🔍 Solution 2: Try Direct Connection Tab

If Connection Pooling is empty, try the **Direct connection** tab:

1. Go to **Settings → Database**
2. Click **"Direct connection"** tab (not Connection Pooling)
3. You should see the connection string there

**Direct Connection String:**
```
postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
```

**Note:** Direct connection works the same way as Connection Pooling for Vercel.

---

## 🔍 Solution 3: Refresh the Page

Sometimes the page doesn't load properly:

1. Go to **Settings → Database**
2. Press **F5** or **Ctrl+R** (refresh)
3. Wait for page to reload
4. Check Connection Pooling tab again

---

## 🔍 Solution 4: Check if You're in the Right Project

Make sure you're viewing the correct project:

1. Look at the top of Supabase dashboard
2. You should see your project name: **smart-pos-system**
3. If you see a different project, click the dropdown and select **smart-pos-system**

---

## 🔍 Solution 5: Check Browser Console for Errors

If nothing appears:

1. Press **F12** to open Developer Tools
2. Click **"Console"** tab
3. Look for any red error messages
4. Take a screenshot of any errors

**Common errors:**
- `Failed to load connection string` - Try refreshing
- `Unauthorized` - Log out and log back in
- `Project not found` - Make sure you selected the right project

---

## 🔍 Solution 6: Try a Different Browser

Sometimes browser cache causes issues:

1. Try **Chrome**, **Firefox**, or **Safari**
2. Go to https://supabase.com
3. Log in again
4. Go to Settings → Database
5. Check Connection Pooling

---

## 🔍 Solution 7: Log Out and Log Back In

Session issues can prevent connection string from showing:

1. Click your profile icon (top right)
2. Click **"Sign out"**
3. Go to https://supabase.com
4. Log in again
5. Select your project
6. Go to Settings → Database
7. Check Connection Pooling

---

## 🔍 Solution 8: Check if Database is Paused

Free tier databases pause after 1 week of inactivity:

1. Go to **Settings → General**
2. Look for **"Database Status"**
3. If it says **"Paused"**, click **"Resume"**
4. Wait for database to resume
5. Go back to Settings → Database
6. Check Connection Pooling

---

## 🔍 Solution 9: Create a New Project

If nothing works, create a new project:

1. Go to Supabase dashboard
2. Click **"New Project"**
3. Fill in details:
   - Name: `smart-pos-system-v2`
   - Password: Generate new password
   - Region: Same as before
4. Click **"Create new project"**
5. Wait 2-3 minutes
6. Go to Settings → Database
7. Check Connection Pooling

---

## 📋 Alternative: Get Connection Details Manually

If you still can't see the connection string, you can build it manually:

### Step 1: Get Your Project ID

1. Go to **Settings → General**
2. Look for **"Project ID"** or **"Reference ID"**
3. Copy it (looks like: `abcdefghijklmnop`)

### Step 2: Get Your Password

1. Go to **Settings → Database**
2. Look for **"Database Password"**
3. If you see it, copy it
4. If not, you can reset it by clicking **"Reset password"**

### Step 3: Build Connection String Manually

Use this format:
```
postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
```

**Example:**
```
postgresql://postgres:MyPassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

## 🔑 Get Connection Details from Settings

If Connection Pooling tab is empty, look for individual connection details:

1. Go to **Settings → Database**
2. Scroll down to find:

```
Host: db.PROJECT_ID.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [YOUR_PASSWORD]
```

3. Use these to build your connection string:
```
postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
```

---

## 📞 Still Not Working?

### Check Supabase Status

1. Go to https://status.supabase.com
2. Check if there are any service outages
3. If there's an outage, wait for it to be resolved

### Contact Supabase Support

1. Go to https://github.com/supabase/supabase/discussions
2. Create a new discussion
3. Describe your issue
4. Include screenshots

### Check Supabase Docs

- Connection Guide: https://supabase.com/docs/guides/database/connecting-to-postgres
- Connection Pooling: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling-with-supavisor

---

## ✅ Verification Checklist

- [ ] Database status is "Active"
- [ ] You're in the correct project
- [ ] You tried refreshing the page
- [ ] You tried Direct connection tab
- [ ] You tried a different browser
- [ ] You logged out and back in
- [ ] You checked for browser errors
- [ ] You have connection details (Host, Port, User, Password)

---

## 🎯 Next Steps

Once you have the connection string:

1. ✅ Copy connection string
2. ✅ Save it securely
3. ⏳ Create Upstash Redis
4. ⏳ Deploy to Vercel
5. ⏳ Run migrations

---

## 📝 Connection String Format Reference

**Format:**
```
postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
```

**Components:**
- `postgresql://` - Protocol
- `postgres` - Username
- `:PASSWORD` - Your database password
- `@db.PROJECT_ID.supabase.co` - Host
- `:5432` - Port
- `/postgres` - Database name

**Example:**
```
postgresql://postgres:Tr0pic@lSunset#2024!Secure@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

*Last Updated: April 13, 2026*  
*System: Smart POS System v1.0.0*  
*Status: Troubleshooting Guide*
