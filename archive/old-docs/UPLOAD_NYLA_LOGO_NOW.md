# Upload Nyla Wigs Logo - URGENT

## Current Issue
The database has `logo_url: '/nyla-logo.png'` but the actual logo file doesn't exist in the `/public` folder.

## Solution: Upload Your Logo

### Step 1: Prepare Your Logo
1. Get your Nyla Wigs logo file (PNG, JPG, or SVG format)
2. Recommended size: 512x512 pixels or larger (square format works best)
3. Make sure the background is transparent (PNG) or white

### Step 2: Upload to Public Folder
1. Place your logo file in the `/public` folder
2. Name it: `nyla-logo.png` (or update the database to match your filename)

### Step 3: Update Database (if using different filename)
If your logo has a different name, run this SQL in Supabase:

```sql
UPDATE shop_settings 
SET logo_url = '/your-actual-logo-filename.png'
WHERE business_name = 'Nyla Wigs';
```

## Alternative: Use External URL
If you have your logo hosted elsewhere (like Cloudinary, AWS S3, etc.):

```sql
UPDATE shop_settings 
SET logo_url = 'https://your-cdn.com/nyla-logo.png'
WHERE business_name = 'Nyla Wigs';
```

## Current Fallback
Until you upload the logo, the system shows:
- A large "N" (first letter of Nyla Wigs) in a styled circle
- This is a professional fallback, but your actual logo will look better

## After Upload
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Refresh the login page
3. Your logo will appear instead of the "N"

## For Future Businesses
When selling to other businesses:
1. Ask them to provide their logo (512x512 PNG recommended)
2. Upload to `/public/business-name-logo.png`
3. Update their shop_settings record with the correct logo_url
4. System automatically displays their logo everywhere
