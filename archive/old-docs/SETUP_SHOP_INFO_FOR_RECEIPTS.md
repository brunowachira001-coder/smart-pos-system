# Setup Shop Information for Receipts

## Overview

Receipts now automatically pull your shop information from the database instead of using hardcoded data. This means your receipts will show:

- ✅ Your actual shop name
- ✅ Your shop address
- ✅ Your shop phone number
- ✅ Your shop email
- ✅ Current cashier's name (from logged-in user)

## How to Set Up Shop Information

### Step 1: Go to Shop Settings Page

1. Log in to your POS system
2. Click on **Shop Settings** in the sidebar
3. You'll see a form to enter your shop details

### Step 2: Fill in Your Shop Information

Enter the following details:

**Shop Name** (Required)
- Example: "Smart Traders Ltd"
- This appears at the top of every receipt

**Address** (Optional)
- Example: "123 Main Street, Nairobi"
- Appears below shop name on receipt

**Phone Number** (Optional)
- Example: "+254 712 345 678"
- Appears as "Tel: +254 712 345 678" on receipt

**Email** (Optional)
- Example: "info@smarttraders.com"
- Appears on receipt for customer inquiries

**Business Registration Number** (Optional)
- Example: "BN-12345678"
- For official business documentation

**Tax ID / PIN** (Optional)
- Example: "P051234567X"
- KRA PIN number for tax purposes

**Currency** (Optional)
- Default: KSH (Kenyan Shilling)
- Can be changed if needed

**Logo URL** (Optional)
- Upload your logo to Imgur or similar
- Paste the image URL
- Logo will appear on receipts (future feature)

### Step 3: Save Settings

1. Click **Save Settings** button
2. You'll see a success message
3. Your shop information is now saved!

### Step 4: Test Receipt

1. Go to **POS** page
2. Add items to cart
3. Complete a checkout
4. Click **Print** on the receipt preview
5. Verify your shop information appears correctly

## What Appears on Receipt

### With Shop Settings Configured:

```
================================
    SMART TRADERS LTD
    123 Main Street, Nairobi
    Tel: +254 712 345 678
    info@smarttraders.com
================================
Receipt #: TXN-20260423-001
Date: Apr 23, 2026, 3:45 PM
Customer: John Doe
Phone: +254 700 123 456
Cashier: Jane Smith
================================
```

### Without Shop Settings (Default):

```
================================
        SMART POS
================================
Receipt #: TXN-20260423-001
Date: Apr 23, 2026, 3:45 PM
Customer: John Doe
Cashier: Cashier
================================
```

## Cashier Name

The cashier name is automatically pulled from the logged-in user:

- Uses `full_name` if available
- Falls back to `name` if full_name is not set
- Falls back to `username` if name is not set
- Shows "Cashier" if no user data is available

**To set your full name:**
1. Go to **My Profile** page
2. Update your full name
3. Save changes
4. Your name will now appear on all receipts you process

## Database Structure

Shop settings are stored in the `shop_settings` table:

```sql
CREATE TABLE shop_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  shop_name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  business_registration_number TEXT,
  tax_id TEXT,
  currency TEXT DEFAULT 'KSH',
  logo_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Multiple Users / Branches

**Current Behavior:**
- System uses the first shop settings record found
- All users see the same shop information on receipts

**Future Enhancement:**
- Each user can have their own shop settings
- Useful for multiple branches
- Each branch can have different contact info

## Troubleshooting

### Shop Name Not Appearing on Receipt

**Check:**
1. Go to Shop Settings page
2. Verify shop name is filled in
3. Click Save Settings
4. Try printing receipt again

**If still not working:**
- Check browser console for errors
- Verify shop_settings table exists in Supabase
- Check API endpoint: `/api/shop-settings`

### Cashier Name Shows as "Cashier"

**Check:**
1. Verify you're logged in
2. Go to My Profile page
3. Update your full name
4. Save changes
5. Refresh POS page
6. Try checkout again

**If still not working:**
- Check localStorage has user data
- Log out and log back in
- Check browser console for errors

### Old Shop Name Still Showing

**Solution:**
- Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache
- Log out and log back in

## Best Practices

1. **Set Up Once**: Configure shop settings before going live
2. **Keep Updated**: Update contact info if it changes
3. **Test Receipts**: Print test receipt after any changes
4. **Backup Info**: Keep a copy of your shop details
5. **Train Staff**: Show team where to update shop info

## Example Shop Settings

### Retail Store:
```
Shop Name: Fashion Hub Nairobi
Address: Westlands Mall, Shop 45, Nairobi
Phone: +254 712 345 678
Email: info@fashionhub.co.ke
Tax ID: P051234567X
```

### Restaurant:
```
Shop Name: Mama's Kitchen
Address: Kimathi Street, Nairobi CBD
Phone: +254 700 123 456
Email: orders@mamaskitchen.com
Tax ID: P051987654Y
```

### Wholesale:
```
Shop Name: Smart Traders Wholesale
Address: Industrial Area, Nairobi
Phone: +254 722 333 444
Email: wholesale@smarttraders.com
Business Reg: BN-12345678
Tax ID: P051555666Z
```

## Future Enhancements

Coming soon:
- Logo upload and display on receipts
- Multiple shop profiles (for branches)
- Custom receipt templates
- Receipt footer messages
- Social media links on receipts
- QR code with shop info

---

**Last Updated**: April 23, 2026
**Status**: ✅ Active - Shop settings now integrated with receipts
