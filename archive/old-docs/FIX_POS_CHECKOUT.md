# Fix POS Checkout - Missing Tables

## Problem
Sales not completing with error: "could not find the table 'public.transactions' in the schema cache"

## Root Cause
The `transactions` and `transaction_items` tables don't exist in your production database.

## Current Status
✅ `cart_items` table exists
❌ `transactions` table missing
❌ `transaction_items` table missing

## THE CHALLENGE
Your production database (`ugemjqouxnholwlgvzer`) is NOT accessible in your Supabase dashboard. This means you cannot run SQL scripts directly.

## SOLUTION OPTIONS

### Option 1: Find Who Has Access (RECOMMENDED)
Someone created this Supabase project and has access to it. You need to:
1. Check who deployed the original project to Vercel
2. Ask them to log into Supabase dashboard
3. Have them run the SQL from `lib/create-transactions-table.sql`

### Option 2: Create New Supabase Project & Migrate
1. Create a new Supabase project in your dashboard
2. Run all schema SQL files to recreate the database
3. Export data from old database (via API)
4. Import into new database
5. Update Vercel environment variables
⚠️ This is complex and risky - only if Option 1 fails

### Option 3: Use Supabase CLI (If You Have Project Password)
If you know the database password:
```bash
# Install Supabase CLI
npm install -g supabase

# Link to project (requires password)
supabase link --project-ref ugemjqouxnholwlgvzer

# Run migration
supabase db push
```

## What Tables Need to Be Created

The SQL in `lib/create-transactions-table.sql` creates:

1. **transactions** table
   - Stores completed sales
   - Fields: transaction_number, customer_id, total_amount, payment_method, etc.

2. **transaction_items** table
   - Stores line items for each sale
   - Fields: transaction_id, product_id, quantity, unit_price, subtotal

3. **Indexes and RLS policies**
   - For performance and security

## What Was Already Fixed in Code
✅ Fixed payment validation logic for cash payments
✅ Updated debt record creation to use correct column names
✅ Fixed debt credit check to query `amount_remaining`
✅ Added better error messages

## Once Tables Are Created
The POS checkout will work for:
- Cash payments
- M-Pesa payments  
- Debt/Credit payments (with customer credit limit validation)

All sales will be properly recorded in the `transactions` table.

## Quick Test After Setup
1. Go to: https://smart-pos-system-peach.vercel.app/pos
2. Add a product to cart
3. Complete checkout
4. Should see success message!
