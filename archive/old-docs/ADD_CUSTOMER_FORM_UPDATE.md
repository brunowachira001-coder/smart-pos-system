# Add Customer Form Update - Complete

## Changes Made

### 1. Updated Add Customer Modal UI (`pages/customers.tsx`)
- Split "Name" field into "First Name" and "Last Name" (both required)
- Removed: Address, City, Country, and Notes fields
- Added: "Debt Limit" field with helper text
- Updated modal header with subtitle: "Fill in the details for the new customer."
- Added close X button in top-right corner
- Changed button text to "Save Customer"
- Updated Customer Type dropdown to show "Retail Customer" and "Wholesale Customer"
- Improved styling with better spacing and focus states

### 2. Updated API (`pages/api/customers/index.ts`)
- Added support for `firstName` and `lastName` parameters
- Combines firstName + lastName into full name for database storage
- Maintains backward compatibility with old `name` parameter
- Added support for `debtLimit` field
- Converts debtLimit to float before saving to database

### 3. Updated Database Schema (`lib/customers-schema.sql`)
- Added `debt_limit DECIMAL(10, 2) DEFAULT NULL` column to customers table
- Fixed typo in address field (was "ddress", now "address")

### 4. Created Migration File (`lib/add-debt-limit-column.sql`)
- SQL script to add debt_limit column to existing databases
- Safe to run multiple times (uses IF NOT EXISTS)
- Run this in Supabase SQL Editor if you already have a customers table

## Form Fields (New)
1. First Name (required)
2. Last Name (required)
3. Email (optional)
4. Phone (optional)
5. Customer Type (dropdown: Retail Customer / Wholesale Customer)
6. Debt Limit (optional, with helper text: "Maximum credit limit for this customer")

## Next Steps

### If you have an existing database:
Run the migration script in Supabase SQL Editor:
```sql
-- Copy and paste contents of lib/add-debt-limit-column.sql
```

### Deploy to Vercel:
```bash
git add .
git commit -m "Update Add Customer form with firstName, lastName, and debt limit"
git push
```

Wait 2-5 minutes for Vercel deployment, then hard refresh (Ctrl + Shift + R).

## Notes
- The Edit Customer modal still uses the old format (single name field) - can be updated later if needed
- Debt limit is optional and stored as decimal with 2 decimal places
- Form matches the screenshot design with dark theme styling
