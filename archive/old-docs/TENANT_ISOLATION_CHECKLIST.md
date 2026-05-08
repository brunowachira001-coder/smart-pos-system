# Tenant Isolation Checklist

## ✅ Preventing Cart Empty & Data Leakage Issues

This checklist ensures all new API routes properly implement tenant isolation to prevent issues like the "Cart is empty" error that occurred on May 6, 2026.

---

## 🔒 Core Principles

1. **Every API route that accesses tenant data MUST use `secureRoute` middleware**
2. **Every database query MUST filter by `tenant_id`**
3. **Every insert MUST include `tenant_id` field**
4. **Use `getAdminDb()` instead of direct `supabase` client**

---

## 📋 Pre-Deployment Checklist

### Before Creating a New API Route

- [ ] Identify if the route will access tenant-specific data
- [ ] If yes, plan to use `secureRoute` middleware from the start
- [ ] List all tables the route will query
- [ ] Verify all tables have `tenant_id` column

### When Writing the API Route

```typescript
// ✅ CORRECT - Use secureRoute
import type { NextApiResponse } from 'next';
import { secureRoute, SecureRequest, getAdminDb } from '../../../lib/secure-route';

export default secureRoute(async function handler(req: SecureRequest, res: NextApiResponse) {
  const { tenantId } = req;  // ✅ Get tenant ID from middleware
  const db = getAdminDb();    // ✅ Use admin DB

  // ✅ Always filter by tenant_id
  const { data } = await db
    .from('cart_items')
    .select('*')
    .eq('tenant_id', tenantId);  // ✅ CRITICAL!

  // ✅ Always include tenant_id in inserts
  await db
    .from('cart_items')
    .insert({
      tenant_id: tenantId,  // ✅ CRITICAL!
      // ... other fields
    });
});
```

```typescript
// ❌ WRONG - Direct handler without tenant isolation
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ❌ No tenant_id filtering - will cause data leakage!
  const { data } = await supabase
    .from('cart_items')
    .select('*');
}
```

### Code Review Checklist

- [ ] Route uses `secureRoute` middleware (not plain handler)
- [ ] Route imports `SecureRequest` type
- [ ] Route extracts `tenantId` from `req`
- [ ] Route uses `getAdminDb()` instead of `supabase`
- [ ] All SELECT queries include `.eq('tenant_id', tenantId)`
- [ ] All UPDATE queries include `.eq('tenant_id', tenantId)`
- [ ] All DELETE queries include `.eq('tenant_id', tenantId)`
- [ ] All INSERT operations include `tenant_id: tenantId` field
- [ ] No direct `supabase.from()` calls for tenant tables

### Before Deployment

- [ ] Run validation script: `node scripts/validate-tenant-isolation.js`
- [ ] Fix all HIGH severity issues
- [ ] Review all MEDIUM severity issues
- [ ] Test with multiple tenant accounts
- [ ] Verify data isolation between tenants

---

## 🎯 Tenant-Specific Tables

These tables MUST always have tenant isolation:

- `cart_items` ⚠️ (caused the May 6 issue)
- `transactions`
- `transaction_items`
- `products`
- `customers`
- `debts`
- `expenses`
- `returns`
- `users`
- `shop_settings`
- `sms_templates`
- `sms_logs`
- `sms_queue`
- `sms_automation_rules`

---

## 🚨 Common Mistakes to Avoid

### 1. Mixing Secure and Insecure Routes
```typescript
// ❌ WRONG - Cart API uses secureRoute but Checkout doesn't
// This causes "Cart is empty" error!

// cart.ts - ✅ Correct
export default secureRoute(async function handler(req: SecureRequest, res) {
  const { tenantId } = req;
  await db.from('cart_items').select('*').eq('tenant_id', tenantId);
});

// checkout.ts - ❌ WRONG - Missing tenant isolation!
export default async function handler(req: NextApiRequest, res) {
  await supabase.from('cart_items').select('*'); // No tenant_id filter!
}
```

### 2. Forgetting tenant_id in Inserts
```typescript
// ❌ WRONG
await db.from('cart_items').insert({
  product_id: productId,
  quantity: 1
  // Missing tenant_id!
});

// ✅ CORRECT
await db.from('cart_items').insert({
  tenant_id: tenantId,  // ✅ Always include!
  product_id: productId,
  quantity: 1
});
```

### 3. Using Direct Supabase Client
```typescript
// ❌ WRONG
import { supabase } from '../../../lib/supabase-client';
await supabase.from('products').select('*');

// ✅ CORRECT
const db = getAdminDb();
await db.from('products').select('*').eq('tenant_id', tenantId);
```

---

## 🔧 Validation Script

Run this before every deployment:

```bash
node scripts/validate-tenant-isolation.js
```

This script will:
- ✅ Check all API routes for proper tenant isolation
- ✅ Identify routes querying tenant tables without secureRoute
- ✅ Flag missing tenant_id filters
- ✅ Detect direct supabase client usage
- ✅ Generate a detailed report

---

## 📚 Related Documentation

- `lib/secure-route.ts` - Tenant isolation middleware
- `SECURITY_README.md` - Complete security documentation
- `scripts/validate-tenant-isolation.js` - Validation script

---

## 🎓 Training for New Developers

When onboarding new developers, ensure they:

1. Read this checklist completely
2. Understand the May 6, 2026 cart issue and its root cause
3. Review `lib/secure-route.ts` implementation
4. Practice writing a sample API route with proper tenant isolation
5. Run the validation script on their code before submitting PRs

---

## 📝 Incident History

### May 6, 2026 - Cart Empty Error
**Issue**: Checkout API returned "Cart is empty" even when items were in cart
**Root Cause**: Cart API used `secureRoute` with tenant filtering, but Checkout API didn't
**Impact**: New tenants couldn't complete sales
**Fix**: Converted Checkout API to use `secureRoute` middleware
**Prevention**: Created this checklist and validation script

---

## ✨ Success Criteria

A properly isolated system should:
- ✅ Never show data from other tenants
- ✅ Always filter by tenant_id in all queries
- ✅ Pass validation script with zero HIGH severity issues
- ✅ Work correctly for new tenant onboarding
- ✅ Maintain data isolation under all conditions

---

**Last Updated**: May 6, 2026
**Maintained By**: Development Team
**Review Frequency**: Before every major deployment
