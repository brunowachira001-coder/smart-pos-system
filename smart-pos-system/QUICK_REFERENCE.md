# Smart POS System - Quick Reference Guide

## Quick Start

```bash
# 1. Setup
npm install
cp .env.example .env.local
docker-compose up -d

# 2. Database
npx prisma migrate dev
npx prisma db seed

# 3. Run
npm run dev

# 4. Access
http://localhost:3000
Username: admin
Password: admin123
```

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `types/index.ts` | TypeScript types |
| `services/*.ts` | Business logic |
| `pages/api/*.ts` | API endpoints |
| `middleware/*.ts` | Express middleware |
| `lib/config.ts` | Configuration |
| `.env.local` | Environment variables |

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | User login |
| GET | `/api/health` | Health check |
| GET | `/api/products/search` | Search products |
| POST | `/api/pos/transactions` | Create transaction |
| GET | `/api/inventory/stock` | Get stock |
| PUT | `/api/inventory/stock` | Update stock |
| POST | `/api/customers` | Create customer |
| GET | `/api/analytics/sales` | Sales report |

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run linting

# Database
npx prisma migrate dev   # Create migration
npx prisma studio      # Open Prisma Studio
npx prisma db seed     # Seed database

# Docker
docker-compose up -d    # Start services
docker-compose down     # Stop services
docker-compose logs -f  # View logs
```

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smart_pos_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret
OPENAI_API_KEY=sk-...
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Project Structure

```
smart-pos-system/
├── pages/api/          # API routes
├── services/           # Business logic
├── middleware/         # Express middleware
├── lib/               # Utilities
├── types/             # TypeScript types
├── utils/             # Helper functions
├── hooks/             # React hooks
├── styles/            # CSS
├── prisma/            # Database
└── public/            # Static files
```

## Database Tables

| Table | Purpose |
|-------|---------|
| User | User accounts |
| UserSession | Active sessions |
| Role | User roles |
| Permission | System permissions |
| Branch | Store locations |
| Product | Product catalog |
| InventoryItem | Stock levels |
| StockMovement | Stock history |
| Customer | Customer profiles |
| CustomerCredit | Credit tracking |
| CustomerDebt | Debt tracking |
| Transaction | Sales transactions |
| TransactionItem | Transaction items |
| Payment | Payment records |
| AuditLog | Action logs |
| DailySalesReport | Daily reports |
| ProductAnalytics | Product metrics |

## Authentication

```typescript
// Login
const response = await api.post('/api/auth/login', {
  username: 'admin',
  password: 'admin123'
});

// Store tokens
localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);

// Use in requests
const config = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
  }
};
```

## Creating a Transaction

```typescript
const transaction = await api.post('/api/pos/transactions', {
  branchId: 1,
  customerId: 1,
  items: [
    {
      productId: 1,
      quantity: 2,
      unitPrice: 100,
      discountPercent: 10
    }
  ],
  discountAmount: 0,
  taxAmount: 0
});
```

## Searching Products

```typescript
const products = await api.get('/api/products/search', {
  params: {
    q: 'product name',
    branchId: 1,
    limit: 20
  }
});
```

## Updating Stock

```typescript
const updated = await api.put('/api/inventory/stock', {
  productId: 1,
  branchId: 1,
  quantity: 10,
  reason: 'Stock received'
});
```

## Creating a Customer

```typescript
const customer = await api.post('/api/customers', {
  name: 'John Doe',
  phone: '+254712345678',
  email: 'john@example.com',
  creditLimit: 10000
});
```

## Getting Sales Report

```typescript
const report = await api.get('/api/analytics/sales', {
  params: {
    branchId: 1,
    date: '2024-04-13'
  }
});
```

## Error Handling

```typescript
try {
  const response = await api.post('/api/endpoint', data);
  console.log(response.data);
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized
  } else if (error.response?.status === 400) {
    // Validation error
    console.log(error.response.data.fields);
  } else {
    // Other error
    console.log(error.response?.data?.error);
  }
}
```

## Logging

```typescript
import { logger } from '@/lib/logger';

logger.debug('Debug message', data);
logger.info('Info message', data);
logger.warn('Warning message', data);
logger.error('Error message', error);
```

## Encryption

```typescript
import { encryption } from '@/lib/encryption';

// Encrypt
const encrypted = encryption.encrypt('plaintext');

// Decrypt
const decrypted = encryption.decrypt(encrypted);

// Hash password
const hash = encryption.hashPassword('password');

// Verify password
const isValid = encryption.verifyPassword('password', hash);
```

## Configuration

```typescript
import { config } from '@/lib/config';

console.log(config.jwt.secret);
console.log(config.redis.url);
console.log(config.app.port);
```

## Formatting Utilities

```typescript
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatting';

formatCurrency(1000);        // KES 1,000.00
formatDate(new Date());      // Apr 13, 2024 10:30 AM
formatNumber(3.14159, 2);    // 3.14
```

## Validation Utilities

```typescript
import { validateEmail, validatePhone, validatePassword } from '@/utils/validation';

validateEmail('test@example.com');      // true
validatePhone('+254712345678');         // true
validatePassword('SecurePass123!');     // { valid: true, errors: [] }
```

## React Hooks

```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, loading, login, logout, isAuthenticated } = useAuth();

// Login
await login('admin', 'admin123');

// Logout
logout();
```

## Middleware

```typescript
// Authentication
import { authMiddleware } from '@/middleware/auth';

export default authMiddleware(handler);

// Error handling
import { errorHandler } from '@/middleware/errorHandler';

export default errorHandler(handler);

// Require role
import { requireRole } from '@/middleware/auth';

export default requireRole(['ADMIN'])(handler);
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `PORT=3001 npm run dev` |
| Database connection error | Check `DATABASE_URL` in `.env.local` |
| Redis connection error | Check `REDIS_URL` in `.env.local` |
| Migration failed | `npx prisma migrate reset` |
| Build error | `rm -rf .next && npm run build` |

## Performance Tips

1. Use Redis for caching
2. Enable database indexes
3. Optimize queries with Prisma select/include
4. Use code splitting with Next.js
5. Enable gzip compression
6. Monitor performance metrics
7. Setup load balancing

## Security Checklist

- [ ] Change JWT secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS
- [ ] Enable rate limiting
- [ ] Setup firewall rules
- [ ] Enable database encryption
- [ ] Configure backups
- [ ] Setup monitoring
- [ ] Enable audit logging
- [ ] Configure MFA

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Redis Docs](https://redis.io/documentation)
- [Docker Docs](https://docs.docker.com)

## Support

For issues:
1. Check SETUP_INSTRUCTIONS.md
2. Check IMPLEMENTATION_GUIDE.md
3. Review error logs
4. Contact development team

---

**Last Updated**: April 13, 2026
**Version**: 1.0.0
