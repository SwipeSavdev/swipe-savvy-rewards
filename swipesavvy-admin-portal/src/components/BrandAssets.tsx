/**
 * Brand Kit Asset Components
 * Easy-to-use React components for brand assets
 */

import React from 'react'

// ============================================================================
// Icon Components
// ============================================================================

export interface IconProps {
  name: string
  size?: 16 | 24 | 32 | 48 | 64 | 128
  alt?: string
  className?: string
  loading?: 'eager' | 'lazy'
}

// AI Icon name mapping (kebab-case to actual file names)
const aiIconNameMap: Record<string, string> = {
  'chat-bot': 'Chat Bot',
  'ai-chat': 'AI Chat',
  'ai-setting': 'AI Setting',
  'ai-eye': 'AI  Eye',
  'ai-rocket': 'AI Rocket',
  'ai-laptop': 'AI Laptop',
  'ai-brain-chip': 'AI Brain Chip',
  'voice-recognition': 'Voice Recognition',
  'ai-virus': 'AI Virus',
  'ai-file': 'AI File',
  'ai-smartphone': 'AI Smartphone',
  'ai-coding': 'AI Coding',
}

// Fintech icon name mapping
const fintechIconNameMap: Record<string, string> = {
  'financial-security': 'Financial Security',
  'cryptocurrency': 'Cryptocurrency',
  'blockchain': 'Blockchain',
  'digital-wallet': 'Digital Wallet',
  'mobile-banking': 'Mobile Banking',
  'investment-platforms': 'Investment Platforms',
  'wealth-management': 'Wealth management',
  'insurance': 'Insurance',
  'robo-advisory': 'Robo-Advisory',
  'big-data-analytics': 'Big Data Analytics',
  'fraud-detection': 'Fraud Detection',
  'payment-processing': 'Online Payments',
  'open-banking': 'Open Banking',
  'api-integration': 'API Integration',
  'contactless-payments': 'Contactless Payments',
  'cashless-transactions': 'Cashless Transactions',
  'crowdfunding': 'Crowdfunding',
  'digital-identity': 'Digital Identity',
  'e-commerce': 'E-Commerce',
  'financial-apps': 'Financial Apps',
  'financial-inclusion': 'Financial Inclusion',
  'money-transfer': 'Money Transfer',
  'peer-to-peer-lending': 'Peer-to-peer Landing',
  'personal-finance-management': 'Personal Finance Management',
  'regulatory-technology': 'Regulatory Technology',
  'risk-assessment': 'Risk Assessment',
  'stock-trading': 'Stock Trading',
  'virtual-currencies': 'Virtual Currencies',
  'biometric-authentication': 'Biometric Authentication',
  'cloud-invoice': 'Cloud Invoice',
}

// ML icon name mapping
const mlIconNameMap: Record<string, { glyph: string; outline: string }> = {
  'ai-brain': {
    glyph: 'ai-brain,-artificial-intelligence,-brain,-ai,-smart-glyph',
    outline: 'ai-brain,-artificial-intelligence,-brain,-ai,-smart-outline',
  },
  'neural-network': {
    glyph: 'neural-network,-neural-network,-ai,-algorithm,-technology-glyph',
    outline: 'neural-network,-neural-network,-ai,-algorithm,-technology-outline',
  },
  'machine-learning-gear': {
    glyph: 'machine-learning-gear,-settings,-machine-learning,-ai,-mechanics-glyph',
    outline: 'machine-learning-gear,-settings,-machine-learning,-ai,-mechanics-outline',
  },
  'robotics-automation': {
    glyph: 'robotics-automation-glyph',
    outline: 'robotics-automation-outline',
  },
  'data-network': {
    glyph: 'data-network-glyph',
    outline: 'data-network-outline',
  },
  'cloud-computing': {
    glyph: 'cloud-computing,-ai,-data,-internet,-technology-glyph',
    outline: 'cloud-computing,-ai,-data,-internet,-technology-outline',
  },
  'chatbot': {
    glyph: 'chatbot,-ai,-customer-service,-messaging,-automated-glyph',
    outline: 'chatbot,-ai,-customer-service,-messaging,-automated-outline',
  },
  'predictive-analytics': {
    glyph: 'predictive-analytics,-data,-forecasting,-ai,-machine-learning-glyph',
    outline: 'predictive-analytics,-data,-forecasting,-ai,-machine-learning-outline',
  },
  'algorithm-diagram': {
    glyph: 'algorithm-diagram,-diagram,-machine-learning,-data,-flowchart-glyph',
    outline: 'algorithm-diagram,-diagram,-machine-learning,-data,-flowchart-outline',
  },
  'virtual-reality-ai': {
    glyph: 'virtual-reality-ai,-vr,-ai,-immersive,-technology-glyph',
    outline: 'virtual-reality-ai,-vr,-ai,-immersive,-technology-outline',
  },
  'ai-chip': {
    glyph: 'ai-chip,-microchip,-technology,-processor,-artificial-intelligence-glyph',
    outline: 'ai-chip,-microchip,-technology,-processor,-artificial-intelligence-outline',
  },
  'self-driving-car': {
    glyph: 'self-driving-car,-car,-autonomous,-vehicle,-ai-glyph',
    outline: 'self-driving-car,-car,-autonomous,-vehicle,-ai-outline',
  },
  'automated-workflow': {
    glyph: 'automated-workflow,-automation,-process,-technology,-ai-glyph',
    outline: 'automated-workflow,-automation,-process,-technology,-ai-outline',
  },
  'smart-assistant': {
    glyph: 'smart-assistant,-ai,-voice,-technology,-automated-glyph',
    outline: 'smart-assistant,-ai,-voice,-technology,-automated-outline',
  },
  'data-science-chart': {
    glyph: 'data-science-chart,-chart,-analytics,-big-data,-machine-learning-glyph',
    outline: 'data-science-chart,-chart,-analytics,-big-data,-machine-learning-outline',
  },
  'quantum-computing': {
    glyph: 'quantum-computing,-quantum,-technology,-future,-ai-glyph',
    outline: 'quantum-computing,-quantum,-technology,-future,-ai-outline',
  },
}

/**
 * Render an AI icon with automatic size optimization
 * @example
 * <AIIcon name="ai-brain" size={32} />
 */
export const AIIcon: React.FC<IconProps> = ({
  name,
  size = 32,
  alt,
  className = '',
  loading = 'lazy',
}) => {
  const fileName = aiIconNameMap[name] || name
  const src = `/assets/icons/ai/${fileName}-${size}w.png`
  return (
    <img
      src={src}
      alt={alt || name}
      width={size}
      height={size}
      className={className}
      loading={loading}
    />
  )
}

/**
 * Render a fintech icon (SVG)
 * @example
 * <FinTechIcon name="cryptocurrency" size={40} />
 */
export const FinTechIcon: React.FC<Omit<IconProps, 'size'> & { size?: number }> = ({
  name,
  size = 32,
  alt,
  className = '',
  loading = 'lazy',
}) => {
  const fileName = fintechIconNameMap[name] || name
  const src = `/assets/icons/fintech/${fileName}.svg`
  return (
    <img
      src={src}
      alt={alt || name}
      width={size}
      height={size}
      className={className}
      loading={loading}
    />
  )
}

/**
 * Render a machine learning icon (SVG)
 * @example
 * <MLIcon name="ai-brain" style="glyph" size={32} />
 */
export interface MLIconProps extends Omit<IconProps, 'size'> {
  style?: 'glyph' | 'outline'
  size?: number
}

export const MLIcon: React.FC<MLIconProps> = ({
  name,
  style = 'glyph',
  size = 32,
  alt,
  className = '',
  loading = 'lazy',
}) => {
  const mapping = mlIconNameMap[name]
  const fileName = mapping ? mapping[style] : `${name}-${style}`
  const src = `/assets/icons/machine-learning/${fileName}.svg`
  return (
    <img
      src={src}
      alt={alt || name}
      width={size}
      height={size}
      className={className}
      loading={loading}
    />
  )
}

// ============================================================================
// Logo Components
// ============================================================================

export interface LogoProps {
  variant?: 'color' | 'black' | 'white'
  product?: 'swipe-savvy' | 'shop-savvy'
  width?: number
  height?: 'auto' | number
  className?: string
  alt?: string
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
  alt,
}) => {
  const logoName =
    product === 'swipe-savvy'
      ? `swipe_savvy_${variant}`
      : `shop_savvy_${variant}`

  const src = `/assets/logos/${logoName}.png`

  return (
    <img
      src={src}
      alt={alt || `${product} logo`}
      width={width}
      height={height}
      className={className}
    />
  )
}

// ============================================================================
// Hero Card Components
// ============================================================================

export interface HeroCardProps {
  product?: 'shop-savvy' | 'swipe-savvy'
  alt?: string
  className?: string
  loading?: 'eager' | 'lazy'
}

/**
 * Render a responsive hero card image
 * @example
 * <HeroCard product="shop-savvy" />
 */
export const HeroCard: React.FC<HeroCardProps> = ({
  product = 'shop-savvy',
  alt,
  className = '',
  loading = 'lazy',
}) => {
  const baseName =
    product === 'shop-savvy' ? 'shop_savvy_hero_card' : 'swipe_savvy_hero_card'

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
        alt={alt || `${product} hero card`}
        className={className}
        loading={loading}
      />
    </picture>
  )
}

// ============================================================================
// Illustration Components
// ============================================================================

export interface IllustrationProps {
  id: number
  alt?: string
  className?: string
  loading?: 'eager' | 'lazy'
}

/**
 * Render a generated illustration
 * @example
 * <Illustration id={2} />
 */
export const Illustration: React.FC<IllustrationProps> = ({
  id,
  alt,
  className = '',
  loading = 'lazy',
}) => {
  return (
    <img
      src={`/assets/illustrations/image-gen-${id}.png`}
      alt={alt || `Generated illustration ${id}`}
      className={className}
      loading={loading}
    />
  )
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to load and cache the asset manifest
 */
export function useAssetManifest() {
  const [manifest, setManifest] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    fetch('/assets/manifest.json')
      .then((res) => res.json())
      .then((data) => {
        setManifest(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
      })
  }, [])

  return { manifest, loading, error }
}

/**
 * Hook to get available icons in a category
 */
export function useIconList(category: 'ai' | 'fintech' | 'machine-learning') {
  const { manifest, loading } = useAssetManifest()

  const icons = React.useMemo(() => {
    if (!manifest?.categories) return []
    const categoryKey = `icons/${category}`
    return manifest.categories[categoryKey] || []
  }, [manifest, category])

  return { icons, loading }
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
  | 'ai-coding'

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
  | string

export type MLIconName =
  | 'ai-brain'
  | 'neural-network'
  | 'machine-learning-gear'
  | 'robotics-automation'
  | 'data-network'
  | 'cloud-computing'
  | 'chatbot'
  | 'predictive-analytics'
  | string
