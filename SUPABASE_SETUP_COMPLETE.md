# Complete Supabase Database Setup Guide

## Step 1: Create Supabase Account & Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Click "New Project"
5. Fill in:
   - Name: `smart-pos-system`
   - Database Password: (create a strong password - SAVE THIS!)
   - Region: Choose closest to you
   - Pricing Plan: Free
6. Click "Create new project" (takes 2-3 minutes)

## Step 2: Get Your Database Connection String

1. In your Supabase project dashboard
2. Click "Project Settings" (gear icon, bottom left)
3. Click "Database" in the left menu
4. Scroll to "Connection string"
5. Select "URI" tab
6. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@...`)
7. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 3: Get Your Supabase API Keys

1. Still in Project Settings
2. Click "API" in the left menu
3. Copy these two values:
   - `Project URL` (e.g., https://xxxxx.supabase.co)
   - `anon public` key (long string starting with eyJ...)

## Step 4: Add to Your Project

Create a `.env.local` file in your project root with:

```bash
# Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."

# Backend
BACKEND_URL="http://localhost:4000"
```

## Next Steps

After you complete these steps, I'll:
1. Install Supabase client
2. Create database tables
3. Set up the backend API
4. Connect React to the backend
5. Deploy everything

**Ready?** Once you have your Supabase credentials, paste them here and I'll continue!
