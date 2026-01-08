# Brand Kit Asset Integration Guide

## Overview

All brand kit assets have been converted to web-ready formats and organized in `/public/assets/`. This guide shows how to use them in your application.

---

## 🎨 Asset Categories

### 1. **AI Icons** (`/assets/icons/ai/`)
Colorful icons for AI-powered features. Available in 6 sizes: 16w, 24w, 32w, 48w, 64w, 128w (PNG format).

**Available icons:**
- chat-bot
- ai-chat
- ai-setting
- ai-eye
- ai-rocket
- ai-laptop
- ai-brain-chip
- voice-recognition
- ai-virus
- ai-file
- ai-smartphone
- ai-coding

**Usage:**
```tsx
import { AIIcon } from '@/components/BrandAssets';

// In your component
<AIIcon name="ai-brain" size={32} alt="AI Brain" />
<AIIcon name="chat-bot" size={64} />
```

### 2. **FinTech Icons** (`/assets/icons/fintech/`)
30 scalable SVG icons for financial and payment features.

**Available icons:**
- cryptocurrency
- blockchain
- digital-wallet
- mobile-banking
- investment-platforms
- wealth-management
- insurance
- financial-security
- robo-advisory
- big-data-analytics
- fraud-detection
- payment-processing
- And 18 more...

**Usage:**
```tsx
import { FinTechIcon } from '@/components/BrandAssets';

<FinTechIcon name="cryptocurrency" size={40} />
<FinTechIcon name="digital-wallet" size={32} className="text-blue-600" />
```

### 3. **Machine Learning Icons** (`/assets/icons/machine-learning/`)
32 SVG icons in two styles: Glyph (simplified) and Outline (detailed).

**Available icons (2 styles each):**
- ai-brain
- neural-network
- machine-learning-gear
- robotics-automation
- data-network
- cloud-computing
- chatbot
- predictive-analytics
- algorithm-diagram
- virtual-reality-ai
- ai-chip
- self-driving-car
- automated-workflow
- smart-assistant
- data-science-chart
- quantum-computing

**Usage:**
```tsx
import { MLIcon } from '@/components/BrandAssets';

// Glyph style (default)
<MLIcon name="ai-brain" style="glyph" size={32} />

// Outline style
<MLIcon name="neural-network" style="outline" size={48} />
```

---

## 🏢 Logo Components

### Brand Logos
6 logo variants available in color, black, and white for both SwipeSavvy and ShopSavvy.

**Variants:**
- `swipe_savvy_color.png` - Primary color
- `swipe_savvy_black.png` - Black on light
- `swipe_savvy_white.png` - White on dark
- `shop_savvy_color.png` - ShopSavvy color
- `shop_savvy_black.png` - ShopSavvy black
- `shop_savvy_white.png` - ShopSavvy white

**Usage:**
```tsx
import { BrandLogo } from '@/components/BrandAssets';

// Header logo
<BrandLogo variant="color" product="swipe-savvy" width={200} />

// Footer logo on dark background
<BrandLogo variant="white" product="swipe-savvy" width={150} />

// App switcher
<BrandLogo variant="color" product="shop-savvy" width={120} />
```

---

## 🖼️ Hero Cards & Images

### Hero Cards
Responsive promotional images in multiple widths (1024px and 2048px).

**Usage:**
```tsx
import { HeroCard } from '@/components/BrandAssets';

// Auto-responsive with picture tag
<HeroCard product="shop-savvy" />

// ShopSavvy card
<HeroCard product="shop-savvy" alt="ShopSavvy Features" />

// Full width with custom styling
<HeroCard product="swipe-savvy" className="w-full rounded-lg shadow-lg" />
```

### Illustrations
2 generated illustrations for decorative use.

**Usage:**
```tsx
import { Illustration } from '@/components/BrandAssets';

<Illustration id={2} alt="Dashboard illustration" />
<Illustration id={3} className="max-w-md" />
```

---

## 📦 React Component Library

### Importing Assets

```tsx
import {
  AIIcon,
  FinTechIcon,
  MLIcon,
  BrandLogo,
  HeroCard,
  Illustration,
  useAssetManifest,
  useIconList,
} from '@/components/BrandAssets';
```

### Complete Examples

#### Example 1: Feature Icon Showcase
```tsx
export function AIFeaturesShowcase() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <AIIcon name="ai-brain" size={48} />
        <p>Smart AI</p>
      </div>
      <div className="text-center">
        <AIIcon name="chat-bot" size={48} />
        <p>Chat Support</p>
      </div>
      <div className="text-center">
        <AIIcon name="voice-recognition" size={48} />
        <p>Voice Control</p>
      </div>
    </div>
  );
}
```

#### Example 2: Payment Methods Section
```tsx
export function PaymentMethods() {
  const methods = [
    'cryptocurrency',
    'digital-wallet',
    'mobile-banking',
    'blockchain',
  ];

  return (
    <div className="space-y-4">
      <h2>Supported Payment Methods</h2>
      <div className="grid grid-cols-4 gap-4">
        {methods.map(method => (
          <div key={method} className="text-center">
            <FinTechIcon name={method} size={64} />
            <p className="mt-2 text-sm capitalize">{method.replace('-', ' ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Example 3: Header with Logo
```tsx
export function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <BrandLogo variant="color" product="swipe-savvy" width={150} />
      <nav className="flex gap-4">
        <AIIcon name="ai-setting" size={24} alt="Settings" />
        <AIIcon name="ai-chat" size={24} alt="Chat" />
      </nav>
    </header>
  );
}
```

#### Example 4: Dynamic Icon Loading
```tsx
export function IconBrowser() {
  const { icons, loading } = useIconList('ai');

  if (loading) return <div>Loading icons...</div>;

  return (
    <div className="grid grid-cols-6 gap-4">
      {icons.map(icon => (
        <div key={icon.name} className="p-4 border rounded hover:bg-gray-100">
          <img 
            src={`/assets/icons/ai/${icon.name}-64w.png`} 
            alt={icon.name}
            className="w-16 h-16 mx-auto"
          />
          <p className="text-xs text-center mt-2">{icon.name}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Size Recommendations

### AI Icons (PNG)
- **16w**: Inline text, breadcrumbs, tiny UI elements
- **24w**: Small UI elements, mini badges
- **32w**: Standard UI icons (buttons, nav items)
- **48w**: Medium icons (featured items)
- **64w**: Large icons (feature showcase)
- **128w**: Hero icons (prominent display)

### Fintech & ML Icons (SVG - scalable)
- **24-32**: Small UI icons
- **32-48**: Standard use
- **48-64**: Feature displays
- **64-128**: Large hero sections
- Can scale to any size (SVG advantage)

### Logos
- **Header**: 150-250px width
- **Mobile**: 100-150px width
- **Footer**: 80-120px width
- **Favicon**: 32x32px (may need separate file)

---

## 🔄 TypeScript Support

All icon names are typed for better IDE support:

```tsx
import type { AIIconName, FinTechIconName, MLIconName } from '@/components/BrandAssets';

const iconName: AIIconName = 'chat-bot'; // ✅ Type safe
const invalidIcon: AIIconName = 'invalid'; // ❌ TypeScript error
```

---

## 📊 Asset Manifest

A `manifest.json` file is available at `/assets/manifest.json` containing complete metadata:

```json
{
  "generated": "2024-01-07T20:35:00",
  "version": "1.0.0",
  "totalAssets": 84,
  "categories": {
    "icons/ai": [...],
    "icons/fintech": [...],
    "icons/machine-learning": [...],
    "logos": [...],
    "cards": [...],
    "illustrations": [...]
  }
}
```

**Load dynamically:**
```tsx
const { manifest } = useAssetManifest();

if (manifest) {
  console.log(`Total assets: ${manifest.totalAssets}`);
  console.log('Categories:', Object.keys(manifest.categories));
}
```

---

## ⚡ Performance Tips

1. **Use lazy loading** for below-fold images:
   ```tsx
   <AIIcon name="ai-brain" size={32} loading="lazy" />
   ```

2. **SVGs don't need multiple sizes** - scale as needed:
   ```tsx
   <MLIcon name="ai-brain" size={32} /> // Uses same SVG, different size
   <MLIcon name="ai-brain" size={64} /> // Scales perfectly
   ```

3. **Cache the manifest** with `useAssetManifest()` hook

4. **Use responsive images** for hero cards (already built-in)

5. **Optimize PNG sizes** - all AI icons are pre-optimized

---

## 🚀 Next Steps

1. **Copy the component file** (`BrandAssets.tsx`) to your components folder
2. **Update import paths** as needed for your project structure
3. **Use components** in your pages and features
4. **Reference manifest.json** for complete asset list
5. **Customize styling** with className props

---

## 📞 Support

- **Asset Format Issues?** Check [USAGE_GUIDE.md](/assets/USAGE_GUIDE.md)
- **Component Issues?** Review TypeScript types in BrandAssets.tsx
- **New Assets?** Re-run the conversion script to add more

---

**Asset Library Version:** 1.0.0  
**Last Updated:** January 7, 2026  
**Total Assets:** 84 (ready to use)
