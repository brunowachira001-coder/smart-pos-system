# Get Production Database Keys from Vercel

## The Situation
- Production database: `ugemjqouxnholwlgvzer.supabase.co` (has all your data)
- This database is NOT visible in your Supabase dashboard
- But Vercel has the working credentials
- Your site works perfectly because Vercel has the keys

## Steps to Get Keys from Vercel

### 1. Go to Vercel Dashboard
Visit: https://vercel.com/brunowachira001-coders-projects/smart-pos-system-peach

### 2. Navigate to Settings
- Click on "Settings" tab
- Click on "Environment Variables" in the left sidebar

### 3. Find These Variables
Look for:
- `NEXT_PUBLIC_SUPABASE_URL` (should be https://ugemjqouxnholwlgvzer.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (long JWT token starting with eyJ...)
- `SUPABASE_SERVICE_ROLE_KEY` (another long JWT token)

### 4. Copy Each Key
- Click the eye icon to reveal each key
- Copy the full value

### 5. Update Your Local .env.local
Replace `[GET_FROM_VERCEL]` with the actual keys you copied

## After You Get the Keys

Once you have the keys in your `.env.local`, your local development will connect to the same production database that your deployed site uses. This means:

✅ You'll see all your returns, transactions, products, expenses
✅ Local and production will use the same data
✅ No migration needed
✅ Everything just works

## Alternative: Use Vercel CLI

If you have Vercel CLI installed:
```bash
vercel env pull .env.local
```

This will automatically download all environment variables from Vercel.
