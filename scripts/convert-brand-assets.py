#!/usr/bin/env python3
"""
Brand Kit Asset Converter
Converts all brand kit assets into optimized, web-ready formats.
Consolidates SVG and PNG files with proper organization and metadata.
"""

import os
import shutil
import json
from pathlib import Path
from PIL import Image
import subprocess
from datetime import datetime

# Configuration
BRAND_KIT_PATH = Path("/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/brand-kit")
OUTPUT_PATH = Path("/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/public/assets")
SIZES = {
    "icons": [16, 24, 32, 48, 64, 128],
    "thumbnails": [128, 256],
    "hero": [512, 1024, 2048],
}

def ensure_output_dirs():
    """Create output directory structure."""
    dirs = [
        OUTPUT_PATH / "icons" / "ai",
        OUTPUT_PATH / "icons" / "fintech",
        OUTPUT_PATH / "icons" / "machine-learning",
        OUTPUT_PATH / "logos",
        OUTPUT_PATH / "cards",
        OUTPUT_PATH / "illustrations",
        OUTPUT_PATH / "brand",
    ]
    for dir_path in dirs:
        dir_path.mkdir(parents=True, exist_ok=True)
    print(f"✓ Created output directories at {OUTPUT_PATH}")

def get_icon_name(file_path):
    """Extract clean icon name from file path."""
    name = Path(file_path).stem
    # Clean up common suffixes
    for suffix in [", automation, AI, technology, machine", ", data, internet, machine learning, connectivity"]:
        name = name.replace(suffix, "")
    return name.lower().replace(" ", "-")

def copy_and_optimize_svg(src_path, dest_dir, category=""):
    """Copy SVG files to output directory."""
    try:
        dest_path = dest_dir / src_path.name
        shutil.copy2(src_path, dest_path)
        return str(dest_path)
    except Exception as e:
        print(f"✗ Error copying SVG {src_path.name}: {e}")
        return None

def convert_png_to_optimized(src_path, dest_dir, sizes):
    """Convert PNG to optimized versions."""
    try:
        with Image.open(src_path) as img:
            # Convert RGBA if needed
            if img.mode == "RGBA":
                base_img = img
            else:
                base_img = img.convert("RGBA")
            
            output_files = {}
            
            # Generate sizes
            for size in sizes:
                resized = base_img.resize((size, size), Image.Resampling.LANCZOS)
                output_file = dest_dir / f"{src_path.stem}-{size}w.png"
                resized.save(output_file, "PNG", optimize=True)
                output_files[f"{size}w"] = str(output_file)
            
            print(f"✓ Optimized {src_path.name}")
            return output_files
    except Exception as e:
        print(f"✗ Error converting PNG {src_path.name}: {e}")
        return None

def process_machine_learning_icons():
    """Process Machine Learning SVG icons."""
    ml_path = BRAND_KIT_PATH / "assets" / "Machine Learning" / "Main File" / "SVG"
    dest_dir = OUTPUT_PATH / "icons" / "machine-learning"
    
    processed = []
    
    for style_dir in ["Glyph", "Outline"]:
        style_path = ml_path / style_dir
        if style_path.exists():
            for svg_file in style_path.glob("*.svg"):
                icon_name = get_icon_name(svg_file)
                output_file = dest_dir / f"{icon_name}-{style_dir.lower()}.svg"
                try:
                    shutil.copy2(svg_file, output_file)
                    processed.append({
                        "name": icon_name,
                        "style": style_dir.lower(),
                        "path": f"icons/machine-learning/{output_file.name}",
                        "source": "Machine Learning Icon Pack"
                    })
                    print(f"✓ {icon_name} ({style_dir})")
                except Exception as e:
                    print(f"✗ Error processing {svg_file.name}: {e}")
    
    return processed

def process_fintech_icons():
    """Process Fintech SVG icons."""
    fintech_path = BRAND_KIT_PATH / "assets" / "fintech-icon-pack-2023-11-27-05-32-02-utc-2" / "SVG"
    dest_dir = OUTPUT_PATH / "icons" / "fintech"
    
    processed = []
    
    if fintech_path.exists():
        for svg_file in fintech_path.glob("*.svg"):
            try:
                icon_name = svg_file.stem.lower().replace(" ", "-")
                output_file = dest_dir / svg_file.name
                shutil.copy2(svg_file, output_file)
                processed.append({
                    "name": icon_name,
                    "path": f"icons/fintech/{output_file.name}",
                    "source": "Fintech Icon Pack"
                })
                print(f"✓ {icon_name}")
            except Exception as e:
                print(f"✗ Error processing {svg_file.name}: {e}")
    
    return processed

def process_ai_icons():
    """Process AI PNG icons."""
    png_path = BRAND_KIT_PATH / "assets" / "png"
    dest_dir = OUTPUT_PATH / "icons" / "ai"
    
    processed = []
    
    if png_path.exists():
        for png_file in png_path.glob("*.png"):
            try:
                icon_name = png_file.stem.lower().replace(" ", "-")
                optimized = convert_png_to_optimized(png_file, dest_dir, SIZES["icons"])
                if optimized:
                    processed.append({
                        "name": icon_name,
                        "path": f"icons/ai/{png_file.stem}",
                        "sizes": list(optimized.keys()),
                        "source": "AI Icon Collection"
                    })
            except Exception as e:
                print(f"✗ Error processing {png_file.name}: {e}")
    
    return processed

def process_logos():
    """Process logo files."""
    logos_path = BRAND_KIT_PATH / "assets" / "logos"
    dest_dir = OUTPUT_PATH / "logos"
    
    processed = []
    
    if logos_path.exists():
        for logo_file in logos_path.glob("*.png"):
            try:
                logo_name = logo_file.stem
                
                # Copy original
                shutil.copy2(logo_file, dest_dir / logo_file.name)
                
                # Extract color/style info
                color_variant = "color" if "color" in logo_name else "black" if "black" in logo_name else "white"
                product = "swipe-savvy" if "swipe" in logo_name else "shop-savvy"
                
                processed.append({
                    "name": logo_name,
                    "product": product,
                    "variant": color_variant,
                    "path": f"logos/{logo_file.name}",
                    "source": "Brand Kit Logos"
                })
                print(f"✓ {logo_name}")
            except Exception as e:
                print(f"✗ Error processing {logo_file.name}: {e}")
    
    return processed

def process_hero_cards():
    """Process hero card images."""
    cards_path = BRAND_KIT_PATH / "assets" / "cards"
    dest_dir = OUTPUT_PATH / "cards"
    
    processed = []
    
    if cards_path.exists():
        for img_file in cards_path.glob("*.png"):
            try:
                shutil.copy2(img_file, dest_dir / img_file.name)
                
                # Extract width from filename
                width = None
                if "w" in img_file.stem:
                    parts = img_file.stem.split("w")
                    if len(parts) > 1:
                        width = parts[-1]
                
                processed.append({
                    "name": img_file.stem,
                    "path": f"cards/{img_file.name}",
                    "width": width,
                    "source": "Hero Cards"
                })
                print(f"✓ {img_file.stem}")
            except Exception as e:
                print(f"✗ Error processing {img_file.name}: {e}")
    
    return processed

def process_illustrations():
    """Process standalone illustration PNGs."""
    assets_path = BRAND_KIT_PATH / "assets"
    dest_dir = OUTPUT_PATH / "illustrations"
    
    processed = []
    
    # Look for image-gen files
    for img_file in assets_path.glob("image-gen-*.png"):
        try:
            shutil.copy2(img_file, dest_dir / img_file.name)
            processed.append({
                "name": img_file.stem,
                "path": f"illustrations/{img_file.name}",
                "source": "Generated Illustrations"
            })
            print(f"✓ {img_file.stem}")
        except Exception as e:
            print(f"✗ Error processing {img_file.name}: {e}")
    
    return processed

def create_asset_manifest(all_assets):
    """Create JSON manifest of all assets."""
    manifest = {
        "generated": datetime.now().isoformat(),
        "version": "1.0.0",
        "totalAssets": len(all_assets),
        "categories": {}
    }
    
    for asset in all_assets:
        category = asset.get("category", "other")
        if category not in manifest["categories"]:
            manifest["categories"][category] = []
        manifest["categories"][category].append(asset)
    
    manifest_path = OUTPUT_PATH / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n✓ Created asset manifest at {manifest_path}")
    return manifest

def create_usage_guide():
    """Create a usage guide document."""
    guide = """# Brand Kit Assets - Usage Guide

Generated: {date}

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
{timestamp}
""".format(
        date=datetime.now().strftime("%Y-%m-%d"),
        timestamp=datetime.now().isoformat()
    )
    
    guide_path = OUTPUT_PATH / "USAGE_GUIDE.md"
    with open(guide_path, "w") as f:
        f.write(guide)
    
    print(f"✓ Created usage guide at {guide_path}")

def main():
    """Main conversion process."""
    print("=" * 60)
    print("Brand Kit Asset Converter")
    print("=" * 60)
    
    # Ensure output directories exist
    ensure_output_dirs()
    
    all_assets = []
    
    # Process each asset type
    print("\n📦 Processing Machine Learning Icons...")
    ml_assets = process_machine_learning_icons()
    for asset in ml_assets:
        asset["category"] = "icons/machine-learning"
        all_assets.append(asset)
    
    print("\n📦 Processing Fintech Icons...")
    fintech_assets = process_fintech_icons()
    for asset in fintech_assets:
        asset["category"] = "icons/fintech"
        all_assets.append(asset)
    
    print("\n📦 Processing AI Icons...")
    ai_assets = process_ai_icons()
    for asset in ai_assets:
        asset["category"] = "icons/ai"
        all_assets.append(asset)
    
    print("\n📦 Processing Logos...")
    logo_assets = process_logos()
    for asset in logo_assets:
        asset["category"] = "logos"
        all_assets.append(asset)
    
    print("\n📦 Processing Hero Cards...")
    card_assets = process_hero_cards()
    for asset in card_assets:
        asset["category"] = "cards"
        all_assets.append(asset)
    
    print("\n📦 Processing Illustrations...")
    illust_assets = process_illustrations()
    for asset in illust_assets:
        asset["category"] = "illustrations"
        all_assets.append(asset)
    
    # Create manifest
    print("\n📋 Creating Asset Manifest...")
    create_asset_manifest(all_assets)
    
    # Create usage guide
    print("\n📖 Creating Usage Guide...")
    create_usage_guide()
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ Asset Conversion Complete!")
    print("=" * 60)
    print(f"Total assets processed: {len(all_assets)}")
    print(f"Output directory: {OUTPUT_PATH}")
    print("\nAsset Summary:")
    for category in sorted(set(a["category"] for a in all_assets)):
        count = len([a for a in all_assets if a["category"] == category])
        print(f"  • {category}: {count} assets")
    print("\nNext steps:")
    print("  1. Review assets in the output directory")
    print("  2. Check manifest.json for asset metadata")
    print("  3. Read USAGE_GUIDE.md for integration instructions")

if __name__ == "__main__":
    main()
