# Fix Customer Names in Transactions

## Problem
Customer names entered during checkout weren't being saved or displayed in the transactions page.

## Solution
Added `customer_name` and `customer_phone` columns to the transactions table.

## Steps to Fix

### 1. Run This SQL in Supabase

Go to: https://supabase.com/dashboard/project/xqnteamrznvoqgaazhpu/sql/new

Copy and paste this SQL:

```sql
-- Add customer_name and customer_phone columns to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);

-- Create index for searching by customer name
CREATE INDEX IF NOT EXISTS idx_transactions_customer_name ON public.transactions(customer_name);

SELECT '✅ Added customer_name and customer_phone columns to transactions table' as message;
```

Click "Run" button.

### 2. Wait for Deployment

The code changes are deploying now (2-3 minutes).

### 3. Test

After deployment:
1. Open Private Window in Brave
2. Go to smart-pos-system-peach.vercel.app
3. Login
4. Make a new sale with a customer name
5. Check transactions page - customer name should now display!

## What Changed

- Checkout API now saves customer name and phone directly to transactions table
- Transactions list API reads customer name from transaction record
- For old transactions with customer_id but no name, it still looks up the customer
- For new transactions, name is saved directly (faster and works for walk-in customers)
