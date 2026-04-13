# QuantyX Digital Technologies - Logo Documentation

## Logo Overview

A modern, professional logo system for QuantyX Digital Technologies featuring a futuristic abstract monogram with the tagline "Innovate.Build.Scale."

---

## Logo Specifications

### Design Elements

**Monogram:** QX
- **Q:** Dark gray (#222222), bold sans-serif
- **X:** Gradient (Electric Blue #007BFF to Neon Purple #8A2BE2), bold sans-serif

**Icon:** Digital Pulse Network
- **Concept:** Futuristic abstract geometric shape representing digital connectivity
- **Components:**
  - Concentric circles (network layers)
  - Four corner nodes (network points)
  - Connection lines forming a square network
  - Diagonal pulse lines (digital flow)
  - Central pulse point with glow effect
  - Animated pulse rings (optional)

**Company Name:** QuantyX
- **Font:** Arial, sans-serif
- **Weight:** 700 (Bold)
- **Color:** #222222 (Dark Gray)
- **Letter Spacing:** 0.5px

**Tagline:** INNOVATE.BUILD.SCALE.
- **Font:** Arial, sans-serif
- **Weight:** 600 (Semi-bold)
- **Color:** #007BFF (Electric Blue)
- **Letter Spacing:** 1.5px
- **Style:** All caps

---

## Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Electric Blue | #007BFF | Primary accent, X monogram, tagline |
| Neon Purple | #8A2BE2 | Secondary accent, gradient, nodes |
| Dark Gray | #222222 | Company name, Q monogram |
| White | #FFFFFF | Center pulse highlight |

---

## Logo Versions

### 1. Full Logo with Text (Primary)
**File:** `quantyx_logo.svg`
- **Dimensions:** 300x120px (viewBox)
- **Usage:** Website header, business cards, letterheads, presentations
- **Components:** Icon + Company Name + Tagline
- **Aspect Ratio:** 2.5:1

### 2. Icon Only (Secondary)
**File:** `quantyx_logo_icon.svg`
- **Dimensions:** 100x100px (viewBox)
- **Usage:** Social media profiles, favicons, app icons, avatars
- **Components:** Icon only
- **Aspect Ratio:** 1:1
- **Features:** Animated pulse rings for dynamic effect

---

## Implementation

### Website Integration

The logo is embedded directly in all website pages using inline SVG:

**HTML Structure:**
```html
<a href="quantyx_homepage.html" class="logo">
    <div class="logo-icon">
        <!-- SVG Icon -->
    </div>
    <div class="logo-text">
        <div class="logo-company">QuantyX</div>
        <div class="logo-tagline">INNOVATE.BUILD.SCALE.</div>
    </div>
</a>
```

**CSS Styling:**
```css
.logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    transition: all 0.3s;
}

.logo-icon {
    width: 40px;
    height: 40px;
}

.logo-company {
    font-size: 18px;
    font-weight: 900;
    background: linear-gradient(135deg, #007BFF, #8A2BE2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.logo-tagline {
    font-size: 9px;
    font-weight: 700;
    color: #007BFF;
    letter-spacing: 1.5px;
}
```

---

## Logo Usage Guidelines

### Do's ✓
- Use the full logo on primary pages (homepage, about, services)
- Use the icon-only version on social media and small spaces
- Maintain minimum spacing around the logo
- Use the gradient colors as specified
- Ensure adequate contrast with background
- Scale proportionally

### Don'ts ✗
- Don't distort or skew the logo
- Don't change the color scheme
- Don't remove the tagline from the full logo
- Don't place on busy backgrounds without contrast
- Don't rotate or flip the logo
- Don't use outdated versions

---

## Responsive Behavior

### Desktop (1024px+)
- Logo size: 40px icon + text
- Full logo with tagline visible
- Hover effect: slight upward translation

### Tablet (768px - 1023px)
- Logo size: 35px icon + text
- Full logo with tagline visible
- Hover effect: slight upward translation

### Mobile (< 768px)
- Logo size: 30px icon + text
- Full logo with tagline visible
- Hover effect: slight upward translation

---

## Animation Effects

### Pulse Ring Animation (Icon Only)
- **Duration:** 2 seconds
- **Repeat:** Infinite
- **Effect:** Expanding rings from center
- **Opacity:** Fades from 0.6 to 0
- **Radius:** Expands from 6px to 20px

### Hover Effect (Full Logo)
- **Duration:** 0.3 seconds
- **Effect:** Slight upward translation (2px)
- **Easing:** Smooth transition

---

## File Locations

| File | Purpose | Location |
|------|---------|----------|
| `quantyx_logo.svg` | Full logo with text | Workspace root |
| `quantyx_logo_icon.svg` | Icon only version | Workspace root |
| Embedded SVG | Website implementation | All HTML pages |

---

## Technical Specifications

### SVG Features
- **Gradients:** Linear gradients for modern look
- **Filters:** Gaussian blur for glow effects
- **Animations:** CSS-based pulse animations
- **Scalability:** Vector-based, scales to any size
- **Browser Support:** All modern browsers

### Performance
- **File Size:** Minimal (inline SVG)
- **Load Time:** Instant (no external requests)
- **Rendering:** GPU-accelerated animations
- **Accessibility:** Semantic SVG structure

---

## Brand Identity

### Visual Characteristics
- **Style:** Minimalistic, energetic, tech-forward
- **Mood:** Trustworthy, innovative, professional
- **Geometry:** Clean lines, balanced proportions
- **Dynamics:** Subtle animations, gradient effects

### Brand Values Represented
- **Innovation:** Futuristic abstract design
- **Connectivity:** Network nodes and lines
- **Digital:** Pulse and glow effects
- **Reliability:** Solid geometric foundation
- **Growth:** Expanding pulse rings

---

## Future Enhancements

Potential improvements for future versions:
- 3D animated logo version
- Dark mode variant
- Monochrome version for print
- Animated GIF version
- Lottie animation format
- Additional color variations

---

## Contact & Support

For logo usage questions or brand guidelines, contact:
- **Email:** info@quantyx.com
- **Phone:** +254 743 794 815
- **Location:** Nairobi, Kenya

