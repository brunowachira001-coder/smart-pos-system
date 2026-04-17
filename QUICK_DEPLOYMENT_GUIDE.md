# 🚀 Quick Deployment Guide

## 5-Minute Setup

### Prerequisites
- Node.js 18+
- PostgreSQL or Supabase account
- OpenAI API key
- GitHub account (for deployment)

---

## Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL=postgresql://...
# JWT_SECRET=<generate_random_key>
# OPENAI_API_KEY=sk-...

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start backend
npm run dev
```

✅ Backend running on http://localhost:5000

---

## Step 2: Frontend Setup (2 minutes)

```bash
# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start frontend
npm run dev
```

✅ Frontend running on http://localhost:3000

---

## Step 3: Test System (1 minute)

1. Open http://localhost:3000
2. Login with `admin/admin123`
3. Navigate through pages
4. Test POS checkout
5. Try AI assistant

✅ System working!

---

## Production Deployment

### Backend (Railway)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to https://railway.app
# 3. Click "New Project"
# 4. Select "Deploy from GitHub"
# 5. Choose repository
# 6. Add environment variables:
#    DATABASE_URL=postgresql://...
#    JWT_SECRET=<key>
#    OPENAI_API_KEY=sk-...
# 7. Deploy

# Get production URL: https://your-app.railway.app
```

### Frontend (Vercel)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to https://vercel.com
# 3. Click "New Project"
# 4. Import repository
# 5. Add environment variable:
#    NEXT_PUBLIC_API_URL=https://your-app.railway.app/api
# 6. Deploy

# Get production URL: https://your-app.vercel.app
```

### Database (Supabase)

```bash
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Get connection string
# 4. Update backend DATABASE_URL
# 5. Run migrations on production
```

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:5432/db
JWT_SECRET=<32_char_random_string>
JWT_REFRESH_SECRET=<32_char_random_string>
OPENAI_API_KEY=sk-<your_key>
NODE_ENV=production
PORT=5000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.smartpos.com/api
```

---

## Generate Random Keys

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate refresh secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Verify Deployment

### Backend
```bash
curl https://your-app.railway.app/health
# Should return: {"status":"OK","timestamp":"..."}
```

### Frontend
```bash
# Open https://your-app.vercel.app
# Should load login page
```

### API Integration
```bash
# Login
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Should return token
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
npm run dev

# Check database connection
psql $DATABASE_URL

# Reset database
npx prisma migrate reset
```

### Frontend won't connect
```bash
# Check API URL
echo $NEXT_PUBLIC_API_URL

# Check backend is running
curl http://localhost:5000/health

# Clear cache
rm -rf .next
npm run dev
```

### Database error
```bash
# Verify connection string
psql $DATABASE_URL

# Run migrations
npm run prisma:migrate

# Seed data
npm run prisma:seed
```

---

## Monitoring

### Backend Logs
- Railway: Dashboard → Logs
- Render: Dashboard → Logs
- Local: `npm run dev`

### Frontend Logs
- Vercel: Dashboard → Logs
- Browser: F12 → Console

### Database Logs
- Supabase: Dashboard → Logs
- Local: `psql -U postgres -d smart_pos`

---

## Scaling

### Add more users
- Increase database connection pool
- Add caching layer (Redis)
- Enable CDN

### Improve performance
- Add database indexes
- Implement caching
- Optimize queries
- Use CDN

### Add features
- Extend API endpoints
- Add new pages
- Integrate more AI features
- Add payment processing

---

## Security Checklist

- [x] JWT authentication
- [x] Password hashing
- [x] Input validation
- [x] CORS configured
- [x] HTTPS enabled
- [x] Environment variables
- [x] Audit logging
- [x] Rate limiting ready

---

## Backup & Recovery

### Database Backup
```bash
# Supabase: Automatic daily backups
# Local: pg_dump smart_pos > backup.sql
```

### Restore Backup
```bash
# psql smart_pos < backup.sql
```

---

## Monitoring & Alerts

### Set up monitoring
1. Sentry (error tracking)
2. DataDog (performance)
3. Uptime Robot (availability)
4. New Relic (APM)

### Configure alerts
- Email on errors
- Slack notifications
- SMS on critical issues

---

## Cost Estimation (Monthly)

| Service | Cost |
|---------|------|
| Railway (backend) | $5-50 |
| Vercel (frontend) | $0-20 |
| Supabase (database) | $25-100 |
| OpenAI (API) | $20-100 |
| Monitoring | $10-50 |
| **Total** | **$60-320** |

---

## Support Resources

- Backend: `backend/README.md`
- Frontend: `FRONTEND_SETUP_GUIDE.md`
- Full Guide: `IMPLEMENTATION_GUIDE_COMPLETE.md`
- API Docs: `backend/README.md`

---

## Next Steps

1. ✅ Set up backend locally
2. ✅ Set up frontend locally
3. ✅ Test system
4. ✅ Deploy backend
5. ✅ Deploy frontend
6. ✅ Configure database
7. ✅ Set up monitoring
8. ✅ Launch!

---

## 🎉 You're Ready!

Your Smart POS System is ready for production deployment!

**Questions?** Check the full documentation or troubleshooting section.

**Ready to deploy?** Follow the steps above!

---

**Version:** 1.0.0
**Last Updated:** April 16, 2026
**Status:** Production Ready 🚀
