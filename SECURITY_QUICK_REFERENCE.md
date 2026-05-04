# 🔒 SECURITY QUICK REFERENCE

## For Developers: How to Secure an API Route

### ❌ BEFORE (Insecure)
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data } = await supabase
    .from('products')
    .select('*');
  
  return res.json(data);
}
```

**Problems:**
- No authentication
- No tenant isolation
- Returns data from ALL tenants

---

### ✅ AFTER (Secure)
```typescript
import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async function handler(req: SecureRequest, res: NextApiResponse) {
  const { tenantId } = req; // Server-derived, never from client
  const db = getAdminDb();
  
  const { data } = await db
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId); // CRITICAL: Filter by tenant
  
  return res.json(data);
});
```

**Fixed:**
- ✅ Requires valid HMAC token
- ✅ Tenant ID from server (database lookup)
- ✅ Only returns current tenant's data

---

## 📋 MIGRATION CHECKLIST

For each route you're securing:

### 1. Update Imports
```typescript
// Remove
import { withAuth, AuthenticatedRequest } from '../../../lib/auth-middleware';
import { supabaseAdmin } from '../../../lib/supabase-client';

// Add
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';
```

### 2. Update Handler Signature
```typescript
// Before
async function handler(req: AuthenticatedRequest, res: NextApiResponse)

// After
async function handler(req: SecureRequest, res: NextApiResponse)
```

### 3. Update Request Context
```typescript
// Before
const { tenantId } = req.auth;
const { userId } = req.auth;

// After
const { tenantId } = req;
const { userId } = req.user;
```

### 4. Update Database Client
```typescript
// Before
const { data } = await supabaseAdmin.from('products')...

// After
const db = getAdminDb();
const { data } = await db.from('products')...
```

### 5. Add Tenant Filtering
```typescript
// For SELECT queries
.eq('tenant_id', tenantId)

// For INSERT operations
.insert({ ...data, tenant_id: tenantId })

// For UPDATE operations
.update(data).eq('id', id).eq('tenant_id', tenantId)

// For DELETE operations
.delete().eq('id', id).eq('tenant_id', tenantId)
```

### 6. Update Export
```typescript
// Before
export default withAuth(handler);

// After
export default secureRoute(handler);
```

---

## 🎯 COMMON PATTERNS

### Pattern 1: Simple GET
```typescript
export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  const { tenantId } = req;
  const db = getAdminDb();
  
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});
```

### Pattern 2: POST with Insert
```typescript
export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { tenantId } = req;
  const db = getAdminDb();
  const { name, price } = req.body;
  
  const { data, error } = await db
    .from('products')
    .insert({
      name,
      price,
      tenant_id: tenantId // CRITICAL
    })
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});
```

### Pattern 3: PUT with Update
```typescript
export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { tenantId } = req;
  const db = getAdminDb();
  const { id, name, price } = req.body;
  
  const { data, error } = await db
    .from('products')
    .update({ name, price })
    .eq('id', id)
    .eq('tenant_id', tenantId) // CRITICAL: Prevent cross-tenant updates
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});
```

### Pattern 4: DELETE
```typescript
export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { tenantId } = req;
  const db = getAdminDb();
  const { id } = req.query;
  
  const { error } = await db
    .from('products')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId); // CRITICAL: Prevent cross-tenant deletes
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});
```

### Pattern 5: Multiple Operations (Transaction-like)
```typescript
export default secureRoute(async (req: SecureRequest, res: NextApiResponse) => {
  const { tenantId } = req;
  const db = getAdminDb();
  
  try {
    // Operation 1: Create order
    const { data: order } = await db
      .from('orders')
      .insert({ ...req.body, tenant_id: tenantId })
      .select()
      .single();
    
    // Operation 2: Update inventory
    await db
      .from('products')
      .update({ stock: db.raw('stock - 1') })
      .eq('id', req.body.product_id)
      .eq('tenant_id', tenantId); // CRITICAL
    
    // Operation 3: Create notification
    await db
      .from('notifications')
      .insert({
        message: 'Order created',
        tenant_id: tenantId // CRITICAL
      });
    
    return res.json({ success: true, order });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
```

---

## ⚠️ CRITICAL RULES

### 🚫 NEVER DO THIS:
```typescript
// ❌ Client-supplied tenant_id
const { tenant_id } = req.body; // NEVER!
const { tenant_id } = req.query; // NEVER!
const { tenant_id } = req.headers; // NEVER!

// ❌ No tenant filtering
await db.from('products').select('*'); // Returns ALL tenants!

// ❌ Using anon client for sensitive operations
import { supabase } from '../../../lib/supabase-client';
await supabase.from('products').select('*'); // Insecure!

// ❌ No authentication
export default async function handler(req, res) { // Unprotected!
```

### ✅ ALWAYS DO THIS:
```typescript
// ✅ Server-derived tenant_id
const { tenantId } = req; // From secureRoute

// ✅ Always filter by tenant
.eq('tenant_id', tenantId)

// ✅ Always add tenant_id to inserts
.insert({ ...data, tenant_id: tenantId })

// ✅ Use admin client
const db = getAdminDb();

// ✅ Wrap with secureRoute
export default secureRoute(async (req: SecureRequest, res) => {
```

---

## 🧪 TESTING YOUR ROUTE

### Test 1: Without Token (Should Fail)
```bash
curl -X GET https://your-app.com/api/your-route
# Expected: {"error":"Unauthorized"} with 401
```

### Test 2: With Valid Token (Should Work)
```bash
# Get token from login
TOKEN=$(curl -X POST https://your-app.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# Use token
curl -X GET https://your-app.com/api/your-route \
  -H "Authorization: Bearer $TOKEN"
# Expected: Your data (200)
```

### Test 3: Tenant Isolation (Should Only Return Own Data)
```bash
# Login as Tenant A
TOKEN_A=$(curl -X POST ... | jq -r '.token')

# Get data
curl -X GET https://your-app.com/api/products/index \
  -H "Authorization: Bearer $TOKEN_A"
# Should only return Tenant A's products
```

---

## 🆘 TROUBLESHOOTING

### Error: "Unauthorized"
**Cause:** No token or invalid token  
**Fix:** Ensure `Authorization: Bearer <token>` header is sent

### Error: "Cannot find module 'secure-route'"
**Cause:** Wrong import path  
**Fix:** Adjust `../` depth based on file location

### Error: "tenant_id column does not exist"
**Cause:** Table missing tenant_id column  
**Fix:** Add column: `ALTER TABLE products ADD COLUMN tenant_id UUID;`

### Error: "User not found"
**Cause:** Token valid but user doesn't exist  
**Fix:** Verify user exists in database with tenant_id

### No data returned (but should have data)
**Cause:** Tenant filtering too restrictive  
**Fix:** Verify tenant_id matches in database

---

## 📚 REFERENCE

### Available in SecureRequest:
```typescript
req.tenantId  // Current tenant ID (UUID)
req.user.userId  // Current user ID (UUID)
req.user.email  // User email
req.user.role  // User role (Admin, Staff, etc.)
```

### Available Functions:
```typescript
getAdminDb()  // Returns Supabase admin client
signToken(userId)  // Create HMAC token
verifyToken(token)  // Verify and decode token
```

---

## ✅ CHECKLIST BEFORE COMMIT

- [ ] Route wrapped with `secureRoute`
- [ ] Using `SecureRequest` type
- [ ] Using `getAdminDb()` for database
- [ ] ALL queries have `.eq('tenant_id', tenantId)`
- [ ] ALL inserts have `tenant_id: tenantId`
- [ ] Tested without token (401)
- [ ] Tested with valid token (200)
- [ ] No TypeScript errors
- [ ] No console errors

---

**Need Help?** Check:
1. `lib/secure-route.ts` - Implementation
2. `pages/api/users/index.ts` - Reference example
3. `SECURITY_FIX_SUMMARY.md` - Full documentation
