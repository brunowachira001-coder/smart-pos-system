# Barcode Scanner Quick Start

## ✅ 5-Minute Setup

### Step 1: Get a Barcode Scanner
- Any USB barcode scanner works (plug & play)
- Or Bluetooth scanner (pair like any Bluetooth device)
- Cost: $20-50 for basic, $50-150 for professional

### Step 2: Configure Scanner
Most scanners work out of the box, but verify:
- ✓ Keyboard emulation mode (default)
- ✓ Sends Enter key after barcode (REQUIRED)
- ✓ No prefix characters

### Step 3: Add Barcodes to Products
Your products need SKU/barcode numbers:

**Option A: In the UI**
1. Go to Inventory page
2. Edit each product
3. Enter barcode in SKU field
4. Save

**Option B: In Database**
```sql
-- Update product SKUs with barcodes
UPDATE products SET sku = '1234567890123' WHERE name = 'Product Name';
```

### Step 4: Test It!
1. Open POS page
2. Scan a product barcode
3. Product should automatically add to cart
4. See green "Scanner Ready" badge in header

## 🎯 How to Use

1. **Open POS page**
2. **Look for green "Scanner Ready" badge** (top right)
3. **Scan product barcode**
4. **Product adds to cart automatically**
5. **Repeat for more items**
6. **Click cart button to checkout**

## 🔧 Troubleshooting

**Nothing happens when scanning?**
- Test scanner in Notepad - does it type the barcode?
- Check scanner is configured to send Enter key
- Make sure you're on POS page (not in checkout)

**"Product not found" error?**
- Check product has SKU in database
- Verify SKU matches barcode exactly
- Check product exists and is not deleted

**Wrong product added?**
- Check for duplicate SKUs in database
- Verify barcode matches product SKU

## 📋 Scanner Configuration Barcodes

If your scanner came with a manual, scan these configuration barcodes:

1. **Enable Keyboard Wedge Mode** (or HID Mode)
2. **Enable Suffix: CR** (Carriage Return / Enter)
3. **Disable Prefix**

Most scanners work without configuration, but these ensure optimal performance.

## 💡 Tips

- **Scan multiple times** to add multiple quantities
- **Price mode** (Retail/Wholesale) affects scanned items
- **Scanner disabled** when checkout modal is open
- **Manual search** still works if scanner fails
- **Green badge** shows scanner is ready

## 📦 Recommended Scanners

**Budget ($20-50):**
- Generic USB barcode scanner from Amazon
- Search: "USB barcode scanner"

**Professional ($50-150):**
- Honeywell Voyager 1200g
- Zebra DS2208
- Wireless Bluetooth options

**Advanced ($150-300):**
- Honeywell Xenon 1900 (2D, QR codes)
- Zebra DS9208 (presentation scanner)

## 🎓 Full Documentation

See `BARCODE_SCANNER_GUIDE.md` for complete documentation including:
- Detailed setup instructions
- Scanner configuration
- Printing barcode labels
- Advanced features
- Troubleshooting guide

## ✨ That's It!

Your POS system now supports barcode scanning. Just plug in a scanner and start scanning!
