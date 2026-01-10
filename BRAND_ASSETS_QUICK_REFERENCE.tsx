// Brand Assets Quick Reference
// Copy and paste these snippets into your code

// ============================================================================
// IMPORT
// ============================================================================

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


// ============================================================================
// AI ICONS (PNG - 12 icons, 6 sizes: 16, 24, 32, 48, 64, 128)
// ============================================================================

// Quick usage
<AIIcon name="chat-bot" size={32} />
<AIIcon name="ai-brain" size={48} alt="AI Brain" />
<AIIcon name="voice-recognition" size={64} className="text-blue-500" />

// All available sizes
<AIIcon name="ai-setting" size={16} />  // Tiny
<AIIcon name="ai-setting" size={24} />  // Small
<AIIcon name="ai-setting" size={32} />  // Medium
<AIIcon name="ai-setting" size={48} />  // Large
<AIIcon name="ai-setting" size={64} />  // XL
<AIIcon name="ai-setting" size={128} /> // XXL

// All available AI icons
<AIIcon name="chat-bot" size={32} />
<AIIcon name="ai-chat" size={32} />
<AIIcon name="ai-setting" size={32} />
<AIIcon name="ai-eye" size={32} />
<AIIcon name="ai-rocket" size={32} />
<AIIcon name="ai-laptop" size={32} />
<AIIcon name="ai-brain-chip" size={32} />
<AIIcon name="voice-recognition" size={32} />
<AIIcon name="ai-virus" size={32} />
<AIIcon name="ai-file" size={32} />
<AIIcon name="ai-smartphone" size={32} />
<AIIcon name="ai-coding" size={32} />


// ============================================================================
// FINTECH ICONS (SVG - 30 icons, scalable)
// ============================================================================

// Quick usage - no fixed sizes needed for SVG
<FinTechIcon name="cryptocurrency" size={40} />
<FinTechIcon name="digital-wallet" size={32} alt="Wallet" />
<FinTechIcon name="blockchain" size={64} className="text-green-600" />

// All available fintech icons (sample)
<FinTechIcon name="cryptocurrency" size={32} />
<FinTechIcon name="digital-wallet" size={32} />
<FinTechIcon name="mobile-banking" size={32} />
<FinTechIcon name="blockchain" size={32} />
<FinTechIcon name="investment-platforms" size={32} />
<FinTechIcon name="wealth-management" size={32} />
<FinTechIcon name="insurance" size={32} />
<FinTechIcon name="financial-security" size={32} />
<FinTechIcon name="robo-advisory" size={32} />
<FinTechIcon name="big-data-analytics" size={32} />
<FinTechIcon name="fraud-detection" size={32} />
<FinTechIcon name="payment-processing" size={32} />
<FinTechIcon name="open-banking" size={32} />
<FinTechIcon name="api-integration" size={32} />

// Plus 16 more - see BRAND_ASSETS_GUIDE.md for full list


// ============================================================================
// MACHINE LEARNING ICONS (SVG - 16 icons, 2 styles, scalable)
// ============================================================================

// Style options: "glyph" (default, simplified) or "outline" (detailed)
<MLIcon name="ai-brain" style="glyph" size={32} />
<MLIcon name="neural-network" style="outline" size={48} />
<MLIcon name="machine-learning-gear" style="glyph" size={64} />

// All available ML icons (each has glyph + outline)
<MLIcon name="ai-brain" style="glyph" size={32} />
<MLIcon name="neural-network" style="glyph" size={32} />
<MLIcon name="machine-learning-gear" style="glyph" size={32} />
<MLIcon name="robotics-automation" style="glyph" size={32} />
<MLIcon name="data-network" style="glyph" size={32} />
<MLIcon name="cloud-computing" style="glyph" size={32} />
<MLIcon name="chatbot" style="glyph" size={32} />
<MLIcon name="predictive-analytics" style="glyph" size={32} />
<MLIcon name="algorithm-diagram" style="glyph" size={32} />
<MLIcon name="virtual-reality-ai" style="glyph" size={32} />
<MLIcon name="ai-chip" style="glyph" size={32} />
<MLIcon name="self-driving-car" style="glyph" size={32} />
<MLIcon name="automated-workflow" style="glyph" size={32} />
<MLIcon name="smart-assistant" style="glyph" size={32} />
<MLIcon name="data-science-chart" style="glyph" size={32} />
<MLIcon name="quantum-computing" style="glyph" size={32} />


// ============================================================================
// LOGOS (PNG - 6 variants)
// ============================================================================

// SwipeSavvy - Color (primary)
<BrandLogo variant="color" product="swipe-savvy" width={200} />

// SwipeSavvy - Black (on light background)
<BrandLogo variant="black" product="swipe-savvy" width={200} />

// SwipeSavvy - White (on dark background)
<BrandLogo variant="white" product="swipe-savvy" width={200} />

// ShopSavvy - All variants
<BrandLogo variant="color" product="shop-savvy" width={200} />
<BrandLogo variant="black" product="shop-savvy" width={200} />
<BrandLogo variant="white" product="shop-savvy" width={200} />

// With custom styling
<BrandLogo 
  variant="color" 
  product="swipe-savvy" 
  width={150}
  height={60}
  className="drop-shadow-lg"
/>


// ============================================================================
// HERO CARDS (Responsive PNG - auto-sizing)
// ============================================================================

// ShopSavvy hero card (auto-responsive)
<HeroCard product="shop-savvy" />

// SwipeSavvy hero card
<HeroCard product="swipe-savvy" />

// With custom styling
<HeroCard 
  product="shop-savvy" 
  className="w-full rounded-lg shadow-2xl"
  alt="ShopSavvy Features"
/>

// Eager loading for above-fold
<HeroCard product="swipe-savvy" loading="eager" />


// ============================================================================
// ILLUSTRATIONS (PNG - 2 images)
// ============================================================================

<Illustration id={2} alt="Dashboard Illustration" />
<Illustration id={3} className="max-w-lg mx-auto" />

// Eager loading
<Illustration id={2} loading="eager" />


// ============================================================================
// COMMON PATTERNS
// ============================================================================

// Feature grid with icons
<div className="grid grid-cols-3 gap-4">
  <div className="text-center">
    <AIIcon name="ai-brain" size={48} />
    <h3 className="mt-2">Smart AI</h3>
  </div>
  <div className="text-center">
    <FinTechIcon name="blockchain" size={48} />
    <h3 className="mt-2">Secure</h3>
  </div>
  <div className="text-center">
    <MLIcon name="neural-network" style="glyph" size={48} />
    <h3 className="mt-2">Learning</h3>
  </div>
</div>

// Header with logo and icons
<header className="flex items-center justify-between p-4">
  <BrandLogo variant="color" product="swipe-savvy" width={150} />
  <nav className="flex gap-2">
    <AIIcon name="ai-chat" size={24} />
    <AIIcon name="ai-setting" size={24} />
  </nav>
</header>

// Badge with icon
<span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
  <FinTechIcon name="cryptocurrency" size={16} />
  <span>Secure Payment</span>
</span>

// Icon list/menu
<ul>
  <li className="flex items-center gap-3 p-2">
    <FinTechIcon name="digital-wallet" size={24} />
    <span>Digital Wallet</span>
  </li>
  <li className="flex items-center gap-3 p-2">
    <FinTechIcon name="mobile-banking" size={24} />
    <span>Mobile Banking</span>
  </li>
</ul>


// ============================================================================
// HOOKS - DYNAMIC LOADING
// ============================================================================

// Load manifest data
function Dashboard() {
  const { manifest, loading, error } = useAssetManifest();
  
  if (loading) return <div>Loading assets...</div>;
  if (error) return <div>Error loading assets</div>;
  
  return <div>Total assets: {manifest.totalAssets}</div>;
}

// Get icons in category
function AIIconBrowser() {
  const { icons, loading } = useIconList('ai');
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="grid grid-cols-6 gap-4">
      {icons.map(icon => (
        <img key={icon.name} src={`/assets/${icon.path}`} />
      ))}
    </div>
  );
}


// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

type AIIconName = 
  | 'chat-bot'
  | 'ai-chat'
  | 'ai-setting'
  | 'ai-eye'
  | 'ai-rocket'
  | 'ai-laptop'
  | 'ai-brain-chip'
  | 'voice-recognition'
  | 'ai-virus'
  | 'ai-file'
  | 'ai-smartphone'
  | 'ai-coding';

type FinTechIconName = string; // 30+ icons, see manifest.json

type MLIconName = string; // 16 icons, see manifest.json

type LogoVariant = 'color' | 'black' | 'white';

type LogoProduct = 'swipe-savvy' | 'shop-savvy';

type MLStyle = 'glyph' | 'outline';

type AIIconSize = 16 | 24 | 32 | 48 | 64 | 128;

type ScalableIconSize = number; // Any number for SVG icons


// ============================================================================
// SIZING GUIDE
// ============================================================================

// AI Icons (PNG) - Use these exact sizes for crisp rendering
16w   // Tiny: breadcrumbs, inline text
24w   // Small: mini badges, tight spaces
32w   // Medium: standard UI icons (MOST COMMON)
48w   // Large: feature items, prominent buttons
64w   // XL: featured showcases
128w  // XXL: hero sections

// FinTech & ML Icons (SVG) - Any size looks crisp
// Recommended sizes: 24, 32, 40, 48, 56, 64, 72, 80, 96, 128

// Logos
Header:     150-250px width
Mobile:     100-150px width
Footer:     80-120px width
Small:      60-100px width


// ============================================================================
// DARK MODE / TAILWIND EXAMPLES
// ============================================================================

// Icon with color in dark mode
<div className="dark:invert">
  <AIIcon name="ai-brain" size={32} />
</div>

// Logo switching based on theme
function HeaderLogo({ isDark }: { isDark: boolean }) {
  return (
    <BrandLogo
      variant={isDark ? 'white' : 'black'}
      product="swipe-savvy"
      width={150}
    />
  );
}

// Icon with Tailwind styling
<div className="p-4 bg-blue-50 rounded-lg">
  <FinTechIcon name="blockchain" size={48} className="text-blue-600" />
  <p className="mt-2 text-sm">Blockchain Secured</p>
</div>


// ============================================================================
// RESPONSIVE EXAMPLE
// ============================================================================

export function ResponsiveFeatures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Icon size responsive */}
      <div className="text-center">
        <AIIcon 
          name="ai-brain" 
          size={48}
          className="md:w-16 lg:w-20" // Scale with Tailwind
        />
        <h3 className="mt-4 text-lg font-semibold">Smart AI</h3>
        <p className="text-gray-600">AI-powered recommendations</p>
      </div>
      
      {/* Repeat for other features */}
    </div>
  );
}


// ============================================================================
// CACHING / PERFORMANCE
// ============================================================================

// Good - prevents re-fetching
const manifestCache = new Map();

function useCachedAssetManifest() {
  const [manifest, setManifest] = React.useState(null);
  
  React.useEffect(() => {
    if (manifestCache.has('manifest')) {
      setManifest(manifestCache.get('manifest'));
      return;
    }
    
    fetch('/assets/manifest.json')
      .then(res => res.json())
      .then(data => {
        manifestCache.set('manifest', data);
        setManifest(data);
      });
  }, []);
  
  return manifest;
}

// Good - lazy load below-fold images
<AIIcon name="ai-setting" size={32} loading="lazy" />
<HeroCard product="shop-savvy" loading="lazy" />

// Good - preload above-fold images
<AIIcon name="ai-brain" size={48} loading="eager" />
<BrandLogo variant="color" product="swipe-savvy" width={200} />
