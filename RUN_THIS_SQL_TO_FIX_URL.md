# Fix Prime Tech URL - Run This SQL Now

## The Problem
Your Shop Settings page is showing the wrong URL because your user account (`samuelmboogo234@gmail.com`) is not linked to the Prime Tech tenant in the database.

## The Solution
Run the SQL script below in your Supabase SQL Editor.

---

## Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

---

## Step 2: Copy and Run This SQL

```sql
-- LINK USER TO PRIME TECH TENANT
INSERT INTO tenant_users (user_id, tenant_id, role)
VALUES (
  '9947007e-e7d3-4b3e-97ab-e69c0c0a964c',  -- samuelmboogo234@gmail.com
  '4b208408-970d-4713-9720-60792e5aa969',  -- Prime Tech Electronics Ltd
  'owner'
)
ON CONFLICT (user_id, tenant_id) DO UPDATE
SET role = 'owner',
    updated_at = NOW();

-- Verify it worked
SELECT 
  u.email,
  tu.role,
  t.business_name,
  t.slug,
  CONCAT('https://your-domain.vercel.app/s/', t.slug) as shop_url
FROM tenant_users tu
JOIN auth.users u ON tu.user_id = u.id
JOIN tenants t ON tu.tenant_id = t.id
WHERE u.email = 'samuelmboogo234@gmail.com';
```

---

## Step 3: Verify the Results
After running the SQL, you should see output like this:

| email | role | business_name | slug | shop_url |
|-------|------|---------------|------|----------|
| samuelmboogo234@gmail.com | owner | Prime Tech Electronics Ltd | prime-tech-electronics-ltd | https://your-domain.vercel.app/s/prime-tech-electronics-ltd |

---

## Step 4: Test the Fix
1. **Log out** of your application (if logged in)
2. **Clear your browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
3. **Log in** with `samuelmboogo234@gmail.com`
4. Go to **Shop Settings** page
5. You should now see the correct URL: `https://your-domain.vercel.app/s/prime-tech-electronics-ltd`

---

## What This Does
- Links your user account to the Prime Tech tenant
- Sets your role as "owner" (full permissions)
- The `/api/tenant` endpoint will now return Prime Tech's data when you're logged in
- Shop Settings will display the correct Prime Tech URL

---

## If It Still Doesn't Work
1. Make sure you're logged in with `samuelmboogo234@gmail.com`
2. Try a hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
3. Check browser console for errors (F12 → Console tab)
4. Verify the SQL ran successfully (check the verification query results)

---

## Deployment Status
✅ Code changes have been pushed to GitHub
✅ Vercel deployment should be triggered automatically
✅ SQL script is ready to run in Supabase

**Next Step:** Run the SQL in Supabase SQL Editor!
