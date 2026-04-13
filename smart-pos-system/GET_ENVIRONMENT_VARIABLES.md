# How to Get Environment Variables - Smart POS System

**Time Required**: 10-15 minutes  
**Difficulty**: Easy

---

## 📋 ENVIRONMENT VARIABLES NEEDED

You need to collect 7 environment variables:

1. `DATABASE_URL` - Supabase connection string
2. `REDIS_URL` - Upstash Redis connection string
3. `JWT_SECRET` - Generate new
4. `JWT_REFRESH_SECRET` - Generate new
5. `ENCRYPTION_KEY` - Generate new
6. `NODE_ENV` - Set to "production"
7. `NEXT_PUBLIC_API_URL` - Your Vercel domain

---

## 🔍 VARIABLE #1: DATABASE_URL (Supabase)

### You Already Have This!

From earlier, you obtained:
```
postgresql://postgres:[YOUR-PASSWORD]@db.ugemjqouxnholwlgvzer.supabase.co:5432/postgres
```

**To verify or get it again:**

1. Go to https://supabase.com/dashboard
2. Click your project: `smart-pos-system`
3. Click **Settings** (bottom left)
4. Click **Database**
5. Click **Connection Pooling** tab
6. Copy the connection string

**Format:**
```
postgresql://postgres:[PASSWORD]@db.ugemjqouxnholwlgvzer.supabase.co:5432/postgres
```

**Replace `[PASSWORD]` with your actual Supabase password**

---

## 🔍 VARIABLE #2: REDIS_URL (Upstash)

### You Already Have This!

From earlier, you obtained:
```
redis://default:gQAAAAAAAX5TAAIncDE2Y2ViMWM0YTRlOTg0NTc0OGY3NWJmNGRhZmFiYzk0YXAxOTc4NzU@free-pig-97875.upstash.io:6379
```

**To verify or get it again:**

1. Go to https://console.upstash.com
2. Click your Redis database: `smart-pos-redis`
3. Look for **Redis URL** or **Connection String**
4. Copy the full URL

**Format:**
```
redis://default:[PASSWORD]@[ENDPOINT].upstash.io:6379
```

---

## 🔐 VARIABLE #3: JWT_SECRET (Generate New)

This is a secret key for signing JWT tokens.

### Generate in Terminal:

```bash
openssl rand -base64 32
```

**Output example:**
```
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Copy this value and save it**

---

## 🔐 VARIABLE #4: JWT_REFRESH_SECRET (Generate New)

This is a secret key for refresh tokens.

### Generate in Terminal:

```bash
openssl rand -base64 32
```

**Output example:**
```
xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx
```

**Copy this value and save it**

---

## 🔐 VARIABLE #5: ENCRYPTION_KEY (Generate New)

This is a secret key for encrypting sensitive data.

### Generate in Terminal:

```bash
openssl rand -hex 32
```

**Output example:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z
```

**Copy this value and save it**

---

## 📝 VARIABLE #6: NODE_ENV

This tells the system to run in production mode.

**Value:**
```
production
```

**That's it - just type "production"**

---

## 🌐 VARIABLE #7: NEXT_PUBLIC_API_URL

This is your Vercel domain (you'll get this after deployment).

### You'll Get This After Deploying to Vercel

**Format:**
```
https://smart-pos-system.vercel.app
```

**Note:** Replace `smart-pos-system` with your actual project name if different

---

## 📋 QUICK REFERENCE - ALL VARIABLES

Create a text file and save all your variables:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ugemjqouxnholwlgvzer.supabase.co:5432/postgres

REDIS_URL=redis://default:[PASSWORD]@free-pig-97875.upstash.io:6379

JWT_SECRET=[generated value from openssl rand -base64 32]

JWT_REFRESH_SECRET=[generated value from openssl rand -base64 32]

ENCRYPTION_KEY=[generated value from openssl rand -hex 32]

NODE_ENV=production

NEXT_PUBLIC_API_URL=https://smart-pos-system.vercel.app
```

---

## 🚀 HOW TO ADD TO VERCEL

### Step 1: Go to Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click your project: `smart-pos-system`
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)

### Step 2: Add Each Variable

For each variable:

1. Click **Add New**
2. Enter **Name**: (e.g., `DATABASE_URL`)
3. Enter **Value**: (paste the value)
4. Select **Production** (important!)
5. Click **Save**

**Repeat for all 7 variables**

### Step 3: Redeploy

After adding all variables:

1. Go to **Deployments** tab
2. Click the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

## 📸 STEP-BY-STEP VISUAL GUIDE

### Getting DATABASE_URL from Supabase

```
Supabase Dashboard
  ↓
Your Project (smart-pos-system)
  ↓
Settings (bottom left)
  ↓
Database
  ↓
Connection Pooling tab
  ↓
Copy Connection String
```

### Getting REDIS_URL from Upstash

```
Upstash Console
  ↓
Your Redis Database (smart-pos-redis)
  ↓
Look for "Redis URL" or "Connection String"
  ↓
Copy the URL
```

### Generating JWT_SECRET

```
Terminal
  ↓
Run: openssl rand -base64 32
  ↓
Copy the output
```

### Generating JWT_REFRESH_SECRET

```
Terminal
  ↓
Run: openssl rand -base64 32
  ↓
Copy the output
```

### Generating ENCRYPTION_KEY

```
Terminal
  ↓
Run: openssl rand -hex 32
  ↓
Copy the output
```

### Adding to Vercel

```
Vercel Dashboard
  ↓
Your Project
  ↓
Settings
  ↓
Environment Variables
  ↓
Add New (for each variable)
  ↓
Redeploy
```

---

## ✅ VERIFICATION CHECKLIST

After collecting all variables, verify:

- [ ] DATABASE_URL starts with `postgresql://`
- [ ] DATABASE_URL contains your Supabase host
- [ ] DATABASE_URL contains your password
- [ ] REDIS_URL starts with `redis://`
- [ ] REDIS_URL contains your Upstash endpoint
- [ ] JWT_SECRET is 44 characters (base64)
- [ ] JWT_REFRESH_SECRET is 44 characters (base64)
- [ ] ENCRYPTION_KEY is 64 characters (hex)
- [ ] NODE_ENV is exactly "production"
- [ ] NEXT_PUBLIC_API_URL starts with "https://"

---

## 🆘 TROUBLESHOOTING

### "I can't find DATABASE_URL in Supabase"

**Solution:**
1. Go to Supabase dashboard
2. Click your project
3. Click **Settings** (bottom left)
4. Click **Database**
5. Make sure you're on **Connection Pooling** tab (not Direct connection)
6. Copy the connection string

### "I can't find REDIS_URL in Upstash"

**Solution:**
1. Go to Upstash console
2. Click your Redis database
3. Look for "Redis URL" or "Connection String"
4. If not visible, scroll down
5. Copy the full URL

### "openssl command not found"

**Solution:**
- On Mac: Already installed
- On Windows: Install Git Bash or use WSL
- On Linux: Run `sudo apt-get install openssl`

### "I lost my generated secrets"

**Solution:**
- Generate new ones! Just run the commands again
- Each time you run `openssl rand -base64 32`, you get a new secret
- Use the new values

### "Deployment failed after adding variables"

**Solution:**
1. Check all variables are spelled correctly
2. Check no extra spaces in values
3. Make sure NODE_ENV is exactly "production"
4. Redeploy again

---

## 📝 EXAMPLE - COMPLETE SETUP

Here's what your complete setup looks like:

```
DATABASE_URL=postgresql://postgres:MySecurePassword123@db.ugemjqouxnholwlgvzer.supabase.co:5432/postgres

REDIS_URL=redis://default:gQAAAAAAAX5TAAIncDE2Y2ViMWM0YTRlOTg0NTc0OGY3NWJmNGRhZmFiYzk0YXAxOTc4NzU@free-pig-97875.upstash.io:6379

JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

JWT_REFRESH_SECRET=xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx

ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z

NODE_ENV=production

NEXT_PUBLIC_API_URL=https://smart-pos-system.vercel.app
```

---

## 🔒 SECURITY BEST PRACTICES

**DO:**
- ✅ Keep secrets in a password manager
- ✅ Use strong, random values
- ✅ Store in Vercel (not in code)
- ✅ Rotate secrets periodically
- ✅ Use different secrets for different environments

**DON'T:**
- ❌ Share secrets with anyone
- ❌ Commit secrets to Git
- ❌ Use weak/predictable values
- ❌ Reuse secrets across projects
- ❌ Store in plain text files

---

## 📋 COLLECTION FORM

Print this and fill it in:

```
DATABASE_URL: _________________________________

REDIS_URL: _________________________________

JWT_SECRET: _________________________________

JWT_REFRESH_SECRET: _________________________________

ENCRYPTION_KEY: _________________________________

NODE_ENV: production

NEXT_PUBLIC_API_URL: https://smart-pos-system.vercel.app
```

---

## 🎯 NEXT STEPS

1. **Collect** all 7 variables (10 minutes)
2. **Save** them securely (password manager)
3. **Add** to Vercel (5 minutes)
4. **Redeploy** (5 minutes)
5. **Verify** deployment works

**Total Time**: 20 minutes

---

## 📞 NEED HELP?

If you're stuck:

1. Check the **Troubleshooting** section above
2. Review the **Step-by-Step Visual Guide**
3. Verify all values match the **Verification Checklist**
4. Check Vercel logs for error messages

---

**Ready to collect your variables? Start with DATABASE_URL from Supabase!**

