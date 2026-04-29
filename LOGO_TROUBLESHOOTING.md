# Logo Not Showing - Troubleshooting Guide

## Issue
The landing page is showing the generic sparkle icon instead of your Nyla Wigs logo from shop settings.

## Possible Causes & Solutions

### 1. Browser Cache (Most Likely)
Your browser might be showing an old cached version.

**Solution:**
```
Chrome/Edge: Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
- Select "Cached images and files"
- Click "Clear data"
- Or try: Ctrl+Shift+R (hard refresh)

Safari: Cmd+Option+E (Empty caches)
Firefox: Ctrl+Shift+Delete
```

### 2. Check if Logo is in Database
The logo needs to be uploaded in Shop Settings first.

**Steps to verify:**
1. Login to your dashboard
2. Go to "Shop Settings" page
3. Check if logo is uploaded
4. If not, upload your Nyla Wigs logo
5. Save settings
6. Refresh landing page

### 3. Check Console for Errors
Open browser console to see if logo is loading:

**Steps:**
1. Visit landing page
2. Press F12 (open DevTools)
3. Go to "Console" tab
4. Look for these messages:
   - "Shop settings loaded: ..." (should show your settings)
   - "Shop logo URL: ..." (should show logo URL)
5. Check "Network" tab for failed requests

### 4. Verify API is Working
Test if shop settings API is returning data:

**Test URL:**
```
https://your-domain.vercel.app/api/shop-settings
```

Should return:
```json
{
  "settings": {
    "shop_name": "Nyla Wigs",
    "shop_logo": "https://...",
    ...
  }
}
```

### 5. Check Logo URL Format
The logo URL in database should be a valid image URL:

**Valid formats:**
- `https://supabase.co/storage/...`
- `https://your-domain.com/logo.png`
- Full URL starting with `http://` or `https://`

**Invalid:**
- Relative paths like `/images/logo.png`
- Local file paths

## Quick Fix Steps

### Step 1: Clear Cache
```
1. Press Ctrl+Shift+R (hard refresh)
2. Or clear browser cache completely
```

### Step 2: Check Shop Settings
```
1. Login to dashboard
2. Go to Shop Settings
3. Verify logo is uploaded
4. If not, upload it now
```

### Step 3: Check Console
```
1. Press F12
2. Go to Console tab
3. Look for "Shop logo URL: ..."
4. If it shows a URL, the logo is loading
5. If it shows "undefined", logo is not in database
```

### Step 4: Test API Directly
```
Visit: https://your-domain.vercel.app/api/shop-settings
Check if shop_logo field has a value
```

## Expected Behavior

### When Logo Exists:
- Header: Shows your logo (small, top left)
- Hero: Shows your logo (large, center with glow)

### When No Logo:
- Header: Shows default icon
- Hero: Shows sparkle icon

## Debug Checklist

- [ ] Cleared browser cache
- [ ] Hard refreshed page (Ctrl+Shift+R)
- [ ] Checked Shop Settings has logo uploaded
- [ ] Opened browser console (F12)
- [ ] Verified "Shop logo URL" appears in console
- [ ] Tested API endpoint directly
- [ ] Logo URL is valid (starts with https://)
- [ ] Waited 2-3 minutes for deployment

## Still Not Working?

### Check These:

1. **Logo File Type**
   - Should be: PNG, JPG, or SVG
   - Size: Under 5MB
   - Format: Valid image file

2. **Logo URL Accessibility**
   - Open logo URL in new tab
   - Should display the image
   - If 404 error, logo file is missing

3. **Database Connection**
   - Check if other shop settings load
   - Verify shop name appears correctly
   - If nothing loads, database issue

4. **Deployment Status**
   - Check Vercel dashboard
   - Verify latest deployment succeeded
   - Look for build errors

## Manual Override (Temporary)

If you need the logo to show immediately while troubleshooting:

1. Save your logo as `public/nyla-logo.png`
2. Update code to use it directly
3. This bypasses database fetch

## Contact Support

If none of these work:
1. Check browser console for errors
2. Test API endpoint
3. Verify logo is in database
4. Check Vercel deployment logs

---

**Most Common Fix**: Clear browser cache and hard refresh (Ctrl+Shift+R)
