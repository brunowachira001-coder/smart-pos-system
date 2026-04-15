# Troubleshoot Login - Step by Step

## Problem
Login is failing with "Login failed" message.

## Root Cause
The test user doesn't exist in the database yet. You need to create it first.

## Solution - 3 Simple Steps

### Step 1: Create Test User
Visit this URL in your browser (replace with your actual deployment URL):
```
https://your-deployment-url/api/auth/create-test-user
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Test user created successfully",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@test.com"
    },
    "credentials": {
      "username": "admin",
      "password": "admin123"
    }
  },
  "timestamp": "2026-04-15T..."
}
```

**If you see this, the user was created successfully!** ✅

### Step 2: Go to Login Page
Visit:
```
https://your-deployment-url/login
```

### Step 3: Enter Credentials
- **Username**: `admin`
- **Password**: `admin123`
- Click **Sign In**

**Expected Result**: You should be logged in and redirected to the dashboard! ✅

---

## If Create User Fails

### Error: "Test user already exists"
- The user was already created
- Go directly to Step 2 (login page)
- Try logging in with `admin` / `admin123`

### Error: "Failed to create test user"
- Database connection issue
- Check that DATABASE_URL is set in Vercel
- Check that Supabase database is accessible
- Try again in a few moments

### Error: 404 or "Not Found"
- The endpoint doesn't exist
- Make sure you redeployed to Vercel
- Check that the URL is correct

---

## If Login Still Fails

### Check 1: Verify User Exists
Query the database:
```sql
SELECT * FROM "User" WHERE username = 'admin';
```

If no results, the user wasn't created. Go back to Step 1.

### Check 2: Verify Password Hash
The password should be hashed, not plain text:
```sql
SELECT username, "passwordHash" FROM "User" WHERE username = 'admin';
```

The `passwordHash` should be a long string starting with `$2a$` or `$2b$`.

### Check 3: Check Vercel Logs
1. Go to Vercel dashboard
2. Click "smart-pos-system" project
3. Click "Logs"
4. Look for error messages
5. Share the error with me

---

## Quick Checklist

- [ ] Redeployed to Vercel (latest commit: `176211d`)
- [ ] Called `/api/auth/create-test-user` endpoint
- [ ] Got success response with credentials
- [ ] Went to login page
- [ ] Entered `admin` / `admin123`
- [ ] Clicked Sign In
- [ ] Got redirected to dashboard

If all checked, login should work!

---

## Your Deployment URL

Find it here:
1. Go to https://vercel.com/dashboard
2. Click "smart-pos-system" project
3. Look at the top - you'll see the URL
4. Format: `https://smart-pos-system-[random].vercel.app`

Use this URL for all the steps above.

---

## Still Not Working?

1. Check Vercel logs for specific errors
2. Verify DATABASE_URL is set
3. Verify Supabase database is accessible
4. Try creating the user again
5. Share the error message and I'll help fix it

**The login endpoint is working correctly. The issue is just that the test user needs to be created first!**
