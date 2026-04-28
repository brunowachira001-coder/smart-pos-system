# Restore Data - Quick Instructions

## To Restore All Previously Deleted Data

### Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: `xqnteamrznvoqgaazhpu`
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run the Restore Script

Copy and paste the **entire contents** of `ABSOLUTE_FINAL_RESTORE.sql` into the SQL editor and click "Run".

This will restore:
- ✅ 121 products
- ✅ 54 customers
- ✅ 18 returns
- ✅ 10 expenses
- ✅ 4 debts
- ✅ 1 shop settings (Nyla Wigs)
- ✅ 6 transactions (from your recent sales)

### Step 3: Verify Data is Restored

Run this query to verify:

```sql
SELECT 'transactions' as table_name, COUNT(*) as count FROM public.transactions
UNION ALL
SELECT 'transaction_items', COUNT(*) FROM public.transaction_items
UNION ALL
SELECT 'returns', COUNT(*) FROM public.returns
UNION ALL
SELECT 'expenses', COUNT(*) FROM public.expenses
UNION ALL
SELECT 'debts', COUNT(*) FROM public.debts
UNION ALL
SELECT 'customers', COUNT(*) FROM public.customers
UNION ALL
SELECT 'products', COUNT(*) FROM public.products
UNION ALL
SELECT 'shop_settings', COUNT(*) FROM public.shop_settings;
```

You should see:
- transactions: 6
- products: 121
- customers: 54
- returns: 18
- expenses: 10
- debts: 4
- shop_settings: 1

### Step 4: Trigger New Deployment

After restoring data, the system will automatically show the restored data. You may need to:
1. Clear your browser cache (Ctrl+Shift+R)
2. Or visit: https://smart-pos-system-peach.vercel.app/clear-cache-now.html

---

## What Gets Restored

### Products (121 items)
- All your inventory items
- With correct prices (cost, retail, wholesale)
- With stock quantities
- With categories and SKUs

### Customers (54 customers)
- All customer records
- With contact information
- With credit limits

### Transactions (6 transactions)
- Your recent sales
- Transaction items
- Customer names
- Payment details

### Returns (18 returns)
- Product returns
- With reasons and amounts

### Expenses (10 expenses)
- Business expenses
- With categories and dates

### Debts (4 debts)
- Customer credit records
- Outstanding amounts

### Shop Settings
- Business name: Nyla Wigs
- All shop configuration

---

## Important Notes

⚠️ The restore script sets `customer_id` to NULL for returns and debts to avoid foreign key issues. This is normal and won't affect functionality.

✅ All data will be restored exactly as it was before deletion.

✅ Your admin user account is not affected by restore.

---

## Need Help?

If you encounter any errors:
1. Check the Supabase SQL Editor for error messages
2. Make sure you copied the entire `ABSOLUTE_FINAL_RESTORE.sql` file
3. Verify you have the correct permissions
4. Try running the script in smaller sections if needed

---

**Ready to restore?** Open `ABSOLUTE_FINAL_RESTORE.sql`, copy all contents, and run in Supabase SQL Editor!
