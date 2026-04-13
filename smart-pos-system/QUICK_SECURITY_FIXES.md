# Quick Security Fixes - Smart POS System

**Priority**: CRITICAL - Apply immediately before any deployment

---

## Fix #1: Remove Hardcoded Secrets (5 minutes)

**File**: `lib/config.ts`

```typescript
// BEFORE (VULNERABLE)
export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || '12345678901234567890123456789012',
  },
};

// AFTER (SECURE)
function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`CRITICAL: ${name} environment variable is required`);
  }
  return value;
}

export const config = {
  jwt: {
    secret: getRequiredEnv('JWT_SECRET'),
    refreshSecret: getRequiredEnv('JWT_REFRESH_SECRET'),
  },
  encryption: {
    key: getRequiredEnv('ENCRYPTION_KEY'),
  },
};

// Validate on startup
if (process.env.NODE_ENV === 'production') {
  try {
    config.jwt.secret;
    config.jwt.refreshSecret;
    config.encryption.key;
  } catch (error) {
    console.error('FATAL:', error.message);
    process.exit(1);
  }
}
```

---

## Fix #2: Secure Session Tokens (5 minutes)

**File**: `pages/api/auth/login.ts`

```typescript
// BEFORE (VULNERABLE)
const session = await prisma.userSession.create({
  data: {
    sessionToken: `session-${Date.now()}`,
    refreshToken: `refresh-${Date.now()}`,
  },
});

// AFTER (SECURE)
import { randomBytes } from 'crypto';

const session = await prisma.userSession.create({
  data: {
    sessionToken: randomBytes(32).toString('hex'),
    refreshToken: randomBytes(32).toString('hex'),
  },
});
```

---

## Fix #3: Add Input Validation (10 minutes)

**Install**: `npm install joi`

**File**: `pages/api/pos/transactions.ts`

```typescript
// ADD AT TOP
import Joi from 'joi';

const transactionSchema = Joi.object({
  branchId: Joi.number().integer().positive().required(),
  items: Joi.array().min(1).required(),
  discountAmount: Joi.number().min(0).required(),
  taxAmount: Joi.number().min(0).required(),
});

// IN HANDLER
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ADD VALIDATION
  const { error, value } = transactionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // USE VALIDATED DATA
  const transaction = await posService.createTransaction({
    ...value,
    createdBy: req.user.userId,
  });

  res.status(201).json({ success: true, data: transaction });
}
```

---

## Fix #4: Add CSRF Protection (10 minutes)

**Install**: `npm install csurf cookie-parser`

**File**: `middleware/csrf.ts` (create new file)

```typescript
import csrf from 'csurf';

export const csrfProtection = csrf({ cookie: false });
```

**File**: `pages/api/pos/transactions.ts`

```typescript
import { csrfProtection } from '@/middleware/csrf';

async function handler(req, res) {
  // CSRF is automatically validated by middleware
  // If invalid, middleware rejects the request
  // ... rest of handler
}

export default authMiddleware(csrfProtection(handler));
```

---

## Fix #5: Add Rate Limiting (10 minutes)

**Install**: `npm install express-rate-limit`

**File**: `middleware/rateLimiter.ts` (create new file)

```typescript
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts',
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests',
});
```

**File**: `pages/api/auth/login.ts`

```typescript
import { loginLimiter } from '@/middleware/rateLimiter';

async function handler(req, res) {
  // ... handler code
}

export default loginLimiter(handler);
```

---

## Fix #6: Add Authorization Checks (10 minutes)

**File**: `services/pos.service.ts`

```typescript
// ADD THIS FUNCTION
async function checkBranchAccess(userId: bigint, branchId: bigint) {
  const access = await prisma.userBranch.findFirst({
    where: { userId, branchId, status: 'ACTIVE' }
  });
  if (!access) {
    throw new Error('Access denied to this branch');
  }
}

// UPDATE createTransaction
async createTransaction(data: { branchId: bigint; /* ... */ }, userId: bigint) {
  // ADD THIS CHECK
  await checkBranchAccess(userId, data.branchId);

  // ... rest of function
}
```

---

## Fix #7: Update Dependencies (5 minutes)

```bash
npm audit
npm update
npm audit fix
npm install express-validator helmet
```

---

## Fix #8: Add Security Headers (5 minutes)

**Install**: `npm install helmet`

**File**: `pages/_app.tsx` or main server file

```typescript
import helmet from 'helmet';

// Add to your Express app or Next.js config
app.use(helmet());
```

---

## Fix #9: Enforce HTTPS (5 minutes)

**File**: `pages/api/middleware.ts` (create new file)

```typescript
export function enforceHttps(handler) {
  return (req, res) => {
    if (process.env.NODE_ENV === 'production' && !req.secure) {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    return handler(req, res);
  };
}
```

---

## Fix #10: Add Audit Logging (15 minutes)

**File**: `lib/auditLog.ts` (create new file)

```typescript
import { prisma } from './prisma';

export async function auditLog(
  userId: bigint,
  action: string,
  entityType: string,
  entityId: bigint,
  req: any
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      ipAddress: req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      createdAt: new Date(),
    },
  });
}
```

**Use in endpoints**:

```typescript
// After successful transaction
await auditLog(
  req.user.userId,
  'CREATE_TRANSACTION',
  'Transaction',
  transaction.id,
  req
);
```

---

## Environment Variables Required

```bash
# Generate these securely
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Set in Vercel
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
vercel env add ENCRYPTION_KEY
```

---

## Testing Checklist

After applying fixes:

- [ ] `npm audit` passes
- [ ] `npm run build` succeeds
- [ ] `npm run type-check` passes
- [ ] Test login with invalid credentials (should rate limit)
- [ ] Test transaction creation with invalid data (should validate)
- [ ] Test CSRF protection (should reject without token)
- [ ] Test authorization (should deny access to other branches)
- [ ] Verify environment variables are set
- [ ] Verify no hardcoded secrets in code

---

## Deployment Checklist

Before deploying:

- [ ] All 10 fixes applied
- [ ] All tests passing
- [ ] npm audit clean
- [ ] Code reviewed
- [ ] Environment variables set in Vercel
- [ ] Staging deployment successful
- [ ] Production deployment approved

---

## Estimated Time

- Applying all fixes: 1-2 hours
- Testing: 1-2 hours
- Code review: 1 hour
- **Total: 3-5 hours**

---

## Support

If you encounter issues:

1. Check SECURITY_AUDIT_REPORT.md for detailed analysis
2. Check SECURITY_REMEDIATION_GUIDE.md for detailed instructions
3. Review SECURITY_CHECKLIST.txt for verification steps

