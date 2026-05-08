# Clear Browser Cache for Prime Tech - Step by Step

## The Problem
"Success. No rows returned" means Prime Tech **ALREADY HAS** shop_settings in the database. The issue is your browser is showing **cached data from Nyla Wigs**.

## Solution: Nuclear Browser Clear (2 minutes)

### Step 1: Clear Everything in Browser

#### Chrome/Edge:
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select **"All time"** from dropdown
3. Check ALL boxes:
   - ✅ Browsing history
   - ✅ Cookies and other site data
   - ✅ Cached images and files
4. Click **"Clear data"**

#### Firefox:
1. Press `Ctrl+Shift+Delete`
2. Select **"Everything"** from time range
3. Check ALL boxes
4. Click **"Clear Now"**

### Step 2: Clear localStorage Manually

1. Go to: `https://smart-pos-system-peach.vercel.app/login`
2. Press `F12` to open DevTools
3. Go to **"Console"** tab
4. Type this and press Enter:
```javascript
localStorage.clear();
sessionStorage.clear();
console.log('✅ All storage cleared!');
```

### Step 3: Hard Refresh

1. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or press `Ctrl+F5`
3. This forces browser to reload everything from server

### Step 4: Close and Reopen Browser

1. **Close ALL browser windows** (not just the tab)
2. Wait 5 seconds
3. Open browser again
4. Go to: `https://smart-pos-system-peach.vercel.app/login`

### Step 5: Login Fresh

1. Login with Prime Tech credentials
2. Should redirect to `/dashboard-pro`
3. Check sidebar - should show **"Prime Tech Electronics Ltd"**
4. Go to Shop Settings - should show Prime Tech data

## Alternative: Use Incognito/Private Mode

If clearing doesn't work, use incognito mode to test:

1. Open **Incognito/Private window**:
   - Chrome: `Ctrl+Shift+N`
   - Firefox: `Ctrl+Shift+P`
   - Edge: `Ctrl+Shift+N`
2. Go to: `https://smart-pos-system-peach.vercel.app/login`
3. Login with Prime Tech credentials
4. Check if sidebar shows correct name

If it works in incognito, the issue is definitely browser cache.

## Verify Database Has Correct Data

Run this in Supabase SQL Editor to confirm Prime Tech has shop_settings:

```sql
SELECT 
  t.business_name as tenant,
  t.slug,
  s.business_name as shop_settings_name,
  s.primary_color,
  s.currency
FROM tenants t
LEFT JOIN shop_settings s ON s.tenant_id = t.id
WHERE t.business_name ILIKE '%prime tech%';
```

**Expected Result:**
- tenant: "Prime Tech Electronics Ltd"
- slug: "prime-tech-electronics-ltd" (or similar)
- shop_settings_name: "Prime Tech Electronics Ltd"
- primary_color: "#10b981"
- currency: "KES"

If this shows correct data, then the problem is 100% browser cache.

## Still Not Working?

If after all these steps Prime Tech still shows empty/wrong data:

### Check JWT Token

1. Login as Prime Tech
2. Open Console (F12)
3. Run:
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Tenant ID:', payload.tenant_id);
console.log('User Email:', payload.email);
```

4. Copy the `tenant_id` value

### Check API Response

1. Stay logged in as Prime Tech
2. Open **Network** tab in DevTools (F12)
3. Go to Shop Settings page
4. Look for request: `/api/shop-settings`
5. Click on it
6. Check **Response** tab
7. Should show Prime Tech data

If response shows Nyla Wigs data, there's a backend issue.
If response shows Prime Tech data, but page shows Nyla Wigs, there's a frontend caching issue.

## Last Resort: Different Browser

Try a completely different browser:
- If using Chrome, try Firefox
- If using Firefox, try Chrome
- If using Edge, try Brave

This will prove if it's browser-specific caching.

## Summary

The database is correct. The issue is browser cache showing old Nyla Wigs data. Follow the nuclear clear steps above and Prime Tech should show correctly.
