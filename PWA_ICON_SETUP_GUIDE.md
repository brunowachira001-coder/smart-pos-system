# PWA Icon Setup Guide - Fix Home Screen Logo

## Problem
The app installs on mobile but shows no logo or a generic icon on the home screen.

## Solution
You need to create PWA icons in the correct sizes and add them to your project.

## Option 1: Use Our Icon Generator (Easiest)

1. **Go to:** `https://your-site.vercel.app/generate-icons.html`
2. **Upload** your Nyla Wigs logo (PNG or JPG)
3. **Click** "Generate All Icons"
4. **Download** all 4 generated icons:
   - `pwa-icon-192.png`
   - `pwa-icon-512.png`
   - `pwa-icon-maskable-192.png`
   - `pwa-icon-maskable-512.png`

5. **Upload to Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to the `public` folder
   - Upload all 4 icon files
   - Redeploy the site

## Option 2: Use Online Tool (Recommended)

1. **Go to:** https://www.pwabuilder.com/imageGenerator
2. **Upload** your logo
3. **Download** the generated icon package
4. **Extract** and find the 192x192 and 512x512 PNG files
5. **Rename them:**
   - Rename to `pwa-icon-192.png` and `pwa-icon-512.png`
   - Create copies named `pwa-icon-maskable-192.png` and `pwa-icon-maskable-512.png`
6. **Upload** to your project's `/public` folder
7. **Redeploy**

## Option 3: Manual Creation

If you have image editing software (Photoshop, GIMP, Canva):

1. **Create 4 PNG images:**
   - 192x192 pixels
   - 512x512 pixels
   - Both in regular and maskable versions

2. **Design Guidelines:**
   - **Regular icons:** Logo can fill 90% of the canvas
   - **Maskable icons:** Logo should be centered and fill only 70% (safe zone)
   - **Background:** White for regular, brand color (#4f46e5) for maskable
   - **Format:** PNG with transparency

3. **Name the files:**
   - `pwa-icon-192.png`
   - `pwa-icon-512.png`
   - `pwa-icon-maskable-192.png`
   - `pwa-icon-maskable-512.png`

4. **Upload** to `/public` folder and redeploy

## After Adding Icons:

1. **Redeploy** your site on Vercel
2. **Clear** browser cache on mobile
3. **Uninstall** the old app from home screen
4. **Reinstall** the app - the logo should now appear!

## Testing:

- **Android:** Logo should appear immediately
- **iOS:** Logo appears after adding to home screen
- **Check:** Open the app - it should look like a native app with your logo

## Troubleshooting:

**Logo still not showing?**
- Clear browser cache completely
- Uninstall and reinstall the app
- Wait 5-10 minutes for CDN to update
- Check that icon files are in `/public` folder (not `/public/icons`)
- Verify icon file names match exactly (case-sensitive)

**Icons look stretched or cut off?**
- Make sure your logo is square (same width and height)
- For maskable icons, keep logo in the center 70% of the canvas
- Use PNG format with transparent background

## Current Status:
✅ Manifest configured correctly
✅ Icon generator page created
⏳ Waiting for icon files to be uploaded
