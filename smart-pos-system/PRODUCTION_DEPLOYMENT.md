# Smart POS System - Production Deployment Guide

**Status**: ✅ **READY FOR PRODUCTION DEPLOYMENT**

## Deployment Options

Choose one of the following deployment platforms:

1. **Docker + AWS (ECS/RDS)** - Recommended for scalability
2. **Vercel + Supabase** - Easiest for quick deployment
3. **DigitalOcean App Platform** - Good balance of simplicity and control
4. **Google Cloud Run + Cloud SQL** - Enterprise-grade
5. **Self-hosted with Docker** - Maximum control

---

## Option 1: Docker + AWS (Recommended for Production)

### Prerequisites
- AWS Account with appropriate permissions
- AWS CLI configured
- Docker installed locally

### Step 1: Create AWS Resources

```bash
# 1. Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier smart-pos-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --publicly-accessible false

# 2. Create ElastiCache Redis instance
aws elasticache create-cache-cluster \
  --cache-cluster-id smart-pos-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1

# 3. Create ECR repository
aws ecr create-repository --repository-name smart-pos-system
```

### Step 2: Build and Push Docker Image

```bash
# 1. Build Docker image
docker build -t smart-pos:latest .

# 2. Tag for ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag smart-pos:latest YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/smart-pos-system:latest

# 3. Push to ECR
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/smart-pos-system:latest
```

### Step 3: Create ECS Cluster and Service

```bash
# 1. Create ECS cluster
aws ecs create-cluster --cluster-name smart-pos-cluster

# 2. Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# 3. Create service
aws ecs create-service \
  --cluster smart-pos-cluster \
  --service-name smart-pos-service \
  --task-definition smart-pos:1 \
  --desired-count 2 \
  --launch-type FARGATE
```

### Step 4: Configure Environment Variables

Create `.env.production` in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name smart-pos/production \
  --secret-string file://production-secrets.json
```

**production-secrets.json**:
```json
{
  "DATABASE_URL": "postgresql://postgres:PASSWORD@smart-pos-db.REGION.rds.amazonaws.com:5432/smart_pos",
  "REDIS_URL": "redis://smart-pos-redis.REGION.cache.amazonaws.com:6379",
  "JWT_SECRET": "YOUR_SECURE_JWT_SECRET",
  "JWT_REFRESH_SECRET": "YOUR_SECURE_REFRESH_SECRET",
  "ENCRYPTION_KEY": "YOUR_32_CHARACTER_ENCRYPTION_KEY",
  "OPENAI_API_KEY": "sk-YOUR_KEY",
  "NODE_ENV": "production",
  "PORT": "3000",
  "NEXT_PUBLIC_API_URL": "https://your-domain.com"
}
```

### Step 5: Setup Load Balancer

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name smart-pos-alb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-12345678 \
  --scheme internet-facing \
  --type application

# Create target group
aws elbv2 create-target-group \
  --name smart-pos-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-12345678
```

### Step 6: Setup Auto Scaling

```bash
# Create auto scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name smart-pos-asg \
  --launch-template LaunchTemplateName=smart-pos,Version='$Latest' \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --target-group-arns arn:aws:elasticloadbalancing:...
```

---

## Option 2: Vercel + Supabase (Easiest)

### Step 1: Setup Supabase

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Get connection string from project settings
# 3. Create database tables using Prisma

npx prisma migrate deploy --skip-generate
npx prisma db seed
```

### Step 2: Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables in Vercel dashboard
# - DATABASE_URL (from Supabase)
# - REDIS_URL (use Upstash Redis)
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - ENCRYPTION_KEY
# - OPENAI_API_KEY
```

### Step 3: Configure Supabase

```bash
# 1. Enable Row Level Security (RLS)
# 2. Setup backups
# 3. Configure SSL
# 4. Setup monitoring
```

---

## Option 3: DigitalOcean App Platform

### Step 1: Create DigitalOcean Account

Visit https://www.digitalocean.com and create account

### Step 2: Create Database

```bash
# 1. Create PostgreSQL database cluster
# 2. Create Redis cluster
# 3. Get connection strings
```

### Step 3: Deploy Application

```bash
# 1. Connect GitHub repository
# 2. Create app.yaml:

name: smart-pos-system
services:
- name: api
  github:
    repo: YOUR_REPO
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

databases:
- name: db
  engine: PG
  version: "15"
- name: redis
  engine: REDIS
  version: "7"
```

### Step 4: Deploy

```bash
# Push to GitHub and DigitalOcean will auto-deploy
git push origin main
```

---

## Option 4: Google Cloud Run + Cloud SQL

### Step 1: Setup Google Cloud Project

```bash
# 1. Create project
gcloud projects create smart-pos-system

# 2. Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
```

### Step 2: Create Cloud SQL Instance

```bash
# Create PostgreSQL instance
gcloud sql instances create smart-pos-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create smart_pos \
  --instance=smart-pos-db

# Create user
gcloud sql users create postgres \
  --instance=smart-pos-db \
  --password=YOUR_PASSWORD
```

### Step 3: Create Cloud Memorystore (Redis)

```bash
gcloud redis instances create smart-pos-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=7.0
```

### Step 4: Build and Deploy

```bash
# 1. Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/smart-pos-system

# 2. Deploy to Cloud Run
gcloud run deploy smart-pos-system \
  --image gcr.io/PROJECT_ID/smart-pos-system \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=postgresql://...,REDIS_URL=redis://...
```

---

## Option 5: Self-Hosted with Docker

### Step 1: Provision Server

```bash
# 1. Rent VPS (DigitalOcean, Linode, AWS EC2, etc.)
# 2. SSH into server
ssh root@YOUR_SERVER_IP

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 2: Setup Application

```bash
# 1. Clone repository
git clone YOUR_REPO /opt/smart-pos-system
cd /opt/smart-pos-system

# 2. Create production environment
cp .env.example .env.production
# Edit .env.production with production values

# 3. Create docker-compose.production.yml
```

### Step 3: Start Services

```bash
# 1. Start all services
docker-compose -f docker-compose.production.yml up -d

# 2. Run migrations
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy

# 3. Seed database
docker-compose -f docker-compose.production.yml exec app npx prisma db seed

# 4. Verify
curl http://localhost:3000/api/health
```

### Step 4: Setup Nginx Reverse Proxy

```bash
# 1. Install Nginx
sudo apt-get install nginx

# 2. Create config
sudo nano /etc/nginx/sites-available/smart-pos

# 3. Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 4. Enable site
sudo ln -s /etc/nginx/sites-available/smart-pos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup SSL with Let's Encrypt

```bash
# 1. Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. Get certificate
sudo certbot --nginx -d your-domain.com

# 3. Auto-renewal
sudo systemctl enable certbot.timer
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Check basic health
curl https://your-domain.com/api/health

# Check detailed health
curl https://your-domain.com/api/health/detailed

# Expected response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "checks": {
      "database": { "status": "healthy" },
      "redis": { "status": "healthy" },
      "memory": { ... },
      "uptime": { ... }
    }
  }
}
```

### 2. Test Login

```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Expected response:
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

### 3. Test Product Search

```bash
curl https://your-domain.com/api/products/search?q=milk&branchId=1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Monitor Logs

```bash
# Docker logs
docker-compose logs -f app

# AWS CloudWatch
aws logs tail /ecs/smart-pos --follow

# Google Cloud Logging
gcloud logging read "resource.type=cloud_run_revision"
```

---

## Production Checklist

### Before Going Live

- [ ] Database backups configured
- [ ] SSL/TLS certificate installed
- [ ] Monitoring and alerting setup
- [ ] Log aggregation configured
- [ ] Auto-scaling configured
- [ ] Load balancer configured
- [ ] CDN configured (optional)
- [ ] Email notifications setup
- [ ] Incident response plan created
- [ ] Disaster recovery plan tested

### Security

- [ ] All secrets in environment variables
- [ ] No hardcoded credentials
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] WAF rules configured
- [ ] DDoS protection enabled
- [ ] Regular security audits scheduled

### Performance

- [ ] Database indexes verified
- [ ] Query optimization completed
- [ ] Caching strategy implemented
- [ ] CDN configured
- [ ] Compression enabled
- [ ] Load testing completed
- [ ] Performance monitoring active

### Monitoring

- [ ] Application metrics collected
- [ ] Infrastructure metrics collected
- [ ] Error tracking configured
- [ ] Performance tracking configured
- [ ] Uptime monitoring configured
- [ ] Alert thresholds set
- [ ] Dashboard created

---

## Rollback Procedure

If issues occur after deployment:

```bash
# 1. Identify issue
docker-compose logs -f app

# 2. Rollback to previous version
docker pull YOUR_REGISTRY/smart-pos:previous-tag
docker-compose down
docker-compose up -d

# 3. Verify
curl https://your-domain.com/api/health

# 4. Investigate issue
# Fix code and redeploy
```

---

## Maintenance

### Daily
- Monitor system health
- Check error logs
- Verify backups

### Weekly
- Review performance metrics
- Check security logs
- Update dependencies

### Monthly
- Security audit
- Performance review
- Capacity planning

### Quarterly
- Penetration testing
- Disaster recovery test
- Architecture review

---

## Support & Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Redis Connection Error**
```bash
# Check Redis status
redis-cli ping

# Check connection string
echo $REDIS_URL
```

**High Memory Usage**
```bash
# Check memory
docker stats

# Restart service
docker-compose restart app
```

**Slow API Response**
```bash
# Check database performance
# Check Redis cache hit rate
# Review slow query logs
```

---

## Next Steps

1. Choose deployment platform
2. Follow platform-specific steps
3. Run post-deployment verification
4. Setup monitoring and alerting
5. Configure backups and disaster recovery
6. Schedule regular maintenance

---

**Deployment Status**: ✅ **READY FOR PRODUCTION**

**Support**: For issues, check logs and refer to troubleshooting section above.
