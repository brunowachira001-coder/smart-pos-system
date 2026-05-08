# Receipt Printing Guide

## Overview

Your POS system now supports receipt printing with multiple options:
- **Print to Thermal Printer** (80mm receipt printers)
- **Print to Regular Printer** (A4/Letter size)
- **Save as PDF**
- **Email Receipt** (future enhancement)

## How It Works

### 1. After Checkout
When you complete a transaction in the POS:
1. The checkout completes successfully
2. A receipt preview modal automatically appears
3. You can:
   - **Print** - Opens browser print dialog
   - **Save as PDF** - Use browser's "Save as PDF" option
   - **Close** - Close without printing

### 2. Receipt Information Included

Each receipt contains:
- **Shop Information**: Name, address, phone, email
- **Transaction Details**: Receipt number, date, customer, cashier
- **Items List**: Product name, quantity, unit price, subtotal, price type (retail/wholesale)
- **Totals**: Subtotal, discount, tax, total
- **Payment Info**: Payment method, amount paid, change

## Printing Options

### Option 1: Thermal Receipt Printer (Recommended for POS)

**Supported Printers:**
- 80mm thermal printers (most common)
- ESC/POS compatible printers
- Examples: Epson TM-T20, Star TSP143, Bixolon SRP-350

**Setup Steps:**

1. **Connect Printer**:
   - USB: Plug into computer
   - Bluetooth: Pair with device
   - Network: Connect to same WiFi

2. **Install Drivers**:
   - Download from manufacturer website
   - Install printer drivers
   - Set as default printer (optional)

3. **Browser Setup**:
   - Chrome/Edge: Go to `chrome://settings/printing`
   - Enable "Print using system dialog"
   - Select your thermal printer

4. **Print Receipt**:
   - Click "Print" button in receipt modal
   - Select your thermal printer
   - Receipt prints automatically (80mm width)

**Thermal Printer Settings:**
- Paper Width: 80mm
- Margins: 0mm (borderless)
- Scale: 100%
- Paper Size: Custom (80mm x auto)

### Option 2: Regular Printer (A4/Letter)

**For Standard Office Printers:**

1. Click "Print" button
2. Select your regular printer
3. Choose paper size (A4 or Letter)
4. Print

The receipt will be formatted to fit on standard paper.

### Option 3: Save as PDF

**To Save Receipt as PDF:**

1. Click "Print" button
2. In print dialog, select "Save as PDF" or "Microsoft Print to PDF"
3. Choose location and filename
4. Click Save

**Use Cases:**
- Email to customer
- Archive for records
- Attach to accounting software

### Option 4: Mobile Printing

**For Tablets/Phones:**

1. **iOS (iPad/iPhone)**:
   - Click Print
   - Select AirPrint-compatible printer
   - Print

2. **Android**:
   - Click Print
   - Select printer (WiFi/Bluetooth)
   - Print

## Advanced Features

### Custom Shop Information

To add your shop details to receipts:

1. Go to **Shop Settings** page
2. Update:
   - Shop Name
   - Address
   - Phone Number
   - Email

These will automatically appear on all receipts.

### Automatic Printing

To enable automatic printing after checkout:

```javascript
// In pages/pos.tsx, modify handleCheckout:
if (response.ok) {
  // ... existing code ...
  
  // Auto-print receipt
  setTimeout(() => {
    window.print();
  }, 500);
}
```

### Print Multiple Copies

To print multiple copies:

1. Click Print
2. In print dialog, set "Copies" to desired number
3. Print

## Troubleshooting

### Receipt Not Printing

**Check:**
1. Printer is powered on
2. Printer has paper
3. Printer is connected (USB/WiFi/Bluetooth)
4. Printer drivers are installed
5. Browser has printer permissions

**Solutions:**
- Restart printer
- Reconnect USB/WiFi
- Update printer drivers
- Try different browser (Chrome recommended)

### Receipt Formatting Issues

**Problem**: Receipt is cut off or too small

**Solution**:
1. In print dialog, check:
   - Scale: 100%
   - Margins: None or Minimum
   - Paper size: 80mm (for thermal) or A4 (for regular)

**Problem**: Receipt is too wide

**Solution**:
- For thermal printers, ensure paper width is set to 80mm
- Check printer settings in browser

### Printer Not Detected

**Windows:**
1. Go to Settings > Devices > Printers & Scanners
2. Add printer
3. Install drivers

**Mac:**
1. Go to System Preferences > Printers & Scanners
2. Click "+" to add printer
3. Select printer and install

**Linux:**
1. Open CUPS (http://localhost:631)
2. Add printer
3. Install drivers

## Recommended Thermal Printers

### Budget-Friendly ($50-$100)
- **Munbyn ITPP047**: USB/Bluetooth, 80mm, ESC/POS
- **HOIN HOP-E58**: USB, 80mm, compact
- **Rongta RP80**: USB/Bluetooth, 80mm

### Professional ($100-$200)
- **Epson TM-T20III**: USB/Ethernet, reliable, fast
- **Star TSP143IIIU**: USB, auto-cutter, fast
- **Bixolon SRP-350III**: USB/Ethernet, durable

### Premium ($200+)
- **Epson TM-T88VI**: USB/Ethernet/Bluetooth, very fast
- **Star TSP654II**: Ethernet, auto-cutter, premium
- **Citizen CT-S310II**: USB/Bluetooth, compact

## Future Enhancements

### Coming Soon:
1. **Email Receipts**: Send receipt to customer email
2. **SMS Receipts**: Send receipt link via SMS
3. **Receipt Templates**: Customize receipt design
4. **Logo Upload**: Add your shop logo to receipts
5. **QR Code**: Add QR code for digital receipt
6. **Reprint**: Reprint past receipts from transactions page

### Planned Features:
- Receipt history/archive
- Custom receipt footer messages
- Multi-language receipts
- Receipt analytics
- Barcode on receipts

## Best Practices

1. **Always Print Receipt**: Provide receipt for every transaction
2. **Keep Copies**: Save PDF copies for records
3. **Test Printer**: Test print before opening shop
4. **Paper Stock**: Keep extra thermal paper rolls
5. **Backup Printer**: Have a backup printer or PDF option

## Support

### Need Help?
- Check printer manual
- Visit manufacturer support website
- Contact printer manufacturer
- Check browser print settings

### Common Issues:
- **Printer offline**: Restart printer and computer
- **Paper jam**: Clear paper path
- **Faded print**: Replace thermal paper roll
- **No print**: Check USB/network connection

---

**Last Updated**: April 23, 2026
**Feature Status**: ✅ Active and Working
