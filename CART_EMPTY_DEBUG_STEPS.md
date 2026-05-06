# Cart Empty Error - Debug Steps

## Issue
When clicking "Complete Sale", error shows: "error: cart is empty"

## Root Cause Analysis
The checkout API now uses tenant isolation, but there might be:
1. Old cart items without proper tenant_id
2. Session ID mismatch between adding items and checkout
3. Browser cache issues

## Immediate Fix Steps

### Step 1: Clear Old Cart Data
Run this SQL in Supabase SQL Editor:
```sql
-- Clear all cart items to start fresh
DELETE FROM cart_items;
```

### Step 2: Clear Browser Data
1. Open your POS page
2. Open browser DevTools (F12)
3. Go to Application tab → Local Storage
4. Delete the `pos_session_id` key
5. Refresh the page (Ctrl+F5 or Cmd+Shift+R)

### Step 3: Test the Flow
1. Add a product to cart
2. Open browser console (F12)
3. Check for any errors
4. Try to complete the sale

### Step 4: Use Debug Page
Visit: `https://your-domain.vercel.app/debug-pos-session.html`

This page will show you:
- Current session ID
- All localStorage data
- Test cart and checkout APIs directly

## What Was Fixed

### 1. Session ID Persistence
**Before:** Session ID was regenerated on every page refresh
```typescript
const [sessionId] = useState(() => `session-${Date.now()}-...`);
```

**After:** Session ID persists in localStorage
```typescript
const [sessionId] = useState(() => {
  if (typeof window === 'undefined') return `session-${Date.now()}-...`;
  const existing = localStorage.getItem('pos_session_id');
  if (existing) return existing;
  const newSession = `session-${Date.now()}-...`;
  localStorage.setItem('pos_session_id', newSession);
  return newSession;
});
```

### 2. Tenant Isolation in Checkout API
**Before:** Checkout API didn't filter by tenant_id
```typescript
const { data: cartItems } = await supabase
  .from('cart_items')
  .select('*')
  .eq('session_id', sessionId);
```

**After:** Checkout API uses tenant isolation
```typescript
const { data: cartItems } = await db
  .from('cart_items')
  .select('*')
  .eq('session_id', sessionId)
  .eq('tenant_id', tenantId);  // ← Added tenant filter
```

## Verification

After clearing data and refreshing:
1. ✅ Session ID should persist across page refreshes
2. ✅ Cart items should have tenant_id
3. ✅ Checkout should find cart items
4. ✅ Sale should complete successfully

## If Still Not Working

1. Check browser console for errors
2. Visit `/debug-pos-session.html` to see session details
3. Run this SQL to check cart items:
```sql
SELECT 
  id,
  session_id,
  tenant_id,
  product_name,
  quantity,
  created_at
FROM cart_items
ORDER BY created_at DESC
LIMIT 10;
```

4. Check if tenant_id matches your user's tenant:
```sql
SELECT 
  u.id as user_id,
  u.username,
  u.tenant_id,
  t.name as tenant_name
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.username = 'your-username';
```
