# Smart POS System - Deploy Now Guide

**Status**: ✅ **READY FOR IMMEDIATE DEPLOYMENT**

## Quick Start Deployment (Choose One)

### 🚀 Option A: Deploy to Vercel + Supabase (5 minutes)

**Best for**: Quick deployment, minimal setup

```bash
# 1. Create Supabase project
# Visit https://supabase.com and create new project
# Copy connection string

# 2. Create Upstash Redis
# Visit https://upstash.com and create Redis database
# Copy connection string

# 3. Deploy to Vercel
npm install -g vercel
vercel login
vercel --prod

# 4. Set environment variables in Vercel dashboard
# DATABASE_URL: (from Supabase)
# REDIS_URL: (from Upstash)
# JWT_SECRET: (generate: openssl rand -base64 32)
# JWT_REFRESH_SECRET: (generate: openssl rand -base64 32)
# ENCRYPTION_KEY: (generate: openssl rand -hex 16)
# OPENAI_API_KEY: (from OpenAI)
# NEXT_PUBLIC_API_URL: (your Vercel domain)

# 5. Run migrations
# In Vercel dashboard, add build command:
# npx prisma migrate deploy && npx prisma db seed

# Done! Your app is live at https://your-app.vercel.app
```

---

### 🐳 Option B: Deploy with Docker (10 minutes)

**Best for**: Full control, self-hosted

```bash
# 1. Prepare environment
cp .env.production.example .env.production
# Edit .env.production with your values

# 2. Build Docker image
docker build -t smart-pos:latest .

# 3. Start services
docker-compose -f docker-compose.production.yml up -d

# 4. Run migrations
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy

# 5. Seed database
docker-compose -f docker-compose.production.yml exec app npx prisma db seed

# 6. Verify
curl http://localhost:3000/api/health

# Done! Your app is running on http://localhost:3000
```

---

### ☁️ Option C: Deploy to AWS (20 minutes)

**Best for**: Enterprise, scalability

```bash
# 1. Create AWS resources
aws rds create-db-instance \
  --db-instance-identifier smart-pos-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20

aws elasticache create-cache-cluster \
  --cache-cluster-id smart-pos-redis \
  --cache-node-type cache.t3.micro \
  --engine redis

# 2. Create ECR repository
aws ecr create-repository --repository-name smart-pos-system

# 3. Build and push image
docker build -t smart-pos:latest .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker tag smart-pos:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/smart-pos-system:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/smart-pos-system:latest

# 4. Create ECS cluster and service
aws ecs create-cluster --cluster-name smart-pos-cluster
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
aws ecs create-service --cluster smart-pos-cluster --service-name smart-pos-service --task-definition smart-pos:1 --desired-count 2 --launch-type FARGATE

# Done! Your app is running on AWS ECS
```

---

### 🌐 Option D: Deploy to DigitalOcean (15 minutes)

**Best for**: Balance of simplicity and control

```bash
# 1. Create DigitalOcean account and app
# Visit https://www.digitalocean.com/apps

# 2. Connect GitHub repository

# 3. Create app.yaml in repository root:
cat > app.yaml << 'EOF'
name: smart-pos-system
services:
- name: api
  github:
    repo: YOUR_GITHUB_REPO
    branch: main
  build_command: npm install && npm run build
  run_command: npm start
  http_port: 3000
  envs:
  - key: DATABASE_URL
    scope: RUN_AND_BUILD_TIME
    value: ${db.connection_string}
  - key: REDIS_URL
    scope: RUN_AND_BUILD_TIME
    value: ${redis.connection_string}
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: ${jwt_secret}
  - key: JWT_REFRESH_SECRET
    value: ${jwt_refresh_secret}
  - key: ENCRYPTION_KEY
    value: ${encryption_key}
  - key: OPENAI_API_KEY
    value: ${openai_api_key}
  - key: NEXT_PUBLIC_API_URL
    value: ${app_domain}

databases:
- name: db
  engine: PG
  version: "15"
- name: redis
  engine: REDIS
  version: "7"
EOF

# 4. Push to GitHub
git add app.yaml
git commit -m "Add DigitalOcean app configuration"
git push origin main

# 5. DigitalOcean will auto-deploy
# Done! Your app is live on DigitalOcean
```

---

## Post-Deployment Verification

### 1. Test Health Endpoint

```bash
curl https://your-domain.com/api/health

# Expected response:
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

### 2. Test Login

```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Expected response:
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "username": "admin",
      "email": "admin@smartpos.local"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

### 3. Access Dashboard

Open browser and navigate to:
```
https://your-domain.com
```

Login with:
- Username: `admin`
- Password: `admin123`

---

## Environment Variables Needed

Before deploying, gather these values:

```
DATABASE_URL          - PostgreSQL connection string
REDIS_URL             - Redis connection string
JWT_SECRET            - Generate: openssl rand -base64 32
JWT_REFRESH_SECRET    - Generate: openssl rand -base64 32
ENCRYPTION_KEY        - Generate: openssl rand -hex 16
OPENAI_API_KEY        - From https://platform.openai.com
MPESA_CONSUMER_KEY    - From M-Pesa (optional)
MPESA_CONSUMER_SECRET - From M-Pesa (optional)
MPESA_SHORTCODE       - From M-Pesa (optional)
MPESA_PASSKEY         - From M-Pesa (optional)
NEXT_PUBLIC_API_URL   - Your domain (e.g., https://smartpos.com)
```

---

## Troubleshooting

### Database Connection Failed

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# If using Supabase, ensure:
# - Project is active
# - Connection string is correct
# - Network access is allowed
```

### Redis Connection Failed

```bash
# Check connection string
echo $REDIS_URL

# Test connection
redis-cli -u $REDIS_URL ping

# If using Upstash, ensure:
# - Database is active
# - Connection string is correct
```

### Migrations Failed

```bash
# Check migration status
npx prisma migrate status

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Run migrations manually
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

### Application Won't Start

```bash
# Check logs
docker-compose logs -f app

# Verify environment variables
env | grep DATABASE_URL
env | grep REDIS_URL

# Check port availability
lsof -i :3000
```

---

## Monitoring After Deployment

### 1. Setup Monitoring

```bash
# Option A: Vercel Analytics (automatic)
# Option B: Datadog
# Option C: New Relic
# Option D: Self-hosted Prometheus
```

### 2. Setup Alerting

```bash
# Alert on:
# - High error rate (> 1%)
# - High response time (> 1s)
# - Database connection errors
# - Redis connection errors
# - Disk space low (< 10%)
# - Memory usage high (> 80%)
```

### 3. Setup Backups

```bash
# Database backups
# - Daily automated backups
# - 30-day retention
# - Test restore monthly

# Application backups
# - Code repository backups
# - Configuration backups
```

---

## Next Steps After Deployment

1. ✅ Verify system is running
2. ✅ Test all core features
3. ✅ Setup monitoring and alerting
4. ✅ Configure backups
5. ✅ Setup SSL/TLS certificate
6. ✅ Configure custom domain
7. ✅ Setup email notifications
8. ✅ Create incident response plan
9. ✅ Schedule security audit
10. ✅ Plan Phase 2 implementation

---

## Support

### Getting Help

1. Check logs: `docker-compose logs -f app`
2. Review documentation: See `PRODUCTION_DEPLOYMENT.md`
3. Check health endpoint: `curl https://your-domain.com/api/health`
4. Review error messages carefully

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Change port or kill process |
| Database connection error | Check DATABASE_URL and network access |
| Redis connection error | Check REDIS_URL and network access |
| High memory usage | Restart service or increase resources |
| Slow API response | Check database performance or add caching |

---

## Deployment Complete! 🎉

Your Smart POS System is now live in production!

**Next**: Monitor the system, gather user feedback, and plan Phase 2 implementation.

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Environment**: _______________  
**Status**: ✅ **LIVE**
