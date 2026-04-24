# CN811-UB-5315 Thermal Printer Setup Guide

## Printer Specifications
- **Model**: CN811-UB-5315
- **Type**: USB Thermal Receipt Printer
- **Paper Width**: 80mm (3.15 inches)
- **Connection**: USB
- **Compatible**: Windows, Mac, Linux

## Step-by-Step Setup

### 1. Install Printer Driver

**Windows:**
1. Download the driver from the manufacturer's website or use the CD that came with the printer
2. Connect the printer to your computer via USB
3. Run the driver installer
4. Follow the installation wizard
5. Restart your computer if prompted

**Alternative (Windows):**
- Windows may automatically detect and install the driver
- Go to Settings → Devices → Printers & scanners
- Click "Add a printer or scanner"
- Select the CN811 printer when it appears

**Mac:**
1. Connect the printer via USB
2. Go to System Preferences → Printers & Scanners
3. Click the "+" button to add a printer
4. Select the CN811 printer from the list
5. Mac will automatically download and install the driver

**Linux:**
1. Most Linux distributions support ESC/POS printers automatically
2. Connect via USB
3. The printer should appear in your printer list
4. If not, install CUPS and add the printer manually

### 2. Configure Printer Settings

1. Open **Control Panel** → **Devices and Printers** (Windows)
   Or **System Preferences** → **Printers & Scanners** (Mac)

2. Right-click on the CN811 printer → **Printing Preferences**

3. Set the following:
   - **Paper Size**: 80mm (or Custom: 80mm width)
   - **Orientation**: Portrait
   - **Quality**: Normal or High
   - **Paper Type**: Receipt Paper

4. Click **Apply** and **OK**

### 3. Test the Printer

**Print a Test Page:**
1. Right-click on the CN811 printer
2. Select "Printer properties"
3. Click "Print Test Page"
4. A test receipt should print

**If test page doesn't print:**
- Check USB connection
- Ensure printer is powered on
- Check if paper is loaded correctly
- Verify driver is installed correctly

### 4. Configure Your POS System

**Enable Auto-Print (Recommended):**
1. Open your POS system: https://smart-pos-system.vercel.app
2. Go to **Settings**
3. Find **"Auto-Print Receipts"** toggle
4. Turn it **ON**
5. Setting is saved automatically

**Set as Default Printer (Optional but Recommended):**
1. Go to **Control Panel** → **Devices and Printers**
2. Right-click on the CN811 printer
3. Select **"Set as default printer"**
4. This ensures receipts always print to the thermal printer

### 5. Print Your First Receipt

1. Go to the **POS** page
2. Add items to cart
3. Click **Checkout**
4. Complete the transaction
5. The receipt preview will appear
6. If auto-print is enabled, the print dialog opens automatically
7. Select **CN811** printer (if not already selected)
8. Click **Print**

### 6. Optimize Print Settings

**For Best Results:**

1. **In the Print Dialog:**
   - Printer: CN811-UB-5315
   - Paper Size: 80mm or Custom (80mm x continuous)
   - Scale: 100% (Actual size)
   - Margins: Minimum or None
   - Headers/Footers: None

2. **Browser Settings:**
   - Chrome/Edge: Settings → Advanced → Printing
   - Disable "Print headers and footers"
   - Enable "Background graphics" (for colored elements)

### 7. Troubleshooting

**Problem: Receipt is cut off or too wide**
- Solution: Ensure paper size is set to 80mm in printer preferences
- Check that scale is set to 100% in print dialog

**Problem: Print quality is poor**
- Solution: Clean the thermal print head
- Check paper quality (use thermal paper, not regular paper)
- Adjust print density in printer settings

**Problem: Printer not responding**
- Solution: 
  - Check USB cable connection
  - Restart the printer (power off/on)
  - Restart your computer
  - Reinstall the driver

**Problem: Wrong printer selected**
- Solution: Set CN811 as default printer
- Or manually select it each time in the print dialog

**Problem: Auto-print not working**
- Solution:
  - Check that auto-print is enabled in Settings
  - Refresh the browser page
  - Allow popups for the site if blocked

### 8. Paper Loading

1. Open the printer cover
2. Insert thermal paper roll (print side facing up)
3. Feed paper through the slot
4. Close the cover (it will auto-cut the paper)
5. The printer is ready to use

**Paper Specifications:**
- Width: 80mm (±0.5mm)
- Diameter: Up to 83mm roll
- Type: Thermal paper (heat-sensitive)
- Thickness: 55-80 microns

### 9. Maintenance Tips

- **Clean print head monthly**: Use isopropyl alcohol and a soft cloth
- **Use quality thermal paper**: Prevents paper jams and ensures clear prints
- **Keep printer dust-free**: Cover when not in use
- **Check paper regularly**: Replace before it runs out to avoid interruptions

### 10. Advanced: Silent Printing (Optional)

For completely automatic printing without dialogs, you would need:
- A browser extension (like "Print Friendly & PDF")
- Or a desktop application wrapper
- Or specialized POS hardware with built-in printing

The current setup (auto-print with dialog) is the standard web-based approach and works perfectly for most businesses.

## Quick Reference

**Daily Use:**
1. Turn on printer
2. Load paper if needed
3. Open POS system
4. Complete transactions
5. Receipts print automatically (if auto-print enabled)

**Common Settings:**
- Paper: 80mm thermal
- Connection: USB
- Auto-print: Enabled in Settings
- Default printer: CN811-UB-5315

## Support

If you encounter issues:
1. Check this guide first
2. Verify printer is powered and connected
3. Test with a different USB port
4. Reinstall the driver
5. Contact printer manufacturer support

Your receipt is already formatted perfectly for the CN811 printer - no code changes needed!
