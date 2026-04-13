# Smart POS System - Setup Instructions

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- Git
- PostgreSQL 15 (optional if using Docker)
- Redis 7 (optional if using Docker)

## Quick Start (5 minutes)

### 1. Clone Repository

```bash
git clone <repository-url>
cd smart-pos-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env.local
```

### 4. Start Services

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d
```

### 5. Setup Database

```bash
# Run migrations
npx prisma migrate dev

# Seed initial data
npx prisma db seed
```

### 6. Start Development Server

```bash
npm run dev
```

### 7. Access Application

- **URL**: http://localhost:3000
- **Username**: admin
- **Password**: admin123

## Detailed Setup

### Step 1: Environment Configuration

Edit `.env.local` with your settings:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_pos_dev"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"

# Redis
REDIS_URL="redis://localhost:6379"

# OpenAI (optional)
OPENAI_API_KEY="sk-..."

# M-Pesa (optional)
MPESA_CONSUMER_KEY="..."
MPESA_CONSUMER_SECRET="..."
MPESA_SHORTCODE="..."
MPESA_PASSKEY="..."

# Application
NODE_ENV="development"
PORT=3000
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Step 2: Database Setup

#### Option A: Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f
```

#### Option B: Manual Setup

```bash
# Create PostgreSQL database
createdb smart_pos_dev

# Create Redis instance
redis-server

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/smart_pos_dev"
```

### Step 3: Database Migrations

```bash
# Run all pending migrations
npx prisma migrate dev

# View database schema
npx prisma studio
```

### Step 4: Seed Initial Data

Create `prisma/seed.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { encryption } from '@/lib/encryption';

async function main() {
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@smartpos.local',
      passwordHash: encryption.hashPassword('admin123'),
      firstName: 'Admin',
      lastName: 'User',
      status: 'ACTIVE',
    },
  });

  // Create admin role
  const adminRole = await prisma.role.create({
    data: {
      roleName: 'ADMIN',
      description: 'Administrator role',
      isSystemRole: true,
    },
  });

  // Assign role to user
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Create default branch
  await prisma.branch.create({
    data: {
      name: 'Main Branch',
      code: 'MAIN',
      status: 'ACTIVE',
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:

```bash
npx prisma db seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Verification

### 1. Check Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

### 2. Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Access Dashboard

Open browser and navigate to:
```
http://localhost:3000
```

You should be redirected to login page. Use:
- Username: `admin`
- Password: `admin123`

## Docker Deployment

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Production

```bash
# Build image
docker build -t smart-pos:latest .

# Run container
docker run -d \
  --name smart-pos \
  -e DATABASE_URL="postgresql://user:pass@host:5432/smart_pos" \
  -e REDIS_URL="redis://host:6379" \
  -e JWT_SECRET="production-secret" \
  -e NODE_ENV="production" \
  -p 3000:3000 \
  smart-pos:latest

# View logs
docker logs -f smart-pos
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Redis Connection Error

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli ping
```

### Migration Issues

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name migration_name
```

### Build Issues

```bash
# Clear cache
rm -rf .next node_modules

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database commands
npx prisma migrate dev          # Create migration
npx prisma migrate deploy       # Deploy migrations
npx prisma db push             # Push schema to database
npx prisma studio              # Open Prisma Studio
npx prisma db seed             # Run seed script
```

## Project Structure

```
smart-pos-system/
├── pages/                 # Next.js pages and API routes
├── components/            # React components
├── services/              # Business logic
├── middleware/            # Express middleware
├── lib/                   # Utilities
├── types/                 # TypeScript types
├── utils/                 # Helper functions
├── hooks/                 # React hooks
├── styles/                # CSS files
├── prisma/                # Database schema
├── public/                # Static files
├── .env.example           # Environment template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── next.config.js         # Next.js config
├── docker-compose.yml     # Docker Compose
├── Dockerfile             # Docker image
└── README.md              # Documentation
```

## Next Steps

1. ✅ Setup complete
2. Review the [README.md](./README.md) for feature overview
3. Check [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for development guide
4. Start implementing features from the spec
5. Run tests and verify functionality
6. Deploy to production

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the [README.md](./README.md)
3. Check the [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
4. Contact the development team

## Security Notes

⚠️ **Important for Production**:

1. Change all default secrets:
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `ENCRYPTION_KEY`

2. Enable HTTPS/TLS

3. Configure firewall rules

4. Setup database backups

5. Enable audit logging

6. Configure monitoring and alerts

7. Review security checklist in [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

## Performance Tips

1. Use Redis for caching
2. Enable database connection pooling
3. Optimize database queries with indexes
4. Use CDN for static assets
5. Enable gzip compression
6. Monitor performance metrics
7. Setup load balancing for multi-instance deployment

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Documentation](https://docs.docker.com)
