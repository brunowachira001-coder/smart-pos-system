# Smart POS System - Production Grade

An AI-powered, enterprise-grade Point of Sale system built with Next.js, NestJS, PostgreSQL, and Redis. Designed for retail operations with real-time inventory, multi-branch support, advanced analytics, and intelligent AI recommendations.

## Features

### Core POS
- **Fast Checkout Engine** - Sub-500ms transaction processing
- **Product Search** - < 100ms search across thousands of products
- **Multiple Payment Methods** - Cash, M-Pesa, Bank Transfers, Credit Sales
- **Receipt Generation** - Digital and thermal printer support
- **Transaction Parking** - Save and resume transactions

### Inventory Management
- **Real-time Stock Tracking** - < 100ms inventory updates
- **Batch Operations** - Efficient bulk updates
- **Low Stock Alerts** - 6 types of intelligent alerts
- **Stock Reconciliation** - Periodic inventory verification
- **Dead Stock Detection** - Identify slow-moving items
- **Multiple Valuation Methods** - FIFO, LIFO, Weighted Average, Standard Cost

### Customer & Credit
- **Customer Database** - Complete customer profiles
- **Credit Management** - Credit limits and debt tracking
- **Payment Tracking** - Reconciliation and aging reports
- **Overdue Alerts** - Automatic payment reminders
- **Financial Accuracy** - Zero tolerance for discrepancies

### AI Engine
- **Daily Reports** - Auto-generated insights at closing time
- **Conversational AI** - Natural language query processing
- **Smart Recommendations** - Data-driven business suggestions
- **Safety Mechanisms** - Confirmation workflows for critical actions

### Analytics & Reporting
- **6 Interactive Dashboards** - Executive, Sales, Profit, Inventory, Customer, Staff
- **Real-time KPIs** - Sales, Profit, Inventory, Customer, Staff metrics
- **Comparative Analysis** - Period-over-period comparisons
- **Export Functionality** - CSV and PDF reports
- **Drill-down Capability** - Deep data exploration

### Security & Audit
- **Immutable Audit Logs** - Every action tracked
- **Role-Based Access Control** - 7 system roles
- **Multi-Factor Authentication** - TOTP, SMS, Email
- **Data Encryption** - AES-256 at rest, TLS 1.3 in transit
- **Fraud Prevention** - Dangerous operation blocking
- **Compliance** - GDPR, PCI DSS, SOX ready

### Multi-Branch & Scaling
- **Branch Management** - Hierarchical branch structure
- **Real-time Sync** - < 1 second latency
- **Offline Capability** - Continue operations without internet
- **Central Dashboard** - Aggregate analytics across branches
- **Horizontal Scaling** - Support 100+ branches, 1000+ concurrent users

### UX & Offline
- **Fast UI** - Checkout screen < 500ms load
- **Mobile-Friendly** - Responsive design for all devices
- **Offline Mode** - Full transaction processing without internet
- **Touch Optimized** - 44x44px buttons for retail environments
- **Accessibility** - WCAG 2.1 AA compliant

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **AI**: OpenAI API
- **Payments**: M-Pesa, Bank Transfers
- **Deployment**: Docker, Docker Compose

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)
- Redis 7 (or use Docker)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository>
cd smart-pos-system
cp .env.example .env.local
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or manually with existing PostgreSQL
npx prisma migrate dev
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 5. Default Credentials

```
Username: admin
Password: admin123
```

## Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production

```bash
docker build -t smart-pos:latest .
docker run -d \
  -e DATABASE_URL="postgresql://user:pass@host:5432/smart_pos" \
  -e REDIS_URL="redis://host:6379" \
  -e JWT_SECRET="your-secret" \
  -e OPENAI_API_KEY="sk-..." \
  -p 3000:3000 \
  smart-pos:latest
```

## Environment Variables

See `.env.example` for all available options:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smart_pos

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...

# M-Pesa
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=...
MPESA_PASSKEY=...

# Application
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## API Documentation

### Authentication

```bash
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

### Products

```bash
GET /api/products/search?q=product&branchId=1&limit=20
```

### Transactions

```bash
POST /api/pos/transactions
{
  "branchId": 1,
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 100,
      "discountPercent": 10
    }
  ],
  "discountAmount": 0,
  "taxAmount": 0
}
```

### Health Check

```bash
GET /api/health
```

## Database Schema

The system includes 20+ tables covering:

- Users & Authentication
- Branches & Organization
- Products & Inventory
- Customers & Credit
- Transactions & Payments
- Audit Logs
- Analytics
- Sync & Offline

See `prisma/schema.prisma` for complete schema.

## Performance Targets

- POS transactions: < 500ms
- Product search: < 100ms
- Inventory updates: < 100ms
- API response: < 200ms (p95)
- System uptime: 99.9%
- Multi-branch sync: < 1 second

## Security

- AES-256 encryption at rest
- TLS 1.3 for data in transit
- JWT with refresh tokens
- Role-based access control
- Multi-factor authentication
- Immutable audit logs
- PCI DSS compliance ready

## Monitoring & Logging

- Structured logging with Winston
- Request/response logging
- Error tracking
- Performance monitoring
- Audit trail for all operations

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

### Project Structure

```
smart-pos-system/
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   ├── dashboard.tsx  # Main dashboard
│   └── login.tsx      # Login page
├── components/        # React components
├── services/          # Business logic
├── middleware/        # Express middleware
├── lib/              # Utilities and helpers
├── types/            # TypeScript types
├── styles/           # CSS files
├── prisma/           # Database schema
└── public/           # Static files
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues and questions, contact the development team.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI features
- [ ] Blockchain for audit trail
- [ ] Advanced reporting
- [ ] Loyalty program integration
- [ ] Supplier management
- [ ] Staff performance tracking
- [ ] Customer analytics

## Changelog

### v1.0.0 (Initial Release)

- Complete POS system
- Multi-branch support
- AI engine
- Advanced analytics
- Security & audit
- Offline mode
