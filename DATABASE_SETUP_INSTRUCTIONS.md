# Complete Database Setup - Step by Step

## ✅ What's Already Done

1. ✅ Supabase client installed
2. ✅ Database schema created (`lib/database.sql`)
3. ✅ API endpoints created (products, customers, sales)
4. ✅ Supabase connection file created (`lib/supabase.ts`)

## 🚀 What You Need to Do

### Step 1: Create Supabase Account (5 minutes)

1. Go to https://supabase.com
2. Click "Start your project" → Sign up
3. Create new project:
   - Name: `smart-pos-system`
   - Database Password: **SAVE THIS PASSWORD!**
   - Region: Choose closest to you
   - Click "Create new project"

### Step 2: Create Database Tables (2 minutes)

1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New query"
3. Copy ALL content from `lib/database.sql` file
4. Paste into the SQL editor
5. Click "Run" button
6. You should see "Success. No rows returned"

### Step 3: Get Your Credentials (1 minute)

1. Click "Project Settings" (gear icon, bottom left)
2. Click "API" in left menu
3. Copy these values:

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGc...
```

4. Click "Database" in left menu
5. Copy "Connection string" → "URI" tab
6. Replace `[YOUR-PASSWORD]` with your actual password

### Step 4: Add Credentials to Project

Create `.env.local` file in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
```

### Step 5: Test the Connection

```bash
# Restart your dev server
npm run dev
```

Visit: http://localhost:3000/api/products

You should see JSON data with products!

## 🎯 Next Steps After Setup

Once you confirm the database is working, I'll:

1. Update all React pages to use real database
2. Make products/customers/sales persist
3. Add real-time updates
4. Deploy to Vercel with database connection

## ❓ Need Help?

If you get stuck, share:
- Which step you're on
- Any error messages
- Screenshot of the issue

I'll help you fix it immediately!
