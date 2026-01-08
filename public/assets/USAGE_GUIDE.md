# Brand Kit Assets - Usage Guide

Generated: 2026-01-07

## Directory Structure

```
assets/
├── icons/
│   ├── ai/                  # AI-themed icons
│   ├── fintech/             # Finance & tech icons  
│   └── machine-learning/    # ML & data icons
├── logos/                   # Brand logos (various variants)
├── cards/                   # Hero cards & promotional images
├── illustrations/           # Generated illustrations
├── brand/                   # Brand guidelines assets
└── manifest.json            # Asset metadata
```

## Icon Usage

### AI Icons
Located in `icons/ai/`
- Multiple sizes available: 16w, 24w, 32w, 48w, 64w, 128w
- Format: PNG, optimized
- Usage: UI components, buttons, menus

Example:
```html
<img src="/assets/icons/ai/ai-brain-64w.png" alt="AI Brain" />
```

### Fintech Icons
Located in `icons/fintech/`
- Format: SVG (scalable)
- Usage: Dashboard, reports, financial features

Example:
```html
<img src="/assets/icons/fintech/Cryptocurrency.svg" alt="Crypto" />
```

### Machine Learning Icons
Located in `icons/machine-learning/`
- Available styles: glyph, outline
- Format: SVG (scalable)
- Usage: Advanced features, settings, ML-powered sections

Example:
```html
<img src="/assets/icons/machine-learning/ai-brain-glyph.svg" alt="AI Brain" />
```

## Logo Usage

### Variants Available
- **swipe_savvy_color.png** - Primary color variant
- **swipe_savvy_black.png** - Black variant for light backgrounds
- **swipe_savvy_white.png** - White variant for dark backgrounds
- **shop_savvy_color.png** - Shop Savvy color variant
- **shop_savvy_black.png** - Shop Savvy black variant
- **shop_savvy_white.png** - Shop Savvy white variant

Usage:
```html
<!-- Header -->
<img src="/assets/logos/swipe_savvy_color.png" alt="SwipeSavvy" class="logo" />

<!-- Dark background -->
<img src="/assets/logos/swipe_savvy_white.png" alt="SwipeSavvy" />
```

## Hero Cards

Located in `cards/`
- Responsive image cards
- Different widths available for responsive design

Usage:
```html
<picture>
  <source srcset="/assets/cards/shop_savvy_hero_card_w2048.png" media="(min-width: 1024px)" />
  <source srcset="/assets/cards/shop_savvy_hero_card_w1024.png" media="(min-width: 512px)" />
  <img src="/assets/cards/shop_savvy_hero_card_w1024.png" alt="Hero" />
</picture>
```

## Web Optimization Tips

1. **SVG Icons**: Use directly in HTML or as background images (scales perfectly)
2. **PNG Icons**: Use the appropriate size for your UI
   - 16w: Tiny icons, breadcrumbs
   - 32w: Small UI elements
   - 64w: Regular UI icons
   - 128w: Larger display icons

3. **Performance**: 
   - All PNGs are optimized (compressed)
   - SVGs are production-ready
   - Use appropriate responsive sizes for hero images

4. **Accessibility**:
   - Always include descriptive alt text
   - Use semantic HTML with images
   - Consider lazy loading for off-screen images

## Asset Metadata

See `manifest.json` for complete asset metadata including:
- Asset names and paths
- Size information
- Source information
- Categories

## Adding New Assets

1. Add source files to original brand kit
2. Re-run the conversion script
3. Assets will be automatically processed and added to manifest

## Questions & Support

For brand asset updates or additions, refer to the original brand kit folders.

---
2026-01-07T20:35:04.643073
