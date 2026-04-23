# Add Debt Limit Column to Customers Table

## Error
```
error: could not find the 'debt_limit' column of 'customers' in the schema table
```

## Solution

The `debt_limit` column needs to be added to your Supabase customers table.

## Steps to Fix

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `smart-pos-system`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy the entire contents of `lib/add-debt-limit-to-customers.sql`
   - Paste into the SQL Editor
   - Click "Run" button

4. **Verify the Column**
   - The last query in the SQL file will show you the column details
   - You should see: `debt_limit | numeric | NULL`

5. **Test the Feature**
   - Go to your deployed site: https://smart-pos-system.vercel.app
   - Hard refresh (Ctrl + Shift + R)
   - Go to POS page
   - Click checkout
   - Search for a customer
   - Select a customer that has a credit limit
   - You should see "Debt (Credit)" option in payment methods

## What This Does

- Adds `debt_limit` column to customers table (DECIMAL(10, 2))
- Sets default value to NULL (no credit limit)
- Creates an index for better performance
- Optionally sets sample credit limits for first 3 customers (50000, 30000, 100000)

## Setting Credit Limits for Customers

After running the SQL, you can set credit limits for customers in two ways:

### Option 1: Through Supabase Dashboard
1. Go to Table Editor > customers
2. Find the customer
3. Edit the `debt_limit` field
4. Enter amount (e.g., 50000.00 for KSH 50,000)

### Option 2: Through SQL
```sql
UPDATE customers 
SET debt_limit = 50000.00 
WHERE name = 'Customer Name';
```

## Notes

- Only customers with `debt_limit > 0` will see the debt payment option
- The system validates that debt doesn't exceed available credit
- Available credit = debt_limit - current_debt
