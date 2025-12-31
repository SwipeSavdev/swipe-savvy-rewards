/**
 * SwipeSavvy Design System - Theme Tokens
 * Modern tech-focused mobile wallet UI
 * Includes light/dark mode support and comprehensive spacing/sizing scales
 */

export const BRAND_COLORS = {
  navy: '#235393',
  deep: '#132136',
  green: '#60BA46',
  yellow: '#FAB915',
};

// Light theme (default)
export const LIGHT_THEME = {
  // Base
  bg: '#F6F6F6',
  panel: 'rgba(255,255,255,0.82)',
  panelSolid: '#FFFFFF',
  panel2: 'rgba(255,255,255,0.65)',
  stroke: 'rgba(19,33,54,0.12)',
  text: '#132136',
  muted: 'rgba(19,33,54,0.62)',
  muted2: 'rgba(19,33,54,0.45)',

  // Ghost/secondary backgrounds
  ghost: 'rgba(35,83,147,0.06)',
  ghost2: 'rgba(35,83,147,0.10)',

  // Status colors
  success: '#60BA46',
  successBg: 'rgba(96,186,70,0.14)',
  danger: '#D64545',
  warning: '#FAB915',
  warningBg: 'rgba(250,185,21,0.16)',

  // Navigation
  navGlass: 'rgba(255,255,255,0.78)',
  navShadow: '0 -12px 40px rgba(19,33,54,0.10)',
  statusbar: 'rgba(255,255,255,0.55)',

  // Brand
  brand: BRAND_COLORS.navy,
  brandDeep: BRAND_COLORS.deep,
  brandGreen: BRAND_COLORS.green,
  brandYellow: BRAND_COLORS.yellow,
};

// Dark theme
export const DARK_THEME = {
  // Base
  bg: '#0B111B',
  panel: 'rgba(19,33,54,0.62)',
  panelSolid: '#121C2B',
  panel2: 'rgba(19,33,54,0.46)',
  stroke: 'rgba(246,246,246,0.12)',
  text: 'rgba(246,246,246,0.92)',
  muted: 'rgba(246,246,246,0.62)',
  muted2: 'rgba(246,246,246,0.44)',

  // Ghost/secondary backgrounds
  ghost: 'rgba(96,186,70,0.08)',
  ghost2: 'rgba(35,83,147,0.18)',

  // Status colors
  success: '#60BA46',
  successBg: 'rgba(96,186,70,0.18)',
  danger: '#FF6B6B',
  warning: '#FAB915',
  warningBg: 'rgba(250,185,21,0.16)',

  // Navigation
  navGlass: 'rgba(18,28,43,0.72)',
  navShadow: '0 -18px 56px rgba(0,0,0,0.45)',
  statusbar: 'rgba(18,28,43,0.55)',

  // Brand
  brand: BRAND_COLORS.navy,
  brandDeep: BRAND_COLORS.deep,
  brandGreen: BRAND_COLORS.green,
  brandYellow: BRAND_COLORS.yellow,
};

// Spacing scale (4dp baseline)
export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 56,
};

// Border radius
export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

// Shadows (elevation)
export const SHADOWS = {
  shadow1: '0 1px 1px rgba(0,0,0,.06), 0 10px 30px rgba(0,0,0,.06)',
  shadow2: '0 2px 2px rgba(0,0,0,.08), 0 18px 60px rgba(0,0,0,.12)',
  elevation: {
    1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    2: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    3: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
    4: '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
  },
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    base: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSize: {
    h1: 28,
    h2: 18,
    h3: 15,
    body: 14,
    meta: 12,
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.1,
    normal: 1.45,
    relaxed: 1.55,
  },
};

// Animation
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 180,
    slow: 260,
  },
  easing: 'cubic-bezier(.2,.8,.2,1)',
};

// Icon opacity
export const ICON_OPACITY = {
  inactive: 0.55,
  active: 1,
};

// Layout
export const LAYOUT = {
  phoneMaxWidth: 420,
  blur: 14,
  stroke: 1,
};
