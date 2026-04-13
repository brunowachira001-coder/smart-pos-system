# QuantyX Website - Testing Guide & Tools

## Quick Start Testing

### 1. LOCAL TESTING (Before Deployment)

**Start a Local Server:**
```bash
# Navigate to quantyx folder
cd websites/quantyx

# Python 3
python -m http.server 8000

# Then open: http://localhost:8000/quantyx_homepage.html
```

---

## TESTING TOOLS & RESOURCES

### 1. LINK TESTING

**Manual Testing:**
1. Open each page
2. Click every link
3. Verify destination
4. Check for 404 errors

**Automated Tools:**
- **Broken Link Checker**: https://www.brokenlinkcheck.com/
- **W3C Link Checker**: https://validator.w3.org/checklink
- **Chrome DevTools**: Right-click → Inspect → Console (check for errors)

---

### 2. CONTACT FORM TESTING

**Test Cases:**

**Valid Submission:**
```
Name: John Doe
Email: john@example.com
Subject: Website Inquiry
Message: I'm interested in your services
Expected: Success message appears
```

**Invalid Email:**
```
Name: John Doe
Email: notanemail
Subject: Test
Message: Test message
Expected: Error message "Please enter a valid email address"
```

**Empty Fields:**
```
Leave any field empty
Expected: Error message for that field
```

**Tools:**
- Chrome DevTools → Network tab (check form submission)
- Console tab (check for JavaScript errors)

---

### 3. MOBILE DEVICE TESTING

**Using Chrome DevTools:**
1. Open Chrome
2. Press `F12` or `Ctrl+Shift+I`
3. Click device icon (top-left)
4. Select device from dropdown
5. Test all pages

**Devices to Test:**
- iPhone SE (375px)
- iPhone 12 (390px)
- iPhone 14 Pro Max (430px)
- Samsung Galaxy S21 (360px)
- iPad (768px)
- iPad Pro (1024px)

**Real Device Testing:**
- Test on actual iPhone/Android
- Test on actual iPad/tablet
- Check touch interactions
- Verify form usability

**Checklist:**
- [ ] No horizontal scrolling
- [ ] Text readable without zoom
- [ ] Buttons easy to tap (44px+)
- [ ] Images load properly
- [ ] Animations smooth

---

### 4. BROWSER COMPATIBILITY TESTING

**Browsers to Test:**

**Desktop:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Mobile:**
- Chrome Mobile
- Safari Mobile (iOS)
- Firefox Mobile

**Tools:**
- **BrowserStack**: https://www.browserstack.com/ (paid, real devices)
- **LambdaTest**: https://www.lambdatest.com/ (paid, real devices)
- **Chrome DevTools**: Built-in device emulation
- **Firefox DevTools**: Built-in device emulation

**What to Check:**
- [ ] Layout renders correctly
- [ ] Colors display accurately
- [ ] Fonts load properly
- [ ] Animations work smoothly
- [ ] No console errors
- [ ] Forms work correctly

---

### 5. PAGE LOAD SPEED TESTING

**Free Tools:**

**Google PageSpeed Insights:**
1. Go to: https://pagespeed.web.dev/
2. Enter your URL
3. Check scores (target: 80+)
4. Review recommendations

**GTmetrix:**
1. Go to: https://gtmetrix.com/
2. Enter your URL
3. Analyze performance
4. Check waterfall chart

**WebPageTest:**
1. Go to: https://www.webpagetest.org/
2. Enter your URL
3. Select location
4. Run test
5. Review results

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Click "Analyze page load"
4. Review performance metrics

**Performance Targets:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Total Page Size: < 3MB

---

### 6. IMAGE LOADING TEST

**Manual Check:**
1. Open each page
2. Wait for full load
3. Check all images appear
4. Verify image quality
5. Check SVG rendering

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check all images load
5. Look for failed requests (red)

**Check:**
- [ ] All images load
- [ ] No broken image icons
- [ ] SVGs render correctly
- [ ] Images are crisp
- [ ] No pixelation

---

### 7. ANIMATION TESTING

**Manual Testing:**
1. Scroll through each page
2. Watch for fade-in animations
3. Hover over buttons/cards
4. Check smooth transitions
5. Verify no lag

**Performance Check:**
- Open DevTools (F12)
- Go to Performance tab
- Record while scrolling
- Check for 60 FPS
- Look for dropped frames

**Checklist:**
- [ ] Scroll animations work
- [ ] Hover effects smooth
- [ ] Logo animations play
- [ ] Form animations work
- [ ] 60 FPS performance
- [ ] No stuttering

---

### 8. COLOR CONTRAST TESTING

**Tools:**

**WebAIM Contrast Checker:**
1. Go to: https://webaim.org/resources/contrastchecker/
2. Enter foreground color
3. Enter background color
4. Check WCAG levels (AA/AAA)

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Run accessibility audit
4. Check contrast issues

**Manual Check:**
- [ ] Text readable on background
- [ ] Links visible
- [ ] Buttons clear
- [ ] Error messages visible
- [ ] All text WCAG AA compliant

**Target Ratios:**
- Normal text: 4.5:1 (AA), 7:1 (AAA)
- Large text: 3:1 (AA), 4.5:1 (AAA)

---

### 9. KEYBOARD NAVIGATION TESTING

**Manual Testing:**
1. Open page
2. Press Tab key repeatedly
3. Check focus indicator visible
4. Verify logical order
5. Test form submission with Enter
6. Test modal close with Escape

**Checklist:**
- [ ] Tab moves through elements
- [ ] Focus indicator visible
- [ ] Tab order logical
- [ ] Enter submits form
- [ ] Escape closes modal
- [ ] No keyboard traps

**Tools:**
- Chrome DevTools → Accessibility tab
- Lighthouse Accessibility audit

---

### 10. RESPONSIVE DESIGN TESTING

**Chrome DevTools:**
1. Open DevTools (F12)
2. Click device icon
3. Select "Responsive"
4. Drag to resize
5. Test all breakpoints

**Breakpoints to Test:**
- 320px (Mobile)
- 480px (Mobile)
- 768px (Tablet)
- 1024px (Tablet)
- 1440px (Desktop)
- 1920px (Large Desktop)

**Checklist:**
- [ ] Mobile: 1 column layout
- [ ] Tablet: 2 column layout
- [ ] Desktop: 3+ column layout
- [ ] No horizontal scrolling
- [ ] Text readable
- [ ] Images scale properly
- [ ] Navigation works

---

## TESTING WORKFLOW

### Step 1: Local Testing (Day 1)
```
1. Start local server
2. Test all links
3. Test contact form
4. Check images load
5. Test animations
```

### Step 2: Device Testing (Day 2)
```
1. Test on mobile (DevTools)
2. Test on tablet (DevTools)
3. Test on real devices (if available)
4. Check responsiveness
5. Verify touch interactions
```

### Step 3: Browser Testing (Day 3)
```
1. Test on Chrome
2. Test on Firefox
3. Test on Safari
4. Test on Edge
5. Check for console errors
```

### Step 4: Performance Testing (Day 4)
```
1. Run PageSpeed Insights
2. Run GTmetrix
3. Check load times
4. Optimize if needed
5. Re-test
```

### Step 5: Accessibility Testing (Day 5)
```
1. Test keyboard navigation
2. Check color contrast
3. Run Lighthouse audit
4. Test with screen reader
5. Fix issues
```

---

## COMMON ISSUES & FIXES

### Issue: Links Not Working
**Solution:**
- Check file paths are correct
- Verify file names match
- Check for typos in href
- Use relative paths

### Issue: Form Not Submitting
**Solution:**
- Check form ID matches JavaScript
- Verify input names are correct
- Check for JavaScript errors in console
- Test in different browser

### Issue: Images Not Loading
**Solution:**
- Check file path is correct
- Verify file exists
- Check file permissions
- Try different image format

### Issue: Animations Laggy
**Solution:**
- Check for too many animations
- Reduce animation complexity
- Check browser performance
- Test on different device

### Issue: Mobile Layout Broken
**Solution:**
- Check media queries
- Verify viewport meta tag
- Test on real device
- Check CSS breakpoints

---

## FINAL CHECKLIST BEFORE DEPLOYMENT

- [ ] All links tested and working
- [ ] Contact form tested and working
- [ ] Mobile responsive verified
- [ ] Cross-browser tested
- [ ] Page speed acceptable
- [ ] All images loading
- [ ] Animations smooth
- [ ] Color contrast good
- [ ] Keyboard navigation works
- [ ] No console errors
- [ ] No broken links
- [ ] Analytics code added
- [ ] SSL certificate ready
- [ ] Domain configured
- [ ] Backup created

**Status: ✓ READY FOR DEPLOYMENT**

---

## DEPLOYMENT COMMANDS

```bash
# Build for production (if using build tool)
npm run build

# Or simply upload files to hosting

# Verify deployment
1. Visit your domain
2. Test all pages
3. Check links work
4. Verify contact form
5. Monitor for errors
```

---

## POST-DEPLOYMENT MONITORING

**First Week:**
- [ ] Monitor error logs daily
- [ ] Check page speed
- [ ] Verify all pages load
- [ ] Test contact form submissions
- [ ] Monitor analytics

**Ongoing:**
- [ ] Weekly error log review
- [ ] Monthly performance check
- [ ] Monthly security check
- [ ] Quarterly content review
- [ ] Update as needed

---

**Good luck with your deployment!** 🚀

