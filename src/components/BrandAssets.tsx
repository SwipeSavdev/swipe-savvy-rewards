/**
 * Brand Kit Asset Components
 * Easy-to-use React components for brand assets
 */

import React from 'react';

// ============================================================================
// Icon Components
// ============================================================================

export interface IconProps {
  name: string;
  size?: 16 | 24 | 32 | 48 | 64 | 128;
  category?: 'ai' | 'fintech' | 'machine-learning';
  alt?: string;
  className?: string;
}

/**
 * Render an AI icon with automatic size optimization
 * @example
 * <AIIcon name="ai-brain" size={32} />
 */
export const AIIcon: React.FC<IconProps> = ({
  name,
  size = 32,
  alt = name,
  className = '',
}) => {
  const src = `/assets/icons/ai/${name}-${size}w.png`;
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      loading="lazy"
    />
  );
};

/**
 * Render a fintech icon (SVG)
 * @example
 * <FinTechIcon name="cryptocurrency" />
 */
export const FinTechIcon: React.FC<Omit<IconProps, 'size'> & { size?: number }> = ({
  name,
  size = 32,
  alt = name,
  className = '',
}) => {
  const src = `/assets/icons/fintech/${name}.svg`;
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      loading="lazy"
    />
  );
};

/**
 * Render a machine learning icon (SVG)
 * @example
 * <MLIcon name="ai-brain" style="glyph" />
 */
export interface MLIconProps extends Omit<IconProps, 'size' | 'category'> {
  style?: 'glyph' | 'outline';
  size?: number;
}

export const MLIcon: React.FC<MLIconProps> = ({
  name,
  style = 'glyph',
  size = 32,
  alt = name,
  className = '',
}) => {
  const src = `/assets/icons/machine-learning/${name}-${style}.svg`;
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      loading="lazy"
    />
  );
};

// ============================================================================
// Logo Components
// ============================================================================

export interface LogoProps {
  variant?: 'color' | 'black' | 'white';
  product?: 'swipe-savvy' | 'shop-savvy';
  width?: number;
  height?: 'auto' | number;
  className?: string;
  alt?: string;
}

/**
 * Render a brand logo with variant selection
 * @example
 * <BrandLogo variant="color" product="swipe-savvy" width={200} />
 */
export const BrandLogo: React.FC<LogoProps> = ({
  variant = 'color',
  product = 'swipe-savvy',
  width = 200,
  height = 'auto',
  className = '',
  alt = `${product} logo`,
}) => {
  const logoName = product === 'swipe-savvy' 
    ? `swipe_savvy_${variant}`
    : `shop_savvy_${variant}`;
  
  const src = `/assets/logos/${logoName}.png`;
  
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
};

// ============================================================================
// Hero Card Components
// ============================================================================

export interface HeroCardProps {
  product?: 'shop-savvy' | 'swipe-savvy';
  alt?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

/**
 * Render a responsive hero card image
 * @example
 * <HeroCard product="shop-savvy" />
 */
export const HeroCard: React.FC<HeroCardProps> = ({
  product = 'shop-savvy',
  alt = `${product} hero card`,
  className = '',
  loading = 'lazy',
}) => {
  const baseName = product === 'shop-savvy' 
    ? 'shop_savvy_hero_card'
    : 'swipe_savvy_hero_card';

  return (
    <picture>
      <source
        srcSet={`/assets/cards/${baseName}_w2048.png`}
        media="(min-width: 1024px)"
      />
      <source
        srcSet={`/assets/cards/${baseName}_w1024.png`}
        media="(min-width: 512px)"
      />
      <img
        src={`/assets/cards/${baseName}_w1024.png`}
        alt={alt}
        className={className}
        loading={loading}
      />
    </picture>
  );
};

// ============================================================================
// Illustration Components
// ============================================================================

export interface IllustrationProps {
  id: number;
  alt?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

/**
 * Render a generated illustration
 * @example
 * <Illustration id={2} />
 */
export const Illustration: React.FC<IllustrationProps> = ({
  id,
  alt = `Generated illustration ${id}`,
  className = '',
  loading = 'lazy',
}) => {
  return (
    <img
      src={`/assets/illustrations/image-gen-${id}.png`}
      alt={alt}
      className={className}
      loading={loading}
    />
  );
};

// ============================================================================
// Icon Grid Component
// ============================================================================

export interface IconGridProps {
  category: 'ai' | 'fintech' | 'machine-learning';
  size?: number;
  columns?: number;
  className?: string;
}

/**
 * Display a grid of icons for browsing/selection
 * Used for icon picker or display showcase
 */
export const IconGrid: React.FC<IconGridProps> = ({
  category,
  size = 64,
  columns = 6,
  className = '',
}) => {
  // This would typically fetch from manifest.json
  // For now, providing an example structure
  
  return (
    <div 
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${size + 20}px, 1fr))`,
      }}
    >
      {/* Icons would be rendered here based on category */}
      {/* This is a placeholder component structure */}
    </div>
  );
};

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to load and cache the asset manifest
 */
export function useAssetManifest() {
  const [manifest, setManifest] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    fetch('/assets/manifest.json')
      .then(res => res.json())
      .then(data => {
        setManifest(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { manifest, loading, error };
}

/**
 * Hook to get available icons in a category
 */
export function useIconList(category: 'ai' | 'fintech' | 'machine-learning') {
  const { manifest, loading } = useAssetManifest();
  
  const icons = React.useMemo(() => {
    if (!manifest?.categories) return [];
    const categoryKey = `icons/${category}`;
    return manifest.categories[categoryKey] || [];
  }, [manifest, category]);

  return { icons, loading };
}

// ============================================================================
// Type Exports for Asset Names
// ============================================================================

export type AIIconName = 
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

export type FinTechIconName =
  | 'financial-security'
  | 'cryptocurrency'
  | 'blockchain'
  | 'digital-wallet'
  | 'mobile-banking'
  | 'investment-platforms'
  | 'wealth-management'
  | 'insurance'
  | 'robo-advisory'
  | string;

export type MLIconName =
  | 'ai-brain'
  | 'neural-network'
  | 'machine-learning-gear'
  | 'robotics-automation'
  | 'data-network'
  | 'cloud-computing'
  | 'chatbot'
  | 'predictive-analytics'
  | string;
