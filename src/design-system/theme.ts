/**
 * Swipe Savvy Design System - Theme Tokens v1.0.0
 * Modern tech-focused mobile wallet UI
 * Source of truth aligned with tokens.json specification
 */

// ============================================================================
// BRAND COLORS
// ============================================================================
export const BRAND_COLORS = {
  // Primary brand palette
  navy: '#235393',      // Primary actions, links, active states
  deep: '#132136',      // Headlines, primary text, dark surfaces
  green: '#60BA46',     // Success, positive amounts, confirmations
  yellow: '#FAB915',    // Accents, highlights, progress (use sparingly)

  // Neutrals
  black: '#000000',
  darkGrey: '#4B4D4D',  // Tertiary text
  ashGrey: '#747676',   // Secondary text
  white: '#F6F6F6',     // App background
  pureWhite: '#FFFFFF', // Card surfaces

  // Legacy aliases (for backwards compatibility)
  blue: '#235393',
  gray: '#747676',
  lightGray: '#E6E6E6',
  lightGrey: '#E6E6E6',
  mediumGrey: '#747676',

  // Status colors
  danger: '#D64545',
  orange: '#FF9500',
  purple: '#8B5CF6',
  red: '#EF4444',
  pink: '#EC4899',
};

// ============================================================================
// LIGHT THEME (Default)
// ============================================================================
export const LIGHT_THEME = {
  // Base surfaces
  bg: '#F6F6F6',                      // App background
  panel: '#FFFFFF',                   // Cards - solid white for cleaner look
  panelSolid: '#FFFFFF',              // Solid white surfaces
  panel2: '#FFFFFF',                  // Secondary panels - also solid
  surfaceAlt: '#EAF2FF',              // Highlighted sections (light blue tint)

  // Borders & strokes
  stroke: '#E6E6E6',                  // Card borders, dividers
  divider: 'rgba(19,33,54,0.08)',     // Subtle separators

  // Text colors
  text: '#132136',                    // Primary text (deep)
  textSecondary: '#747676',           // Secondary text (ash grey)
  textTertiary: '#4B4D4D',            // Tertiary text (dark grey)
  muted: '#747676',                   // Muted text
  muted2: 'rgba(19,33,54,0.45)',      // More muted

  // Interactive
  link: '#235393',                    // Links and interactive text
  focusRing: 'rgba(35,83,147,0.24)',  // Focus states
  overlay: 'rgba(19,33,54,0.44)',     // Modal backdrops

  // Ghost/secondary backgrounds
  ghost: 'rgba(35,83,147,0.06)',      // Subtle navy tint
  ghost2: 'rgba(35,83,147,0.10)',     // Stronger navy tint

  // Status colors
  success: '#60BA46',
  successBg: 'rgba(96,186,70,0.14)',
  danger: '#D64545',
  dangerBg: 'rgba(214,69,69,0.14)',
  warning: '#FAB915',
  warningBg: 'rgba(250,185,21,0.16)',
  info: '#235393',
  infoBg: 'rgba(35,83,147,0.10)',

  // Navigation (glassmorphic)
  navGlass: 'rgba(255,255,255,0.92)',
  navShadow: '0 -12px 40px rgba(19,33,54,0.06)',
  statusbar: 'rgba(255,255,255,0.75)',

  // Brand colors (quick access)
  brand: BRAND_COLORS.navy,
  brandDeep: BRAND_COLORS.deep,
  brandGreen: BRAND_COLORS.green,
  brandYellow: BRAND_COLORS.yellow,
};

// ============================================================================
// DARK THEME
// ============================================================================
export const DARK_THEME = {
  // Base surfaces
  bg: '#132136',                      // App background (brand deep)
  panel: '#0D1626',                   // Cards - solid dark
  panelSolid: '#0D1626',              // Solid dark surface
  panel2: '#111D31',                  // Secondary panels
  surfaceAlt: '#1B2A45',              // Highlighted sections

  // Borders & strokes
  stroke: '#2A3B57',                  // Card borders
  divider: 'rgba(255,255,255,0.10)',  // Subtle separators

  // Text colors
  text: '#FFFFFF',                    // Primary text
  textSecondary: '#C9D3E6',           // Secondary text
  textTertiary: 'rgba(255,255,255,0.72)', // Tertiary text
  muted: '#C9D3E6',                   // Muted text
  muted2: 'rgba(255,255,255,0.44)',   // More muted

  // Interactive
  link: '#FAB915',                    // Links (yellow in dark mode)
  focusRing: 'rgba(250,185,21,0.26)', // Focus states
  overlay: 'rgba(0,0,0,0.55)',        // Modal backdrops

  // Ghost/secondary backgrounds
  ghost: 'rgba(96,186,70,0.08)',      // Subtle green tint
  ghost2: 'rgba(35,83,147,0.18)',     // Navy tint

  // Status colors
  success: '#60BA46',
  successBg: 'rgba(96,186,70,0.18)',
  danger: '#FF6B6B',                  // Brighter red for dark mode
  dangerBg: 'rgba(214,69,69,0.18)',
  warning: '#FAB915',
  warningBg: 'rgba(250,185,21,0.16)',
  info: '#235393',
  infoBg: 'rgba(35,83,147,0.18)',

  // Navigation (glassmorphic)
  navGlass: 'rgba(13,22,38,0.92)',
  navShadow: '0 -18px 56px rgba(0,0,0,0.35)',
  statusbar: 'rgba(13,22,38,0.75)',

  // Brand colors (quick access)
  brand: BRAND_COLORS.navy,
  brandDeep: BRAND_COLORS.deep,
  brandGreen: BRAND_COLORS.green,
  brandYellow: BRAND_COLORS.yellow,
};

// ============================================================================
// SPACING SYSTEM (4px baseline)
// ============================================================================
export const SPACING = {
  // Numeric scale
  0: 0,
  1: 4,    // Tight gaps, icon padding
  2: 8,    // Inline elements, small gaps
  3: 12,   // Card internal spacing
  4: 16,   // Standard gaps, card padding
  5: 20,   // Medium sections
  6: 24,   // Page padding, section gaps
  7: 28,   // Larger sections
  8: 32,   // Major sections
  9: 40,   // Screen sections
  10: 48,  // Hero spacing
  11: 56,  // Large hero
  12: 64,  // Maximum spacing

  // Named aliases
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// ============================================================================
// BORDER RADIUS (Updated from spec)
// ============================================================================
export const RADIUS = {
  xs: 10,   // Small buttons, badges
  sm: 14,   // Buttons, inputs
  md: 18,   // Cards, panels
  lg: 22,   // Large cards, modals
  xl: 28,   // Hero cards
  pill: 999, // Pills, avatars, tags
};

// ============================================================================
// ELEVATION (Shadows)
// ============================================================================
export const SHADOWS = {
  // Named shadows from spec
  shadowSm: '0 1px 1px rgba(0,0,0,0.06), 0 10px 30px rgba(0,0,0,0.06)',
  shadowMd: '0 2px 2px rgba(0,0,0,0.08), 0 18px 60px rgba(0,0,0,0.12)',
  shadowLg: '0 20px 70px rgba(0,0,0,0.20)',

  // Legacy aliases
  shadow1: '0 1px 1px rgba(0,0,0,0.06), 0 10px 30px rgba(0,0,0,0.06)',
  shadow2: '0 2px 2px rgba(0,0,0,0.08), 0 18px 60px rgba(0,0,0,0.12)',

  // Elevation levels
  elevation: {
    1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    2: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    3: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
    4: '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
  },
};

// ============================================================================
// TYPOGRAPHY (Updated from spec)
// ============================================================================
export const TYPOGRAPHY = {
  // Font families
  fontFamily: {
    headline: 'System', // Hermes if available
    body: 'System',     // Barlow if available
    base: 'System',
    mono: 'SpaceMono',
  },

  // Font sizes (updated scale from spec)
  fontSize: {
    // New scale
    display: 40,  // Hero numbers, KPIs
    h1: 28,       // Screen titles
    h2: 22,       // Section headers
    h3: 18,       // Card titles
    body: 14,     // Primary content
    bodySm: 13,   // Dense content
    caption: 12,  // Labels, metadata
    micro: 11,    // Badges, tags
    kpi: 32,      // Dashboard numbers

    // Legacy aliases
    meta: 12,
    xl: 20,
    lg: 16,
    md: 14,
    sm: 12,
    xs: 10,
  },

  // Font weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line heights (updated from spec)
  lineHeight: {
    tight: 1.15,
    normal: 1.35,
    relaxed: 1.5,
  },

  // Pre-composed text styles
  display: {
    fontSize: 40,
    fontWeight: '800' as const,
    lineHeight: 46,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  heading2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  heading4: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  body2: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  body3: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  micro: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 17,
  },
  kpi: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
  },
};

// ============================================================================
// ANIMATION
// ============================================================================
export const ANIMATION = {
  duration: {
    fast: 150,    // Micro-interactions, hovers
    normal: 180,  // State changes, reveals
    slow: 260,    // Complex transitions, modals
  },
  easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
};

// ============================================================================
// ICONOGRAPHY
// ============================================================================
export const ICON_OPACITY = {
  inactive: 0.55,  // Inactive nav icons
  active: 1,       // Active nav icons
};

export const ICON = {
  gridSize: 24,
  strokeWidth: 2,
  cornerRadius: 6,
  inactiveOpacity: 0.55,
  activeOpacity: 1,
};

// ============================================================================
// LAYOUT
// ============================================================================
export const LAYOUT = {
  phoneMaxWidth: 420,
  blur: 14,
  stroke: 1,
  tabBarHeight: 64,
  headerHeight: 56,
  pagePadding: 24,
  sectionGap: 24,
  cardPadding: 16,
};

// ============================================================================
// COMPONENT SPECIFICATIONS
// ============================================================================
export const COMPONENTS = {
  button: {
    height: 44,
    minWidth: 44,
    radius: 14,
    paddingX: 14,
    iconSize: 18,
  },
  input: {
    height: 44,
    radius: 14,
    paddingX: 12,
    borderWidth: 1,
  },
  card: {
    radius: 18,
    padding: 16,
    borderWidth: 1,
  },
  badge: {
    radius: 999,
    paddingX: 10,
    paddingY: 6,
    fontSize: 12,
  },
  avatar: {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },
  iconBox: {
    size: 44,
    iconSize: 20,
    radius: 14,
  },
};
