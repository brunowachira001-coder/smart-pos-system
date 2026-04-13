# Verify Your Supabase Project

## Check if SnatchFit Project Exists

### Step 1: Login to Supabase

1. Go to https://supabase.com
2. Click "Sign In"
3. Login with your GitHub or email account
4. You should see your dashboard

### Step 2: Look for SnatchFit Project

In your Supabase dashboard, look for a project named:
- `snatchfit-boutique` (or similar)
- `snatchfit`
- Any project you created

### Step 3: Get Your Credentials

If the project exists, click on it and go to:

**Settings → API**

You need to copy:
1. **Project URL** - Looks like: `https://xxxxx.supabase.co`
2. **Anon Public Key** - Starts with `eyJ...`
3. **Service Role Secret** - Starts with `eyJ...`

**Settings → Database**

You need:
1. **Connection String** - For reference

---

## If Project Exists ✅

### You Have:
- [ ] Project URL (NEXT_PUBLIC_SUPABASE_URL)
- [ ] Anon Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Service Role Secret (SUPABASE_SERVICE_ROLE_KEY)

### Next Steps:
1. Verify database tables exist
2. Add environment variables to Vercel
3. Deploy to Vercel

---

## If Project Doesn't Exist ❌

### Create New Project:
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Project name: `snatchfit-boutique`
4. Database password: Generate strong password
5. Region: Choose closest to your users
6. Click "Create new project"
7. Wait 2-3 minutes

### Then:
1. Get credentials (see Step 3 above)
2. Create database tables (SQL provided)
3. Add environment variables to Vercel
4. Deploy to Vercel

---

## Verify Database Tables

### Check if Tables Exist:

1. In Supabase dashboard, go to **SQL Editor**
2. Run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### You should see:
- `users`
- `products`
- `orders`
- `order_items`
- `cart_items`

### If tables don't exist:

Go to **SQL Editor** and run:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  category VARCHAR(100),
  inventory INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
```

---

## Checklist

### Project Status
- [ ] Supabase account created
- [ ] SnatchFit project exists
- [ ] Project URL obtained
- [ ] Anon key obtained
- [ ] Service role key obtained

### Database Status
- [ ] Database tables created
- [ ] Users table exists
- [ ] Products table exists
- [ ] Orders table exists
- [ ] Order items table exists
- [ ] Cart items table exists

### Ready for Next Steps
- [ ] All credentials saved
- [ ] All tables verified
- [ ] Ready to add environment variables

---

## Next Steps After Verification

Once you've confirmed:

1. **Add Environment Variables to Vercel**
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - Stripe keys
   - NextAuth secrets

2. **Deploy to Vercel**
   - Push code to GitHub
   - Import to Vercel
   - Deploy

3. **Test Your Site**
   - Visit your Vercel URL
   - Test all features

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Dashboard**: https://supabase.com/dashboard

---

Let me know what you find! 🚀

