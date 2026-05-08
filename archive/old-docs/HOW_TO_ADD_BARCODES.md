# How to Add Barcodes to Products

## Overview

Your products need barcodes in the SKU field for the barcode scanner to work. Here are all the ways to add them:

---

## Method 1: Through the UI (One by One)

**Best for**: Small number of products (1-20)

### Steps:

1. **Go to Inventory page** in your POS system
2. **Click Edit** on a product
3. **Enter the barcode** in the SKU field
4. **Click Save**
5. **Repeat** for other products

### Example:
```
Product: Coca Cola 500ml
SKU: 5449000000996  ← Enter barcode here
```

---

## Method 2: Bulk Import via CSV (Recommended)

**Best for**: Many products (20+)

### Step 1: Export Current Products

Go to Supabase Dashboard:
1. Open your project
2. Go to Table Editor → products
3. Click "Export" → Download as CSV
4. Open in Excel/Google Sheets

### Step 2: Add Barcodes to CSV

Your CSV will look like:
```csv
id,name,sku,retail_price,wholesale_price,stock_quantity
prod-1,Coca Cola,OLD-SKU-1,50,45,100
prod-2,Pepsi,OLD-SKU-2,50,45,80
```

Update the SKU column with barcodes:
```csv
id,name,sku,retail_price,wholesale_price,stock_quantity
prod-1,Coca Cola,5449000000996,50,45,100
prod-2,Pepsi,1234567890123,50,45,80
```

### Step 3: Import Back to Database

**Option A: Via Supabase Dashboard**
1. Go to Table Editor → products
2. Click "Import" → Upload CSV
3. Map columns correctly
4. Click Import

**Option B: Via SQL**
1. Go to SQL Editor in Supabase
2. Use this query:

```sql
-- Update products with barcodes
UPDATE products SET sku = '5449000000996' WHERE name = 'Coca Cola';
UPDATE products SET sku = '1234567890123' WHERE name = 'Pepsi';
-- Add more lines for each product
```

---

## Method 3: Direct Database Update

**Best for**: Technical users, bulk updates

### Via Supabase SQL Editor:

```sql
-- Update single product
UPDATE products 
SET sku = '5449000000996' 
WHERE id = 'product-id-here';

-- Update multiple products
UPDATE products SET sku = '5449000000996' WHERE name = 'Coca Cola 500ml';
UPDATE products SET sku = '5449000131872' WHERE name = 'Fanta Orange 500ml';
UPDATE products SET sku = '5449000054227' WHERE name = 'Sprite 500ml';

-- Update by pattern (if you have a naming convention)
UPDATE products 
SET sku = CONCAT('PROD-', id) 
WHERE sku IS NULL OR sku = '';
```

---

## Method 4: Scan Existing Barcodes

**Best for**: Products that already have barcodes printed on them

### Steps:

1. **Get your barcode scanner**
2. **Open Inventory page** in your system
3. **Click Edit** on a product
4. **Click in the SKU field**
5. **Scan the product's barcode** with your scanner
6. **Barcode appears in SKU field**
7. **Click Save**
8. **Repeat** for other products

This is the fastest way if your products already have barcodes!

---

## Barcode Formats

### Standard Retail Barcodes:

**EAN-13** (13 digits) - Most common worldwide
```
Example: 5449000000996
Used for: Retail products, groceries
```

**UPC-A** (12 digits) - Common in USA
```
Example: 012345678905
Used for: US retail products
```

**EAN-8** (8 digits) - Short version
```
Example: 12345670
Used for: Small products
```

### Custom Barcodes:

**Code 128** - Alphanumeric
```
Example: PROD-001, ABC-123-XYZ
Used for: Internal products, custom items
```

**Your Own Format**
```
Example: SHOP-2024-001
Used for: Any custom format you want
```

---

## Where to Get Barcodes

### Option 1: Use Existing Barcodes
If your products already have barcodes printed on them, just scan and add them to your system.

### Option 2: Buy Official Barcodes
- **GS1** (official barcode authority)
- Website: https://www.gs1.org/
- Cost: Varies by country ($250-500 initial, annual renewal)
- You get: Unique company prefix + product codes

### Option 3: Generate Custom Barcodes (Free)
For internal use only (not for retail distribution):

**Online Generators:**
- https://barcode.tec-it.com/en
- https://www.barcodesinc.com/generator/
- https://www.free-barcode-generator.net/

**Steps:**
1. Choose barcode type (EAN-13 or Code 128)
2. Enter your product code
3. Generate barcode image
4. Download and print
5. Stick on product

### Option 4: Sequential Numbers
Create your own system:
```
Product 1: 1000000000001
Product 2: 1000000000002
Product 3: 1000000000003
...
```

---

## Bulk Barcode Assignment Script

I'll create a script to help you assign barcodes automatically.

### Auto-Generate Sequential Barcodes:

```sql
-- Generate sequential EAN-13 style barcodes for all products without SKU
WITH numbered_products AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM products
  WHERE sku IS NULL OR sku = '' OR sku = 'N/A'
)
UPDATE products p
SET sku = LPAD((1000000000000 + np.row_num)::TEXT, 13, '0')
FROM numbered_products np
WHERE p.id = np.id;
```

This creates barcodes like:
- 1000000000001
- 1000000000002
- 1000000000003
- etc.

---

## Printing Barcode Labels

Once you have barcodes in the system, print labels to stick on products:

### Option 1: Online Print
1. Go to https://barcode.tec-it.com/en
2. Enter your SKU
3. Select barcode type (EAN-13)
4. Download as image
5. Print on label paper
6. Cut and stick on product

### Option 2: Excel Template
1. Export products to Excel
2. Use barcode font (download free)
3. Create labels with product name + barcode
4. Print on Avery label sheets

### Option 3: Label Printer
Buy a label printer:
- **Zebra ZD410** ($200-300)
- **Brother QL-820NWB** ($150-250)
- **DYMO LabelWriter** ($100-150)

Print labels directly from software.

---

## Quick Start: 3 Products Example

Let's say you have 3 products and want to add barcodes:

### Step 1: Decide on barcode format
Let's use simple sequential: 1001, 1002, 1003

### Step 2: Update in database
```sql
UPDATE products SET sku = '1001' WHERE name = 'Coca Cola';
UPDATE products SET sku = '1002' WHERE name = 'Pepsi';
UPDATE products SET sku = '1003' WHERE name = 'Fanta';
```

### Step 3: Print barcode labels
1. Go to https://barcode.tec-it.com/en
2. Type "1001", generate, download
3. Type "1002", generate, download
4. Type "1003", generate, download
5. Print all three
6. Stick on products

### Step 4: Test
1. Open POS page
2. Scan barcode on Coca Cola
3. Should add to cart automatically!

---

## Recommended Workflow

### For New Store:

1. **List all products** you want to sell
2. **Assign sequential barcodes** (1001, 1002, 1003...)
3. **Update database** with SQL or CSV import
4. **Print barcode labels** for all products
5. **Stick labels** on products
6. **Test scanning** a few products
7. **Go live!**

### For Existing Products with Barcodes:

1. **Scan existing barcodes** into SKU field
2. **Test scanning** on POS
3. **Done!**

---

## Troubleshooting

**Q: Can I use the same barcode for multiple products?**
A: No! Each product must have a unique barcode/SKU.

**Q: What if my product doesn't have a barcode?**
A: Create your own (1001, 1002, etc.) and print labels.

**Q: Can I change a barcode later?**
A: Yes, just edit the SKU field in Inventory page.

**Q: Do I need to buy official barcodes?**
A: Only if selling to other retailers. For your own store, custom barcodes work fine.

**Q: What barcode format should I use?**
A: EAN-13 (13 digits) is most common. Or use any format you want.

**Q: Can I use letters in barcodes?**
A: Yes, with Code 128 format. But numbers-only (EAN-13) is simpler.

---

## Next Steps

1. Choose your method (UI, CSV, or SQL)
2. Add barcodes to your products
3. Print labels if needed
4. Test scanning on POS page
5. Start using barcode scanner!

Need help? Check the barcode scanner guide: `BARCODE_SCANNER_GUIDE.md`
