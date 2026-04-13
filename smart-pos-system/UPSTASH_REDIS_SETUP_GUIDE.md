# How to Create Upstash Redis

**Date**: April 13, 2026  
**Status**: Step-by-step guide  
**Estimated Time**: 5 minutes

---

## 🎯 Overview

Upstash Redis is a managed Redis database in the cloud. It provides caching for your Smart POS System.

**What you'll get:**
- Redis database
- Connection URL
- Ready for Vercel deployment

---

## 📋 Prerequisites

- Upstash account (or create one at https://upstash.com)
- Email address
- 5 minutes

---

## 🚀 Step-by-Step Setup

### STEP 1: Create Upstash Account (2 minutes)

1. Go to **https://upstash.com**
2. Click **"Sign Up"** or **"Get Started"**
3. Choose sign-up method:
   - Email & Password
   - GitHub
   - Google
4. Fill in your details
5. Verify your email (check inbox)
6. You're now logged in to Upstash dashboard

---

### STEP 2: Create Redis Database (2 minutes)

1. In Upstash dashboard, click **"Create Database"** or **"New Database"**
2. You'll see options for different database types
3. Select **"Redis"** (not Kafka or other options)
4. Fill in database details:

   **Database Name:**
   ```
   smart-pos-redis
   ```

   **Region:**
   - Choose closest to you:
     - US: `us-east-1`
     - EU: `eu-west-1`
     - Asia: `ap-southeast-1`
   
   **Type:**
   - Select **"Free"** (for testing)
   - Or **"Pay as you go"** for production

5. Click **"Create"**
6. Wait 30 seconds for database to be created

---

### STEP 3: Get Redis Connection URL (1 minute)

Once database is created, you'll see the dashboard with connection details:

1. Look for **"REST API"** or **"Redis CLI"** section
2. You should see a **"Redis URL"** or **"Connection String"**
3. It looks like:
   ```
   redis://default:PASSWORD@endpoint.upstash.io:PORT
   ```

4. Click **"Copy"** button to copy the URL
5. Save this as your `REDIS_URL`

---

### STEP 4: Verify Connection Details (1 minute)

You should see:

```
Endpoint: endpoint.upstash.io
Port: PORT_NUMBER
Password: YOUR_PASSWORD
Database: 0
```

**Save all these details** in a secure location.

---

## 📝 Connection URL Format

Your Redis URL will look like:

```
redis://default:PASSWORD@endpoint.upstash.io:PORT
```

**Example:**
```
redis://default:AXZ1234567890abcdefghijklmnop@us1-example.upstash.io:12345
```

**Components:**
- `redis://` - Protocol
- `default` - Username
- `:PASSWORD` - Your Redis password
- `@endpoint.upstash.io` - Upstash host
- `:PORT` - Port number

---

## 💾 Where to Save Connection URL

**Option A: .env.local file**
```
REDIS_URL=redis://default:PASSWORD@endpoint.upstash.io:PORT
```

**Option B: Vercel Environment Variables**
```
Name: REDIS_URL
Value: redis://default:PASSWORD@endpoint.upstash.io:PORT
```

**Option C: Password Manager**
- 1Password
- LastPass
- Bitwarden

---

## 🔐 Security Best Practices

1. **Never commit to Git**
   - Add to `.gitignore`
   - Use environment variables
   - Don't share in code

2. **Save securely**
   - Use password manager
   - Don't save in plain text files
   - Don't share with others

3. **Use environment variables**
   - Store in `.env.local`
   - Use in Vercel secrets
   - Never hardcode

---

## ✅ Verification Checklist

- [ ] Upstash account created
- [ ] Redis database created (smart-pos-redis)
- [ ] Database is "Active"
- [ ] Connection URL copied
- [ ] Password saved securely
- [ ] All details saved

---

## 🆘 Troubleshooting

### Can't Find Connection URL?

**Solution:**
1. Make sure you're in the database dashboard
2. Look for "REST API" or "Redis CLI" section
3. Copy the "Redis URL" or "Connection String"
4. If not visible, refresh the page

### Database Not Creating?

**Solution:**
- Wait 1 minute (sometimes takes longer)
- Refresh page
- Try creating database again

### Connection URL Looks Wrong?

**Should look like:**
```
redis://default:PASSWORD@endpoint.upstash.io:PORT
```

**If missing parts:**
- Check you're on the right page
- Refresh the page
- Try copying again

---

## 📊 Upstash Dashboard Overview

Once logged in, you'll see:

### Main Dashboard
- **Databases** - List of your Redis databases
- **Create Database** - Button to create new database
- **Billing** - Usage and pricing

### Database Details
- **Endpoint** - Redis server address
- **Port** - Connection port
- **Password** - Authentication password
- **REST API** - Alternative connection method
- **Redis CLI** - Command line interface

---

## 🎯 Next Steps

After Upstash Redis setup:

1. ✅ Supabase database created
2. ✅ Upstash Redis created
3. ⏳ Deploy to Vercel (see VERCEL_SUPABASE_DEPLOYMENT.md)
4. ⏳ Run migrations
5. ⏳ Access your app

---

## 📞 Support

- **Upstash Docs**: https://upstash.com/docs
- **Upstash Community**: https://github.com/upstash/upstash-redis
- **Status Page**: https://status.upstash.com

---

## 📝 Summary

You now have:
- ✅ Upstash Redis database
- ✅ Connection URL
- ✅ Redis credentials
- ✅ Ready for Vercel deployment

**Next:** Deploy to Vercel

---

*Last Updated: April 13, 2026*  
*System: Smart POS System v1.0.0*  
*Status: Upstash Redis Setup Guide*
