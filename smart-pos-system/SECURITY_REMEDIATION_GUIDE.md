# Security Remediation Guide - Smart POS System

**Priority**: CRITICAL - Must complete before production deployment  
**Estimated Time**: 3-5 days for critical fixes

---

## CRITICAL FIX #1: Remove Hardcoded Secrets

### Current Code (VULNERABLE)
```typescript
// lib/config.ts
export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',  // ❌ HARDCODED
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',  // ❌ HARDCODED
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || '12345678901234567890123456789012',  // ❌ HARDCODED
  },
};
```

### Fixed Code (SECURE)
```typescript
// lib/config.ts
function validateRequiredEnv(varName: string): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`CRITICAL: Environment variable ${varName} is not set. Cannot start application.`);
  }
  return value;
}

export const config = {
  jwt: {
    secret: validateRequiredEnv('JWT_SECRET'),
    refreshSecret: validateRequiredEnv('JWT_REFRESH_SECRET'),
    expiry: process.env.JWT_EXPIRY || '24h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  encryption: {
    key: validateRequiredEnv('ENCRYPTION_KEY'),
  },
  // ... rest of config
};

// Validate on startup
if (process.env.NODE_ENV === 'production') {
  try {
    config.jwt.secret;
    config.jwt.refreshSecret;
    config.encryption.key;
    console.log('✅ All required environment variables are set');
  } catch (error) {
    console.error('❌ FATAL:', error.message);
    process.exit(1);
  }
}
```

### Environment Variables Required
```bash
# Generate these securely
JWT_SECRET=<generate with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>
ENCRYPTION_KEY=<generate with: openssl rand -hex 32>
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NODE_ENV=production
```

---

## CRITICAL FIX #2: Secure Session Token Generation

### Current Code (VULNERABLE)
```typescript
// pages/api/auth/login.ts
const session = await prisma.userSession.create({
  data: {
    sessionToken: `session-${Date.now()}`,  // ❌ PREDICTABLE
    refreshToken: `refresh-${Date.now()}`,  // ❌ PREDICTABLE
    // ...
  },
});
```

### Fixed Code (SECURE)
```typescript
// lib/tokenGenerator.ts
import { randomBytes } from 'crypto';

export function generateSecureToken(prefix: string = ''): string {
  const randomPart = randomBytes(32).toString('hex');
  return prefix ? `${prefix}_${randomPart}` : randomPart;
}

// pages/api/auth/login.ts
import { generateSecureToken } from '@/lib/tokenGenerator';

const session = await prisma.userSession.create({
  data: {
    sessionToken: generateSecureToken('session'),  // ✅ Cryptographically secure
    refreshToken: generateSecureToken('refresh'),  // ✅ Cryptographically secure
    deviceFingerprint: generateDeviceFingerprint(req),
    ipAddress: req.headers['x-forwarded-for'] as string,
    userAgent: req.headers['user-agent'],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
});
```

---

## CRITICAL FIX #3: Add Input Validation

### Install Validation Library
```bash
npm install joi express-validator
```

### Create Validation Schemas
```typescript
// lib/validators.ts
import Joi from 'joi';

export const transactionSchema = Joi.object({
  branchId: Joi.number().integer().positive().required(),
  customerId: Joi.number().integer().positive().optional().allow(null),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).max(10000).required(),
        unitPrice: Joi.number().positive().required(),
        discountPercent: Joi.number().min(0).max(100).optional(),
      })
    )
    .min(1)
    .required(),
  discountAmount: Joi.number().min(0).required(),
  taxAmount: Joi.number().min(0).required(),
});

export const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(20).required(),
  password: Joi.string().min(8).required(),
});

export const productSearchSchema = Joi.object({
  q: Joi.string().max(100).required(),
  branchId: Joi.number().integer().positive().required(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
```

### Apply Validation to Endpoints
```typescript
// pages/api/pos/transactions.ts
import { transactionSchema } from '@/lib/validators';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate input
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.message}`
      });
    }

    // Use validated data
    const transaction = await posService.createTransaction({
      ...value,
      createdBy: req.user.userId,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    logger.error('Transaction creation failed', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default authMiddleware(handler);
```

---

## CRITICAL FIX #4: Implement CSRF Protection

### Install CSRF Library
```bash
npm install csurf
```

### Add CSRF Middleware
```typescript
// middleware/csrf.ts
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

export const csrfProtection = csrf({ cookie: false });

// In your API setup
app.use(cookieParser());
app.use(csrfProtection);

// Middleware to add CSRF token to responses
export const addCsrfToken = (req, res, next) => {
  res.setHeader('X-CSRF-Token', req.csrfToken());
  next();
};
```

### Apply to Endpoints
```typescript
// pages/api/pos/transactions.ts
import { csrfProtection } from '@/middleware/csrf';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // CSRF token is automatically validated by middleware
    // If invalid, csrfProtection middleware will reject the request
  }
  // ... rest of handler
}

export default authMiddleware(csrfProtection(handler));
```

---

## CRITICAL FIX #5: Add Rate Limiting

### Install Rate Limiting Library
```bash
npm install express-rate-limit
```

### Create Rate Limiters
```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-forwarded-for'] as string || req.ip,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,  // 100 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 30,  // 30 searches per minute
  message: 'Too many search requests',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Apply Rate Limiters
```typescript
// pages/api/auth/login.ts
import { loginLimiter } from '@/middleware/rateLimiter';

async function handler(req, res) {
  // ... handler code
}

export default loginLimiter(handler);

// pages/api/products/search.ts
import { searchLimiter } from '@/middleware/rateLimiter';

async function handler(req, res) {
  // ... handler code
}

export default authMiddleware(searchLimiter(handler));
```

---

## CRITICAL FIX #6: Implement Authorization Checks

### Add Branch Access Control
```typescript
// lib/authorization.ts
export async function checkBranchAccess(userId: bigint, branchId: bigint): Promise<boolean> {
  const access = await prisma.userBranch.findFirst({
    where: {
      userId,
      branchId,
      status: 'ACTIVE'
    }
  });

  return !!access;
}

export async function requireBranchAccess(branchId: bigint) {
  return (handler) => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const hasAccess = await checkBranchAccess(req.user.userId, branchId);

      if (!hasAccess) {
        logger.warn(`Unauthorized branch access attempt`, {
          userId: req.user.userId,
          branchId,
          ipAddress: req.headers['x-forwarded-for']
        });
        return res.status(403).json({ error: 'Access denied' });
      }

      return handler(req, res);
    };
  };
}
```

### Apply Authorization to Services
```typescript
// services/pos.service.ts
async createTransaction(data: {
  branchId: bigint;
  // ... other fields
}, userId: bigint) {
  // Verify user has access to this branch
  const hasAccess = await checkBranchAccess(userId, data.branchId);
  if (!hasAccess) {
    throw new AuthorizationError('Access denied to this branch');
  }

  // Continue with transaction creation
  // ...
}
```

---

## CRITICAL FIX #7: Update Vulnerable Dependencies

### Check for Vulnerabilities
```bash
npm audit
npm audit --audit-level=moderate
```

### Update Dependencies
```bash
npm update
npm install --save-dev npm-check-updates
npx ncu -u
npm install
npm audit fix
```

### Add Missing Security Dependencies
```bash
npm install express-validator helmet express-rate-limit csurf bcryptjs dotenv-safe
npm install --save-dev snyk
```

### Update package.json
```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "@prisma/client": "^5.7.0",
    "axios": "^1.7.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.2",
    "express": "^4.19.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.0",
    "csurf": "^1.11.0",
    "express-validator": "^7.0.0",
    "dotenv-safe": "^8.2.0",
    "joi": "^17.11.0",
    "redis": "^4.7.0",
    "ioredis": "^5.3.0",
    "winston": "^3.11.0",
    "uuid": "^9.0.0",
    "date-fns": "^2.30.0",
    "lodash": "^4.17.21",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "pg": "^8.11.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  }
}
```

---

## HIGH PRIORITY FIX #1: Implement MFA

### Install MFA Library
```bash
npm install speakeasy qrcode
```

### Create MFA Service
```typescript
// services/mfa.service.ts
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class MFAService {
  async generateSecret(userId: bigint, email: string) {
    const secret = speakeasy.generateSecret({
      name: `Smart POS (${email})`,
      issuer: 'Smart POS System',
      length: 32
    });

    return {
      secret: secret.base32,
      qrCode: await QRCode.toDataURL(secret.otpauth_url),
      backupCodes: this.generateBackupCodes(10)
    };
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });
  }

  private generateBackupCodes(count: number): string[] {
    return Array.from({ length: count }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  }
}

export const mfaService = new MFAService();
```

### Add MFA to Login
```typescript
// pages/api/auth/login.ts
async function handler(req, res) {
  // ... existing login code ...

  // Check if user has MFA enabled
  const mfaSettings = await prisma.mFASettings.findUnique({
    where: { userId: user.id }
  });

  if (mfaSettings?.isEnabled) {
    // Return temporary token, require MFA verification
    return res.status(200).json({
      success: true,
      requiresMFA: true,
      tempToken: generateTempToken(user.id),
      message: 'Please enter your MFA code'
    });
  }

  // ... continue with normal login ...
}
```

---

## HIGH PRIORITY FIX #2: Add Session Timeout

### Update Auth Middleware
```typescript
// middleware/auth.ts
const SESSION_TIMEOUT = 30 * 60 * 1000;  // 30 minutes

export const authMiddleware = (handler) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, config.jwt.secret) as any;

      // Check session timeout
      const session = await prisma.userSession.findUnique({
        where: { id: decoded.sessionId }
      });

      if (!session) {
        return res.status(401).json({ error: 'Session not found' });
      }

      if (!session.isActive) {
        return res.status(401).json({ error: 'Session is inactive' });
      }

      const timeSinceLastActivity = Date.now() - session.lastActivity.getTime();
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        // Invalidate session
        await prisma.userSession.update({
          where: { id: session.id },
          data: { isActive: false }
        });
        return res.status(401).json({ error: 'Session expired' });
      }

      // Update last activity
      await prisma.userSession.update({
        where: { id: session.id },
        data: { lastActivity: new Date() }
      });

      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      logger.error('Authentication failed', error);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
};
```

---

## HIGH PRIORITY FIX #3: Add Security Headers

### Create Security Headers Middleware
```typescript
// middleware/securityHeaders.ts
import helmet from 'helmet';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,  // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  noSniff: true,
  xssFilter: true,
});

// Apply to all routes
app.use(securityHeaders);
```

---

## Deployment Checklist

- [ ] All hardcoded secrets removed
- [ ] Environment variables validated at startup
- [ ] Session tokens use cryptographic randomness
- [ ] CSRF protection implemented on all state-changing endpoints
- [ ] Rate limiting on authentication endpoints
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all endpoints
- [ ] Authorization checks on all endpoints
- [ ] MFA implemented
- [ ] Session timeout implemented
- [ ] Security headers added
- [ ] CORS configured
- [ ] npm audit passes
- [ ] No secrets in git history
- [ ] Error messages don't expose sensitive data
- [ ] Database connection uses SSL
- [ ] Redis connection uses TLS
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented

---

**Next Steps**:
1. Implement fixes in priority order
2. Test each fix thoroughly
3. Run npm audit to verify
4. Conduct code review
5. Deploy to staging environment
6. Conduct security testing
7. Deploy to production

