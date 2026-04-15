# Setup Test User for Login

Since the database is empty, you need to create a test user first. Here's how:

## Step 1: Create Test User via API

Make a POST request to create a test user:

```bash
curl -X POST https://your-deployment-url/api/auth/create-test-user \
  -H "Content-Type: application/json"
```

Replace `your-deployment-url` with your actual Vercel URL (e.g., `https://smart-pos-system-abc123.vercel.app`)

## Step 2: Verify User Was Created

You should get a response like:

```json
{
  "success": true,
  "data": {
    "message": "Test user created successfully",
    "user": {
      "id": "1",
      "username": "admin",
      "email": "admin@test.com"
    },
    "credentials": {
      "username": "admin",
      "password": "admin123"
    }
  },
  "timestamp": "2024-04-15T10:00:00.000Z"
}
```

## Step 3: Login with Test Credentials

Now you can login with:
- **Username:** `admin`
- **Password:** `admin123`

## Using Browser DevTools

If you prefer using the browser:

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Paste this code:

```javascript
fetch('https://your-deployment-url/api/auth/create-test-user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

4. Press Enter
5. Check the response in the console

## Troubleshooting

### "Test user already exists"
The user has already been created. Try logging in with:
- Username: `admin`
- Password: `admin123`

### "Failed to create test user"
Check:
1. Your DATABASE_URL is set correctly in Vercel
2. The database is accessible
3. Check Vercel logs for detailed error

### Still can't login
1. Verify the test user was created successfully
2. Check that the password is exactly `admin123`
3. Review Vercel function logs for errors

## Next Steps

After successful login:
1. Explore the dashboard
2. Create more users as needed
3. Set up roles and permissions
4. Configure your POS system

## Creating Additional Users

To create more users, you can:
1. Use the admin dashboard (once logged in)
2. Make direct API calls to create users
3. Use the database directly via Supabase console
