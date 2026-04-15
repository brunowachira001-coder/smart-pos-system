# Smart POS System - Login Credentials

## Test User Credentials

Since the system was just deployed, you'll need to create a user or use seeded test data.

### Option 1: Use Seeded Test Data (If Database Seeded)
If the database was seeded during deployment, try:

**Username:** `admin`  
**Password:** `admin123`

Or:

**Username:** `cashier`  
**Password:** `cashier123`

### Option 2: Create a New User via API

You can create a user by making a POST request to the login endpoint with test data.

### Default Test Credentials (Development)
If using development defaults:

**Username:** `testuser`  
**Password:** `password123`

## How to Login

1. Go to your Vercel deployment URL (e.g., `https://smart-pos-system.vercel.app`)
2. Click on "Login" or navigate to `/login`
3. Enter username and password
4. Click "Sign In"

## If Login Fails

### Check These:
1. **Database Connection** - Verify DATABASE_URL environment variable is set in Vercel
2. **User Exists** - The user must exist in the database
3. **Password Hash** - Password must be correctly hashed in the database

### Test the API Directly

Test if the backend is working:

```bash
# Test health endpoint
curl https://your-deployment-url/api/health

# Test login endpoint (replace with your URL)
curl -X POST https://your-deployment-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Next Steps

1. **Verify Deployment** - Check that the app loads at your Vercel URL
2. **Test Health Endpoint** - Visit `/api/health` to verify backend is running
3. **Check Database** - Ensure Supabase database has user records
4. **Review Logs** - Check Vercel logs for any runtime errors

## Database Seeding

If you need to seed the database with test data, you can:

1. Run the seed script locally: `npm run db:seed`
2. Or manually insert test users into the Supabase database

## Support

If you encounter login issues:
- Check Vercel deployment logs for errors
- Verify all environment variables are set
- Ensure database connection is working
- Check that user exists in the database
