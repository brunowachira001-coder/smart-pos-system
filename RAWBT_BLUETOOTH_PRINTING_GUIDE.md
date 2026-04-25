# RawBT Bluetooth Printing Integration Guide

## What is RawBT?

RawBT is an Android app that acts as a bridge between web applications and Bluetooth thermal printers. It allows your POS system to print receipts wirelessly to Bluetooth printers from tablets or smartphones.

## Use Cases

- **Mobile POS**: Run POS on Android tablets with Bluetooth printer
- **Wireless Setup**: No USB cables needed
- **Portable**: Take your POS anywhere
- **Multiple Devices**: Several tablets can connect to the same printer

## Prerequisites

1. **Android Device** (phone or tablet) running Android 4.0+
2. **Bluetooth Thermal Printer** (CN811 with Bluetooth or similar)
3. **RawBT App** (free from Google Play Store)
4. **Your POS System** (already set up)

## Step-by-Step Setup

### 1. Install RawBT App

1. Open **Google Play Store** on your Android device
2. Search for **"RawBT"** or **"Raw Bluetooth Printer"**
3. Install the app (by Mobile Solutions)
4. Open the app after installation

### 2. Pair Bluetooth Printer

**On Your Android Device:**
1. Go to **Settings** → **Bluetooth**
2. Turn Bluetooth **ON**
3. Make sure your printer is powered on and in pairing mode
4. Look for your printer in available devices (e.g., "CN811" or "Thermal Printer")
5. Tap to pair (PIN is usually 0000 or 1234)
6. Wait for "Connected" status

### 3. Configure RawBT App

1. Open **RawBT** app
2. Tap **"Select Printer"**
3. Choose your paired Bluetooth printer from the list
4. Tap **"Start Service"** or **"Enable"**
5. The app will run in the background
6. You should see "Service Running" status

**Important Settings in RawBT:**
- **Auto-start**: Enable (so it starts when device boots)
- **Keep service running**: Enable
- **Port**: Default (9100) - remember this number

### 4. Modify Your POS System for Bluetooth Printing

I'll add a Bluetooth printing option to your system. This requires adding ESC/POS commands support.

**Option A: Simple Approach (Using RawBT Print Intent)**

The easiest way is to use RawBT's print intent feature. When you click print, it sends data directly to RawBT.

**Option B: Advanced Approach (Direct ESC/POS Commands)**

Send raw ESC/POS commands to the printer for more control over formatting.

## Implementation

### Method 1: Using RawBT Print Intent (Recommended for Mobile)

This method works when accessing your POS from the Android device's browser:

1. **Detect if on Android**:
```javascript
const isAndroid = /Android/i.test(navigator.userAgent);
```

2. **Create Print Intent**:
```javascript
// Format receipt as plain text
const receiptText = `
${shopName}
${shopAddress}
${shopPhone}
----------------------------
RECEIPT
----------------------------
Receipt No: ${transactionNumber}
Date: ${date}
Time: ${time}
Customer: ${customerName}
Cashier: ${cashierName}
----------------------------
${items.map(item => 
  `${item.quantity}x ${item.product_name}
   ${item.unit_price} x ${item.quantity} = ${item.subtotal}`
).join('\n')}
----------------------------
TOTAL: ${total}
Payment: ${paymentMethod}
Amount Paid: ${amountPaid}
Change: ${change}
----------------------------
Thank you for shopping!
`;

// Send to RawBT
const printUrl = `rawbt:base64,${btoa(receiptText)}`;
window.location.href = printUrl;
```

### Method 2: Using RawBT Web Service (For Any Device on Same Network)

This works even from a computer if it's on the same WiFi as the Android device:

1. **In RawBT App**:
   - Enable "Web Service"
   - Note the IP address shown (e.g., 192.168.1.100:9100)

2. **From Your POS**:
```javascript
async function printViaBluetooth(receiptData) {
  const rawbtIP = '192.168.1.100'; // Your Android device IP
  const rawbtPort = '9100';
  
  // Format receipt as ESC/POS commands
  const escposData = formatReceiptAsESCPOS(receiptData);
  
  try {
    const response = await fetch(`http://${rawbtIP}:${rawbtPort}/print`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: escposData
      })
    });
    
    if (response.ok) {
      console.log('Print sent successfully');
    }
  } catch (error) {
    console.error('Bluetooth print failed:', error);
  }
}
```

## ESC/POS Command Reference

For advanced formatting, use ESC/POS commands:

```javascript
const ESC = '\x1B';
const GS = '\x1D';

// Common commands
const COMMANDS = {
  INIT: ESC + '@',           // Initialize printer
  ALIGN_CENTER: ESC + 'a' + '1',
  ALIGN_LEFT: ESC + 'a' + '0',
  ALIGN_RIGHT: ESC + 'a' + '2',
  BOLD_ON: ESC + 'E' + '1',
  BOLD_OFF: ESC + 'E' + '0',
  SIZE_NORMAL: GS + '!' + '\x00',
  SIZE_DOUBLE: GS + '!' + '\x11',
  SIZE_LARGE: GS + '!' + '\x22',
  CUT_PAPER: GS + 'V' + '1',
  LINE_FEED: '\n',
};

function formatReceiptAsESCPOS(data) {
  let receipt = COMMANDS.INIT;
  
  // Header - Centered, Large
  receipt += COMMANDS.ALIGN_CENTER;
  receipt += COMMANDS.SIZE_LARGE;
  receipt += COMMANDS.BOLD_ON;
  receipt += data.shopName + COMMANDS.LINE_FEED;
  receipt += COMMANDS.SIZE_NORMAL;
  receipt += COMMANDS.BOLD_OFF;
  receipt += data.shopAddress + COMMANDS.LINE_FEED;
  receipt += data.shopPhone + COMMANDS.LINE_FEED;
  receipt += '--------------------------------' + COMMANDS.LINE_FEED;
  
  // Receipt Title
  receipt += COMMANDS.SIZE_DOUBLE;
  receipt += COMMANDS.BOLD_ON;
  receipt += 'RECEIPT' + COMMANDS.LINE_FEED;
  receipt += COMMANDS.SIZE_NORMAL;
  receipt += COMMANDS.BOLD_OFF;
  receipt += '--------------------------------' + COMMANDS.LINE_FEED;
  
  // Transaction Details - Left Aligned
  receipt += COMMANDS.ALIGN_LEFT;
  receipt += `Receipt No: ${data.transactionNumber}` + COMMANDS.LINE_FEED;
  receipt += `Date: ${data.date}` + COMMANDS.LINE_FEED;
  receipt += `Time: ${data.time}` + COMMANDS.LINE_FEED;
  receipt += `Customer: ${data.customerName}` + COMMANDS.LINE_FEED;
  receipt += `Cashier: ${data.cashierName}` + COMMANDS.LINE_FEED;
  receipt += '--------------------------------' + COMMANDS.LINE_FEED;
  
  // Items
  data.items.forEach(item => {
    receipt += `${item.quantity}x ${item.product_name}` + COMMANDS.LINE_FEED;
    receipt += `  ${item.unit_price} x ${item.quantity} = ${item.subtotal}` + COMMANDS.LINE_FEED;
  });
  receipt += '--------------------------------' + COMMANDS.LINE_FEED;
  
  // Total - Bold, Large
  receipt += COMMANDS.SIZE_DOUBLE;
  receipt += COMMANDS.BOLD_ON;
  receipt += `TOTAL: ${data.total}` + COMMANDS.LINE_FEED;
  receipt += COMMANDS.SIZE_NORMAL;
  receipt += COMMANDS.BOLD_OFF;
  
  // Payment Details
  receipt += `Payment: ${data.paymentMethod}` + COMMANDS.LINE_FEED;
  receipt += `Amount Paid: ${data.amountPaid}` + COMMANDS.LINE_FEED;
  receipt += `Change: ${data.change}` + COMMANDS.LINE_FEED;
  receipt += '--------------------------------' + COMMANDS.LINE_FEED;
  
  // Footer - Centered
  receipt += COMMANDS.ALIGN_CENTER;
  receipt += 'Thank you for shopping!' + COMMANDS.LINE_FEED;
  receipt += COMMANDS.LINE_FEED;
  receipt += COMMANDS.LINE_FEED;
  
  // Cut paper
  receipt += COMMANDS.CUT_PAPER;
  
  return receipt;
}
```

## Quick Setup Guide

### For Mobile/Tablet POS:

1. **Install RawBT** on Android device
2. **Pair Bluetooth printer**
3. **Start RawBT service**
4. **Open POS in Chrome browser** on the same device
5. **Enable Bluetooth printing** in POS settings (I'll add this option)
6. **Complete a transaction** - receipt prints via Bluetooth!

### For Computer + Android Bridge:

1. **Install RawBT** on Android device
2. **Connect Android and Computer** to same WiFi
3. **Enable Web Service** in RawBT
4. **Note the IP address** shown in RawBT
5. **Configure IP in POS settings**
6. **Print** - data goes through WiFi to Android to Bluetooth printer

## Advantages of RawBT

✅ **Wireless**: No USB cables needed
✅ **Mobile**: Perfect for tablets
✅ **Portable**: Take POS anywhere
✅ **Simple**: Easy setup
✅ **Free**: RawBT app is free
✅ **Reliable**: Works with most Bluetooth thermal printers

## Limitations

⚠️ **Android Only**: RawBT only works on Android
⚠️ **Bluetooth Range**: Limited to ~10 meters
⚠️ **One Printer**: One Android device connects to one printer at a time
⚠️ **Battery**: Keep Android device charged

## Troubleshooting

**Printer not found in RawBT:**
- Ensure printer is in pairing mode
- Check printer is powered on
- Try unpairing and re-pairing

**Print not working:**
- Check RawBT service is running
- Verify Bluetooth connection is active
- Restart RawBT app
- Re-pair the printer

**Garbled text:**
- Check character encoding (use UTF-8)
- Verify ESC/POS commands are correct
- Test with simple text first

**Connection drops:**
- Keep devices within Bluetooth range
- Ensure printer battery is charged (if portable)
- Disable battery optimization for RawBT app

## Next Steps

Would you like me to:
1. Add a Bluetooth printing option to your POS settings?
2. Implement ESC/POS formatting for better receipt layout?
3. Add automatic printer detection?
4. Create a mobile-optimized POS interface?

Let me know and I'll implement it!
