# Barcode Setup - Quick Guide

## 🎯 Goal
Add barcodes to your products so the scanner can find them.

---

## ⚡ Fastest Method (5 Minutes)

### Step 1: Open Supabase
1. Go to https://supabase.com
2. Open your project
3. Click "SQL Editor"

### Step 2: Run This Query
Copy and paste this into SQL Editor:

```sql
-- Auto-assign simple barcodes (1001, 1002, 1003...)
WITH numbered_products AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY name) as row_num
  FROM products
)
UPDATE products p
SET sku = (1000 + np.row_num)::TEXT
FROM numbered_products np
WHERE p.id = np.id;

-- Check results
SELECT name, sku FROM products ORDER BY sku;
```

### Step 3: Click "Run"
Your products now have barcodes!

### Step 4: Print Labels (Optional)
1. Go to https://barcode.tec-it.com/en
2. Type your SKU (e.g., "1001")
3. Click "Generate"
4. Download and print
5. Stick on product

### Step 5: Test
1. Open POS page
2. Scan barcode
3. Product adds to cart!

---

## 📋 Alternative Methods

### Method A: Through UI (One by One)
1. Go to **Inventory** page
2. Click **Edit** on a product
3. Enter barcode in **SKU** field
4. Click **Save**
5. Repeat for other products

### Method B: Scan Existing Barcodes
If your products already have barcodes:
1. Go to **Inventory** page
2. Click **Edit** on a product
3. Click in **SKU** field
4. **Scan the product's barcode** with your scanner
5. Click **Save**
6. Repeat for other products

### Method C: CSV Import
1. Export products from Supabase
2. Add barcodes in Excel
3. Import back to Supabase

---

## 🔢 Barcode Formats

### Simple Sequential (Recommended for beginners)
```
1001, 1002, 1003, 1004...
```
Easy to remember, works perfectly!

### EAN-13 (Standard retail)
```
1000000000001, 1000000000002...
```
Looks more professional, 13 digits.

### Custom Format
```
SHOP-001, SHOP-002, SHOP-003...
PROD-A-001, PROD-B-001...
```
Use any format you want!

---

## ✅ Verification

After adding barcodes, verify in Supabase:

```sql
-- Check all products have barcodes
SELECT name, sku FROM products ORDER BY name;

-- Count products with barcodes
SELECT 
  COUNT(*) FILTER (WHERE sku IS NOT NULL) as with_barcode,
  COUNT(*) FILTER (WHERE sku IS NULL) as without_barcode
FROM products;
```

---

## 🖨️ Printing Barcode Labels

### Online (Free)
1. **Website**: https://barcode.tec-it.com/en
2. **Type**: Code 128 or EAN-13
3. **Enter**: Your SKU
4. **Download**: PNG image
5. **Print**: On label paper

### Label Printer (Professional)
- **Zebra ZD410**: $200-300
- **Brother QL-820NWB**: $150-250
- **DYMO LabelWriter**: $100-150

---

## 🎓 Full Documentation

For detailed instructions, see:
- **Complete Guide**: `HOW_TO_ADD_BARCODES.md`
- **SQL Scripts**: `lib/assign-barcodes.sql`
- **Scanner Guide**: `BARCODE_SCANNER_GUIDE.md`

---

## 🚀 Summary

1. **Run SQL query** to assign barcodes (5 minutes)
2. **Print labels** if needed (optional)
3. **Test scanning** on POS page
4. **Done!** Start scanning products

Your barcode system is ready to use!
