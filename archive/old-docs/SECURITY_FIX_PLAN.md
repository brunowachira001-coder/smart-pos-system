# SECURITY FIX EXECUTION PLAN

## PHASE 1: GLOBAL AUTH ENFORCEMENT ✅ (Partially Complete)

### Status:
- ✅ `secureRoute` with HMAC-SHA256 exists in `lib/secure-route.ts`
- ✅ Token signing/verification implemented
- ✅ Tenant isolation enforced server-side
- ⚠️ OLD `withAuth` middleware still in use (11 routes)
- ❌ MANY routes have NO authentication (50+ routes)

## PHASE 2: ROUTE MIGRATION (IN PROGRESS)

### Routes using OLD withAuth (MUST MIGRATE):
1. pages/api/dashboard/comprehensive-stats.ts
2. pages/api/users/list.ts
3. pages/api/returns/index.ts
4. pages/api/products/list.ts
5. pages/api/inventory/index.ts
6. pages/api/customers/index.ts
7. pages/api/customers/list.ts
8. pages/api/sales-analytics/overview.ts
9. pages/api/transactions/list.ts
10. pages/api/debts/index.ts
11. pages/api/expenses/index.ts

### Routes with NO AUTHENTICATION (CRITICAL):
**Must secure immediately:**
- pages/api/shop-settings/index.ts
- pages/api/products/search.ts
- pages/api/products/index.ts
- pages/api/inventory/adjust.ts
- pages/api/inventory/restock.ts
- pages/api/inventory/list.ts
- pages/api/customers/credit.ts
- pages/api/transactions/[id].ts
- pages/api/pos/checkout.ts
- pages/api/pos/cart.ts
- pages/api/returns/[id]/process.ts
- pages/api/returns/reasons.ts
- pages/api/expenses/categories.ts
- pages/api/expenses/stats.ts
- pages/api/expenses/[id]/approve.ts
- pages/api/debts/[id]/payment.ts
- pages/api/sms/queue.ts
- pages/api/sms/stats.ts
- pages/api/sms/config.ts
- pages/api/sms/automation.ts
- pages/api/sms/send.ts
- pages/api/sms/send-mobitech.ts
- pages/api/sms/send-manual-celcom.ts
- pages/api/sales/index.ts
- pages/api/settings/index.ts

**Safe to leave public (explicitly allowed):**
- pages/api/auth/login.ts (login endpoint)
- pages/api/tenant/onboard.ts (tenant creation)
- pages/api/health.ts (health check)
- pages/api/health/detailed.ts (monitoring)
- pages/api/cron/process-automations.ts (has cron secret auth)

**Debug/test endpoints (DELETE in production):**
- pages/api/verify-env.ts
- pages/api/debug-profile.ts
- pages/api/debug-return-inventory.ts
- pages/api/debug-transaction.ts
- pages/api/test-apis.ts
- pages/api/test-db-connection.ts
- pages/api/diagnostic.ts
- pages/api/debug/check-env.ts
- pages/api/debug/check-db.ts
- pages/api/admin/run-migration.ts
- pages/api/setup/create-pos-tables.ts
- pages/api/auth/create-test-user.ts
- pages/api/auth/test-login.ts

## PHASE 3: REMOVE LEGACY CODE
- ❌ Delete lib/auth-middleware.ts (old withAuth)
- ✅ supabaseAdmin already removed from exports

## PHASE 4: VALIDATION
- Test forged token rejection
- Test cross-tenant access blocking
- Test unauthenticated access blocking
