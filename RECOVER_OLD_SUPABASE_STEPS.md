# Recover Old Supabase Project - Step by Step

## Step 1: Find Your Old Supabase Project

1. Go to Vercel and check what database URL is currently being used:
   https://vercel.com/brunowachira001-coders-projects/smart-pos-system-peach/settings/environment-variables

2. Look for `NEXT_PUBLIC_SUPABASE_URL` - copy this URL
   - It will look like: `https://XXXXXXXX.supabase.co`
   - The XXXXXXXX part is your project reference ID

## Step 2: Access Your Supabase Dashboard

1. Go to: https://supabase.com/dashboard/projects
2. Log in with your Supabase account
3. Look for ALL projects (including paused ones)

## Step 3: Check Project Status

You should see one of these scenarios:

### Scenario A: Project is PAUSED
- You'll see a "Paused" badge on the project
- Click on the project
- Click "Restore Project" or "Resume Project"
- Wait 2-3 minutes for it to come back online
- ✅ Done! Your data is back!

### Scenario B: Project is ACTIVE
- The project is already running
- All your data is there
- ✅ Nothing to do! Just keep using it

### Scenario C: Project is DELETED
- You won't see it in the list
- Check if it's in "Recently Deleted" or "Trash"
- If yes, restore it from there
- If no, we'll need to migrate data (but this is unlikely)

## Step 4: Get the Correct Credentials

Once the old project is restored/active:

1. Click on your old project in Supabase dashboard
2. Go to: Settings → API
3. Copy these values:
   - Project URL (under "Project URL")
   - anon/public key (under "Project API keys" → anon public)
   - service_role key (under "Project API keys" → service_role - click "Reveal" first)

## Step 5: Update Your Local .env.local

Replace the values in your `.env.local` file with the OLD project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL="https://[OLD-PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[OLD-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[OLD-SERVICE-ROLE-KEY]"
```

## Step 6: Keep Vercel As-Is

Since Vercel is already pointing to the old database (that's why your data is there), you don't need to change anything in Vercel!

## Step 7: Test Locally

1. Save your `.env.local` file
2. Restart your local dev server if running
3. Test that you can see your data locally

---

## What About the New Database?

You created a new Supabase project (`hrqlvcbmzqjtqsrjkcux`) but it's empty. You have two options:

1. **Keep it as backup** - Don't delete it, might be useful later
2. **Delete it** - Go to Settings → General → Delete Project (saves you from confusion)

---

## Quick Check

After recovery, verify your data is there:

1. Go to your old Supabase project dashboard
2. Click "Table Editor" in the left sidebar
3. Check these tables have data:
   - products
   - customers
   - transactions
   - returns
   - expenses
   - debts

If you see data in these tables, you're all set! 🎉

---

## Need Help?

If you can't find the old project or it's permanently deleted, let me know and we'll create a migration script.
