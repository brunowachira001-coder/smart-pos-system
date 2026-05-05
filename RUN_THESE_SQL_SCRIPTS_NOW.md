# 🚨 CRITICAL: Run These SQL Scripts NOW

## Step 1: Enable Session Variable Support (REQUIRED)

**File:** `lib/enable-session-variable-rls.sql`

**What it does:** Creates the `set_config()` function that allows the API to set PostgreSQL session variables for tenant isolation.

**How to run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy the entire contents of `lib/enable-session-variable-rls.sql`
4. Paste and click "Run"
5. Should see: "Success. No rows returned"

---

## Step 2: Verify Current State (OPTIONAL but RECOMMENDED)

**File:** `lib/verify-tenant-isolation.sql`

**What it does:** Shows you which tenant owns which data, verifies RLS is enabled, checks for NULL tenant_ids.

**How to run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy the entire contents of `lib/verify-tenant-isolation.sql`
4. Paste and click "Run"
5. Review the results - you should see:
   - Prime Tech: 0 transactions, 0 debts, 0 customers
   - Nyla Wigs: All existing data
   - RLS enabled on all tables
   - User samuelmboogo234@gmail.com mapped to Prime Tech

---

## Step 3: Wait for Deployment

The code changes have been pushed to GitHub. Vercel will automatically deploy them.

**Check deployment status:**
1. Go to https://vercel.com/dashboard
2. Find your project
3. Wait for deployment to complete (usually 2-3 minutes)
4. Status should show "Ready"

---

## Step 4: Test Tenant Isolation (AFTER DEPLOYMENT)

**File:** `lib/test-tenant-isolation.sql`

**What it does:** Tests that RLS policies are working correctly by simulating different user contexts.

**How to run:**
1. **WAIT** for Vercel deployment to complete
2. Open Supabase Dashboard
3. Go to SQL Editor
4. Copy the entire contents of `lib/test-tenant-isolation.sql`
5. Paste and click "Run"
6. Check the "Messages" tab for results:
   - Prime Tech user should see 0 records
   - Nyla Wigs user should see existing data
   - No user context should see 0 records

**Expected output in Messages tab:**
```
NOTICE: Prime Tech Tenant ID: {uuid}
NOTICE: Nyla Wigs Tenant ID: {uuid}
NOTICE: Prime Tech User ID: {uuid}
NOTICE: === TEST 1: Prime Tech User Context ===
NOTICE: Current tenant ID: {prime-tech-uuid}
NOTICE: Visible transactions: 0
NOTICE: Visible debts: 0
NOTICE: Visible customers: 0
NOTICE: Visible products: 0
```

---

## Step 5: Verify in Browser

**Test Prime Tech:**
1. Go to: `https://smart-pos-system-38obh082e-bruno-s-projects-a66ef21e.vercel.app/s/prime-tech-electronics-ltd/login`
2. Login with: `samuelmboogo234@gmail.com`
3. Check dashboard - should show:
   - Total Sales: $0
   - Transactions: 0
   - Outstanding Debts: $0
   - Sales Chart: Empty
   - Analytics: No data

**If you see Nyla Wigs data, something is wrong!**

---

## Troubleshooting

### If Prime Tech still shows Nyla Wigs data:

1. **Check if set_config() function exists:**
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'set_config';
   ```
   Should return 1 row. If not, run Step 1 again.

2. **Check Vercel logs:**
   ```bash
   vercel logs
   ```
   Look for: `User samuelmboogo234@gmail.com accessing as tenant {uuid}`

3. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
     AND tablename = 'transactions';
   ```
   Should show `rowsecurity = true`

4. **Check user-tenant mapping:**
   ```sql
   SELECT email, tenant_id 
   FROM users 
   WHERE email = 'samuelmboogo234@gmail.com';
   ```
   Should show Prime Tech's tenant_id

---

## Quick Checklist

- [ ] Run `lib/enable-session-variable-rls.sql` in Supabase ✅ **DO THIS FIRST**
- [ ] Run `lib/verify-tenant-isolation.sql` in Supabase (optional)
- [ ] Wait for Vercel deployment to complete
- [ ] Run `lib/test-tenant-isolation.sql` in Supabase
- [ ] Login to Prime Tech and verify 0 data shown
- [ ] Check Vercel logs for tenant context logging

---

## What Changed?

**Before:**
- API used service role key which bypassed RLS
- Session variable `app.current_user_id` was never set
- RLS policies existed but were ineffective
- Prime Tech users saw Nyla Wigs data ❌

**After:**
- API sets session variable before every request
- RLS policies now enforce tenant isolation
- Explicit WHERE filters as defense-in-depth
- Prime Tech users see only Prime Tech data ✅
- Nyla Wigs users see only Nyla Wigs data ✅

---

## Need Help?

If you're stuck, check:
1. Supabase SQL Editor for error messages
2. Vercel deployment logs
3. Browser console for API errors
4. `TENANT_ISOLATION_FIX.md` for detailed documentation

---

**Status:** 🚀 Code deployed, waiting for SQL scripts
**Next Step:** Run `lib/enable-session-variable-rls.sql` NOW
