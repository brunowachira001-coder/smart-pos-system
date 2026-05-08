# 🔧 Cart Empty Issue - Quick Fix

## Problem
Cart shows toast "Product added" but cart is empty when you click the cart button.

## Most Likely Cause
The `cart_items` table has Row Level Security (RLS) enabled, blocking inserts.

---

## 🚀 QUICK FIX (Do This Now)

### Step 1: Check Browser Console
1. Open your site
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Click "Add to Cart" on a product
5. Look for errors (red text)

**What to look for:**
- "Error adding to cart: ..."
- "Failed to fetch cart: ..."
- Any 403 or 401 errors

### Step 2: Fix Database (Run This SQL)

Go to Supabase → SQL Editor and run this:

```sql
-- Disable RLS on cart_items table
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- Verify it worked
SELECT COUNT(*) FROM cart_items;
```

### Step 3: Test Again
1. Refresh your POS page (Ctrl+Shift+R or Cmd+Shift+R)
2. Click "Add to Cart"
3. Open cart modal
4. Cart should now show items!

---

## 🔍 If Still Not Working

### Check 1: Does cart_items table exist?

Run in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'cart_items';
```

**If empty:** Table doesn't exist. Run `lib/pos-schema.sql` to create it.

### Check 2: Check console logs

After clicking "Add to Cart", you should see in browser console:
```
Adding to cart: {sessionId: "...", productId: "...", ...}
Cart item added successfully: [some-id]
Cart fetched: {items: [...], total: ...}
Cart items found: 1
```

**If you see errors instead:** Copy the error and let me know.

### Check 3: Verify API is working

Open this URL in your browser (replace with your domain):
```
https://your-site.vercel.app/api/pos/cart?sessionId=test-123
```

**Expected response:**
```json
{"items":[],"total":0,"itemCount":0}
```

**If you get an error:** There's a database connection issue.

---

## 📋 Common Issues & Solutions

### Issue 1: RLS Blocking Inserts
**Symptom:** Console shows "new row violates row-level security policy"

**Fix:** Run the SQL from Step 2 above

### Issue 2: Table Doesn't Exist
**Symptom:** Console shows "relation cart_items does not exist"

**Fix:** Run `lib/pos-schema.sql` in Supabase SQL Editor

### Issue 3: Session ID Not Persisting
**Symptom:** Cart empties on page refresh

**Fix:** This is normal - cart is session-based. Each page load creates a new session.

### Issue 4: API Not Responding
**Symptom:** Network tab shows failed requests

**Fix:** Check Vercel deployment logs for errors

---

## 🎯 Quick Test Script

Run this in Supabase SQL Editor to test manually:

```sql
-- Insert a test cart item
INSERT INTO cart_items (
  session_id,
  product_id,
  product_name,
  sku,
  quantity,
  unit_price,
  price_type,
  subtotal
) VALUES (
  'test-session-123',
  (SELECT id FROM products LIMIT 1),
  'Test Product',
  'TEST-001',
  1,
  100.00,
  'retail',
  100.00
);

-- Check if it was inserted
SELECT * FROM cart_items WHERE session_id = 'test-session-123';

-- Clean up
DELETE FROM cart_items WHERE session_id = 'test-session-123';
```

**If this works:** The table is fine, issue is with the API or frontend.

**If this fails:** There's a database permission issue.

---

## 💡 Most Common Fix

**90% of the time, this is the issue:**

The `cart_items` table has RLS enabled and no policies, blocking all inserts.

**Solution:**
```sql
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
```

Run this in Supabase SQL Editor and test again!

---

## 📞 Still Stuck?

Send me:
1. Screenshot of browser console (F12 → Console tab)
2. Result of running: `SELECT * FROM cart_items LIMIT 5;` in Supabase
3. Any error messages you see

I'll help you fix it immediately!
