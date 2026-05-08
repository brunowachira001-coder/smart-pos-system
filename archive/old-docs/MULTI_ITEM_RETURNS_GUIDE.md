# Multi-Item Returns - User Guide

## What's New? 🎉

You can now return **multiple items from the same transaction** in a single form submission!

## How to Return Multiple Items

### Example Scenario
Transaction TXN-001 had 4 items:
- Beans (KES 120)
- Flour (KES 150)
- Pasta (KES 50)
- Milk (KES 80)

Customer wants to return **Pasta and Milk**.

### Steps

1. **Go to Returns Page**
   - Navigate to the Returns section

2. **Click "Create Return"**
   - Opens the return form modal

3. **Enter Transaction Details** (once for all items)
   - Transaction ID: `TXN-001`
   - Customer Name: `John Doe` (optional)
   - Return Reason: Select from dropdown (e.g., "Defective")

4. **Add First Item**
   - Product: Select "Pasta" from dropdown
   - Quantity: `1`
   - Amount: `50`

5. **Click "+ Add Item"**
   - Adds a new item section

6. **Add Second Item**
   - Product: Select "Milk" from dropdown
   - Quantity: `1`
   - Amount: `80`

7. **Add More Items** (if needed)
   - Keep clicking "+ Add Item" to add more products
   - Click "Remove" on any item to delete it

8. **Submit**
   - Click "Create Return (2 items)"
   - Creates 2 return records, both linked to TXN-001

9. **Approve Returns**
   - Each return appears in the history table
   - Click ⋯ on each return
   - Click "Approve"
   - Stock for both products will increase automatically

## Features

✅ **Add Multiple Items** - Click "+ Add Item" to add as many products as needed

✅ **Remove Items** - Click "Remove" to delete any item from the list

✅ **Single Submission** - Enter transaction details once, applies to all items

✅ **Automatic Stock Updates** - When approved, all products' stock increases

✅ **Linked by Transaction ID** - All returns show the same transaction ID in history

## Product Dropdown Issue

If the product dropdown is empty or not showing products:

1. **Check Browser Console**
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Look for messages like "Products fetched: X items"
   - Share any error messages you see

2. **Verify Products Exist**
   - Go to Inventory page
   - Confirm you have products in the system
   - Products must exist to appear in the dropdown

3. **Hard Refresh**
   - Press Ctrl + Shift + R (Windows/Linux)
   - Press Cmd + Shift + R (Mac)
   - This clears the cache and reloads the page

4. **Check Debug Endpoint**
   - Visit: https://smart-pos-system.vercel.app/api/debug-return-inventory
   - This shows all products and returns
   - Share the output if dropdown still doesn't work

## Deployment Status

**Commit:** `a11484c` - Multi-item return support added
**Status:** Deployed to Vercel
**Wait Time:** 2-3 minutes for deployment to complete

## Next Steps

1. Wait for Vercel deployment to finish
2. Hard refresh your browser (Ctrl + Shift + R)
3. Go to Returns page
4. Click "Create Return"
5. Try adding multiple items!

## Need Help?

If you encounter any issues:
1. Check browser console for errors (F12)
2. Visit the debug endpoint (link above)
3. Share any error messages or screenshots
4. Verify deployment is complete on Vercel dashboard
