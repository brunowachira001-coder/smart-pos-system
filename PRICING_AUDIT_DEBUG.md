# Pricing Audit Feature - Debug & Testing Guide

## Changes Made

### 1. Fixed Issue Detection Logic
- Updated `fetchPricingProducts()` in `pages/dashboard-pro.tsx` to match the exact logic from the API
- Added `hasIssue` flag to prevent multiple issue types being assigned to the same product
- Added detailed console logging to help debug

### 2. Added All Required Columns
The products table now displays all 6 columns as shown in the screenshot:
- Product (name)
- Cost (cost_price)
- Retail (retail_price)
- Wholesale (wholesale_price)
- Issues (red badges showing issue types)
- Actions (edit and delete icons)

### 3. Console Logging Added
When you click the eye icon (👁), check the browser console for:
```
=== PRICING PRODUCTS FETCH ===
API Response: {...}
Total products fetched: X
Product with issue: [name] Issues: [...] Cost: X Retail: X Wholesale: X
Total products with issues: X
Products with issues: [...]
```

## Testing Instructions

### Step 1: Wait for Deployment
Wait 2-5 minutes for Vercel to deploy the latest changes (commit: 885de02)

### Step 2: Hard Refresh Browser
Press `Ctrl + Shift + R` to clear cache and reload

### Step 3: Check Current Products
1. Go to the dashboard
2. Look at the "Pricing Data Audit" card
3. Note the "Issues Found" count (currently showing 1)

### Step 4: Open Browser Console
1. Press `F12` to open Developer Tools
2. Go to the "Console" tab
3. Keep it open for the next step

### Step 5: Click Eye Icon
1. Click the eye icon (👁) in the Pricing Data Audit card
2. Watch the console for the debug logs
3. Check if products appear in the table

### Step 6: Add Test Products (If Needed)
If no products show up, you can add test products with pricing issues:

1. Go to Supabase SQL Editor
2. Copy and run the SQL from `lib/test-pricing-issue-product.sql`
3. This will create 4 test products with different pricing issues:
   - TEST001: Missing cost price
   - TEST002: Zero selling prices
   - TEST003: Selling below cost
   - TEST004: Unrealistic markup (>500%)
4. Refresh the dashboard and click the eye icon again

## Expected Behavior

### When Issues Exist:
- The "Issues Found" badge shows the count (e.g., "1", "4")
- The "Issues Found" panel shows the breakdown:
  - X products missing cost price
  - X products with zero selling price
  - X products selling below cost
  - X products with unrealistic markup
- Clicking the eye icon shows the products table with:
  - Product names
  - Cost, Retail, Wholesale prices
  - Red badges showing issue types
  - Edit and delete action buttons
  - "Showing 1 to 5 of X products" pagination info

### When No Issues Exist:
- The "Issues Found" badge shows "0"
- The "Issues Found" panel is hidden
- Clicking the eye icon shows "No products with issues found"

## Troubleshooting

### If Console Shows "Total products with issues: 0" but Stats Show Issues:
This means the API is detecting issues but the frontend filtering logic is different. Check:
1. The console log for each product to see why it's not being flagged
2. Compare the cost/retail/wholesale values with the issue detection logic

### If No Products Are Fetched:
Check the console for errors in the API call. The products list API might be failing.

### If Products Show But No Issues Column:
This means the `product.issues` array is not being populated. Check the console logs for the filtering logic.

## Issue Detection Logic

A product has an issue if ANY of these conditions are true (checked in order):

1. **Missing Cost**: `cost_price` is 0 or null
2. **Zero Price**: Both `retail_price` AND `wholesale_price` are 0 or null (only if no cost issue)
3. **Below Cost (Retail)**: `retail_price` < `cost_price` (only if no previous issues)
4. **Below Cost (Wholesale)**: `wholesale_price` < `cost_price` (only if no previous issues)
5. **High Markup**: Markup > 500% calculated as `((retail_price - cost_price) / cost_price) * 100` (only if no previous issues)

Note: The `!hasIssue` checks ensure each product is only counted once for the first issue type detected.

## Files Modified

1. `pages/dashboard-pro.tsx` - Fixed issue detection logic and added logging
2. `lib/test-pricing-issue-product.sql` - Test data for creating products with issues

## Next Steps

After testing, please share:
1. What you see in the browser console when clicking the eye icon
2. Whether products appear in the table
3. The "Issues Found" count from the stats
4. Any error messages

This will help identify if the issue is with:
- The API returning incorrect data
- The frontend filtering logic
- The database having no actual issues
- The UI not rendering correctly
