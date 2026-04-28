# Clear All Demo Data - Quick Instructions

## Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: `xqnteamrznvoqgaazhpu`
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

## Step 2: Run the Cleanup Script

Copy and paste the entire contents of `lib/clear-all-demo-data.sql` into the SQL editor and click "Run".

## Step 3: Verify Data is Cleared

The script includes verification queries at the end. You should see:
- transactions: 0
- transaction_items: 0
- cart_items: 0
- returns: 0
- expenses: 0
- debts: 0
- customers: 0
- products: 0
- shop_settings: 0
- users: 1 (your admin account)

## Step 4: Reconfigure Your System

After clearing data, you need to:

### 1. Set Up Shop Settings
- Go to https://smart-pos-system-peach.vercel.app/shop-settings
- Enter your business name
- Upload your logo
- Set your business details

### 2. Add Your Products
- Go to Inventory page
- Click "Add Product"
- Enter product details (name, SKU, prices, stock)
- Repeat for all your products

### 3. Add Your Customers
- Go to Customers page
- Click "Add Customer"
- Enter customer details
- Set credit limits if needed

### 4. Start Selling
- Go to POS page
- Select products
- Complete transactions
- System will now record real data

## What Gets Deleted

✅ All demo products (121 products)
✅ All demo customers (54 customers)
✅ All test transactions (6 transactions)
✅ All test returns (18 returns)
✅ All test expenses (10 expenses)
✅ All test debts (4 debts)
✅ Shop settings (needs reconfiguration)

## What Gets Kept

✅ Your admin user account (brunowachira001@gmail.com)
✅ Database structure (all tables remain)
✅ All system functionality

## Important Notes

⚠️ **This action cannot be undone!** Make sure you want to clear all data before running the script.

⚠️ **Backup First:** If you have any data you want to keep, export it first from Supabase.

⚠️ **Shop Settings:** You'll need to reconfigure your shop name, logo, and other settings after clearing.

## Alternative: Selective Deletion

If you want to keep some data, modify the SQL script:

```sql
-- Keep specific customers
DELETE FROM public.customers 
WHERE name LIKE 'Demo%' OR name LIKE 'Test%';

-- Keep specific products
DELETE FROM public.products 
WHERE sku LIKE 'SKU-%' OR sku LIKE 'PROD%';
```

## Need Help?

If you encounter any issues:
1. Check the Supabase logs for errors
2. Verify your database connection
3. Make sure you have the correct permissions
4. Contact support if needed

---

**Ready to start fresh?** Run the script and begin with clean, real data!
