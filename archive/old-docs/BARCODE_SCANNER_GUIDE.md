# Barcode Scanner Integration Guide

## Overview

Your POS system now supports barcode scanning! When you scan a product's barcode, it automatically adds the item to the cart.

## How It Works

1. **Barcode scanner acts like a keyboard** - it types the barcode number and presses Enter
2. **System listens for rapid typing** - distinguishes scanner from human typing
3. **Searches product by SKU** - finds the product with matching barcode
4. **Adds to cart automatically** - uses current price mode (retail/wholesale)
5. **Shows confirmation** - displays success or error message

## Compatible Barcode Scanners

Any USB or Bluetooth barcode scanner that works in "keyboard emulation mode" will work:

### Recommended Scanners:
- **USB Wired Scanners** (Plug & Play)
  - Honeywell Voyager 1200g
  - Zebra DS2208
  - Symcode USB Barcode Scanner
  - Any generic USB barcode scanner

- **Wireless Bluetooth Scanners**
  - Tera Wireless Barcode Scanner
  - Inateck Bluetooth Barcode Scanner
  - Socket Mobile CHS Series

- **2D QR Code Scanners** (if you use QR codes)
  - Honeywell Xenon 1900
  - Zebra DS9208

## Setup Instructions

### For USB Barcode Scanners:

1. **Plug in the scanner** to your computer's USB port
2. **Wait for driver installation** (usually automatic)
3. **Test the scanner**:
   - Open Notepad or any text editor
   - Scan a barcode
   - You should see the barcode number appear followed by Enter
4. **Open your POS system** - scanner is ready to use!

### For Bluetooth Barcode Scanners:

1. **Turn on the scanner** and put it in pairing mode
2. **On your computer**:
   - Go to Bluetooth settings
   - Find the scanner in available devices
   - Pair with it (PIN usually 0000 or 1234)
3. **Test the scanner** in Notepad
4. **Open your POS system** - ready to scan!

## Scanner Configuration

Most scanners need to be configured to work properly. Use the scanner's manual to set:

### Required Settings:
1. **Keyboard Emulation Mode** - Scanner acts like a keyboard (default for most)
2. **Add Enter/Return Suffix** - Scanner presses Enter after barcode (REQUIRED)
3. **No Prefix** - Don't add any characters before barcode
4. **Fast Typing Speed** - Scanner types quickly (helps distinguish from human)

### Configuration Barcodes:
Most scanners come with a manual containing configuration barcodes. Scan these to set up:
- Enable "Keyboard Wedge Mode" or "HID Mode"
- Enable "Suffix: CR" (Carriage Return / Enter key)
- Disable any prefix characters

## Using the Barcode Scanner

### Basic Usage:

1. **Open POS page** in your system
2. **Select price mode** (Retail, Wholesale, or All)
   - If "All" is selected, it defaults to Retail price
3. **Scan product barcode**
4. **Product automatically adds to cart**
5. **Scan next product** - repeat as needed
6. **Click cart button** to checkout

### Important Notes:

✅ **Scanner works when**:
- You're on the POS page
- Checkout modal is closed
- Not typing in any input field

❌ **Scanner is disabled when**:
- Checkout modal is open
- You're typing in search box
- You're typing in any input field

### Visual Feedback:

- ✓ **Success**: Green toast notification "Product added to cart"
- ✗ **Error**: Red toast notification with error message
  - "Product not found: [barcode]"
  - "Product is out of stock"
  - "Error scanning barcode"

## Setting Up Product Barcodes

### In Your Database:

Your products already have a `sku` field - this is used as the barcode:

```sql
-- View products with SKUs
SELECT id, name, sku, stock_quantity FROM products;

-- Update a product's SKU/barcode
UPDATE products 
SET sku = '1234567890123' 
WHERE id = 'product-id';
```

### SKU/Barcode Format:

- **EAN-13**: 13 digits (e.g., 5901234123457)
- **UPC-A**: 12 digits (e.g., 012345678905)
- **Code 128**: Alphanumeric (e.g., ABC-123-XYZ)
- **Custom**: Any format you want (e.g., PROD-001)

### Adding Barcodes to Products:

1. **Go to Inventory page**
2. **Edit a product**
3. **Enter barcode in SKU field**
4. **Save**

Or bulk update via SQL:
```sql
-- Example: Add barcodes to existing products
UPDATE products SET sku = '5901234123457' WHERE name = 'Product A';
UPDATE products SET sku = '5901234123458' WHERE name = 'Product B';
```

## Printing Barcode Labels

To print barcode labels for your products:

### Option 1: Online Barcode Generator
1. Go to https://barcode.tec-it.com/en
2. Select barcode type (EAN-13, Code 128, etc.)
3. Enter your SKU
4. Download and print

### Option 2: Barcode Label Printer
- **Zebra ZD410** - Thermal label printer
- **Brother QL-820NWB** - Label printer with barcode support
- **DYMO LabelWriter 450** - Affordable option

### Option 3: Excel/Word Mail Merge
1. Export products to Excel
2. Use barcode font (download free barcode fonts)
3. Print labels on Avery label sheets

## Troubleshooting

### Scanner Not Working:

**Problem**: Nothing happens when scanning
- ✓ Check scanner is powered on
- ✓ Check USB/Bluetooth connection
- ✓ Test scanner in Notepad - does it type?
- ✓ Make sure you're on POS page
- ✓ Make sure checkout modal is closed

**Problem**: Scanner types but doesn't add to cart
- ✓ Check scanner is configured to send Enter key
- ✓ Check product SKU matches barcode exactly
- ✓ Check product exists in database

**Problem**: Wrong product added
- ✓ Check SKU in database matches barcode
- ✓ Check for duplicate SKUs in database

**Problem**: "Product not found" error
- ✓ Verify product exists with that SKU
- ✓ Check SKU is exact match (case-insensitive)
- ✓ Check product is not deleted

**Problem**: "Out of stock" error
- ✓ Check product stock_quantity > 0
- ✓ Restock the product in Inventory page

### Scanner Configuration Issues:

**Scanner adds extra characters**:
- Configure scanner to remove prefix/suffix
- Scan "Remove Prefix" barcode from manual
- Scan "Remove Suffix" barcode, then scan "Add CR Suffix"

**Scanner doesn't press Enter**:
- Scan "Add CR Suffix" or "Add Enter Suffix" from manual
- This is REQUIRED for the system to work

**Scanner types slowly**:
- This is fine, system will still work
- Faster typing helps distinguish from human input

## Advanced Features

### Multiple Quantity Scanning:

To add multiple quantities of the same item:
1. Scan the barcode multiple times
2. Each scan adds +1 to cart
3. Or manually adjust quantity in cart

### Price Mode Selection:

- **Retail Mode**: All scanned items use retail price
- **Wholesale Mode**: All scanned items use wholesale price
- **All Mode**: Scanned items default to retail price

### Keyboard Shortcuts:

While on POS page (not in input fields):
- Scanner automatically adds items
- Press `Esc` to close modals (future feature)

## Best Practices

1. **Use standard barcode formats** (EAN-13, UPC-A) for retail products
2. **Keep SKUs unique** - no duplicates
3. **Test scanner** before going live
4. **Train staff** on scanner usage
5. **Keep scanner charged** (for wireless models)
6. **Clean scanner lens** regularly
7. **Have backup** - manual search still works if scanner fails

## Scanner Recommendations by Budget

### Budget ($20-50):
- Generic USB barcode scanner from Amazon
- Works fine for basic needs
- Wired, reliable

### Mid-Range ($50-150):
- Honeywell Voyager 1200g
- Zebra DS2208
- Wireless Bluetooth options
- More durable, faster scanning

### Professional ($150-300):
- Honeywell Xenon 1900 (2D, QR codes)
- Zebra DS9208 (2D, presentation scanner)
- Wireless, long-range
- Rugged, industrial-grade

## Testing Your Setup

1. **Create test products** with known barcodes
2. **Print test barcode** or use existing product
3. **Open POS page**
4. **Scan barcode**
5. **Verify**:
   - Product appears in cart
   - Correct price is used
   - Quantity is 1
   - Success message shows

## Support

If you have issues:
1. Check this guide's troubleshooting section
2. Test scanner in Notepad first
3. Verify product SKU in database
4. Check browser console for errors (F12)

## Summary

✅ **Plug in scanner** → **Scan barcode** → **Item added to cart** → **Done!**

Your POS system is now ready for fast, efficient barcode scanning. This will significantly speed up your checkout process!
