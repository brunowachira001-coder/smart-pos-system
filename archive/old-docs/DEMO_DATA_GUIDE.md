# Demo Data Setup Guide

This guide will help you populate your database with sample data to test pagination on all pages.

## Quick Setup

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the contents of `lib/demo-data-all-pages.sql`
6. Click "Run" or press Ctrl+Enter

## What Gets Created

The script will create:

- **50 Customers** - To test Customers page pagination
- **100 Products** - To test Inventory page pagination
- **150 Transactions** - To test Transactions page pagination
- **60 Debts** - To test Debt Management page pagination
- **40 Returns** - To test Returns page pagination
- **80 Expenses** - To test Expenses page pagination
- **25 Users** - To test User Management page pagination

## Testing Pagination

After running the script, you can test pagination on these pages:

### Pages with Pagination Dropdown (10, 20, 50, 100 items per page):

1. **Inventory** (`/inventory`)
   - 100 products created
   - Default: 20 per page = 5 pages

2. **Customers** (`/customers`)
   - 50 customers created
   - Default: 20 per page = 3 pages

3. **Transactions** (`/transactions`)
   - 150 transactions created
   - Default: 20 per page = 8 pages

4. **Debt Management** (`/debt`)
   - 60 debts created
   - Default: 20 per page = 3 pages

5. **Returns** (`/returns`)
   - 40 returns created
   - Needs frontend pagination update

6. **Expenses** (`/expenses`)
   - 80 expenses created
   - Needs frontend pagination update

7. **User Management** (`/user-management`)
   - 25 users created
   - Needs frontend pagination update

## Verifying the Data

After running the script, you should see a summary table showing the count of records in each table:

```
table_name    | record_count
--------------+--------------
Customers     | 50
Products      | 100
Transactions  | 150
Debts         | 60
Returns       | 40
Expenses      | 80
Users         | 25
```

## Testing the Dropdown

1. Visit any page with pagination
2. Look at the bottom of the table
3. You should see:
   - "Showing X to Y of Z items"
   - "Per page:" dropdown with options: 10, 20, 50, 100
   - Previous/Next buttons
   - Current page indicator

## Clearing Demo Data (Optional)

If you want to remove all demo data later, run this in SQL Editor:

```sql
-- WARNING: This will delete ALL data from these tables
DELETE FROM transaction_items;
DELETE FROM transactions;
DELETE FROM debts;
DELETE FROM returns;
DELETE FROM expenses;
DELETE FROM products WHERE name LIKE 'Product %';
DELETE FROM customers WHERE name LIKE 'Customer %';
DELETE FROM users WHERE username LIKE 'user%';
```

## Notes

- The script uses `ON CONFLICT DO NOTHING` to avoid duplicate entries
- All demo data has recognizable patterns (e.g., "Customer 1", "Product 1")
- Dates are spread across the last 150 days for realistic testing
- The script is safe to run multiple times
