import type { Config } from 'tailwindcss'

/**
 * ============================================================================
 * SWIPESAVVY ADMIN PORTAL - TAILWIND CONFIGURATION V5
 * COMPLETE RESET - Built from scratch
 * ============================================================================
 *
 * This config uses CSS custom properties from design-tokens.css.
 * Design Philosophy: PRECISION OVER DELIGHT
 * - Bank-grade neutral foundation
 * - Color for STATUS ONLY (never decorative)
 * - True dark mode (deep charcoal)
 * - WCAG 2.2 AA compliant
 */

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      // ========================================================================
      // COLORS
      // Using CSS variables for automatic light/dark mode switching
      // ========================================================================
      colors: {
        // Background hierarchy
        bg: {
          page: 'var(--color-bg-page)',
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          inverse: 'var(--color-bg-inverse)',
          overlay: 'var(--color-bg-overlay)',
        },

        // Text hierarchy
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          quaternary: 'var(--color-text-quaternary)',
          inverse: 'var(--color-text-inverse)',
          link: 'var(--color-text-link)',
          'link-hover': 'var(--color-text-link-hover)',
        },

        // Border hierarchy
        border: {
          primary: 'var(--color-border-primary)',
          secondary: 'var(--color-border-secondary)',
          tertiary: 'var(--color-border-tertiary)',
          focus: 'var(--color-border-focus)',
          inverse: 'var(--color-border-inverse)',
        },

        // Status colors - ONLY for status indication
        status: {
          success: {
            bg: 'var(--color-status-success-bg)',
            border: 'var(--color-status-success-border)',
            text: 'var(--color-status-success-text)',
            icon: 'var(--color-status-success-icon)',
          },
          warning: {
            bg: 'var(--color-status-warning-bg)',
            border: 'var(--color-status-warning-border)',
            text: 'var(--color-status-warning-text)',
            icon: 'var(--color-status-warning-icon)',
          },
          danger: {
            bg: 'var(--color-status-danger-bg)',
            border: 'var(--color-status-danger-border)',
            text: 'var(--color-status-danger-text)',
            icon: 'var(--color-status-danger-icon)',
          },
          info: {
            bg: 'var(--color-status-info-bg)',
            border: 'var(--color-status-info-border)',
            text: 'var(--color-status-info-text)',
            icon: 'var(--color-status-info-icon)',
          },
        },

        // Action colors (buttons, links)
        action: {
          primary: {
            bg: 'var(--color-action-primary-bg)',
            'bg-hover': 'var(--color-action-primary-bg-hover)',
            'bg-active': 'var(--color-action-primary-bg-active)',
            text: 'var(--color-action-primary-text)',
          },
          secondary: {
            bg: 'var(--color-action-secondary-bg)',
            'bg-hover': 'var(--color-action-secondary-bg-hover)',
            'bg-active': 'var(--color-action-secondary-bg-active)',
            border: 'var(--color-action-secondary-border)',
            text: 'var(--color-action-secondary-text)',
          },
          ghost: {
            bg: 'var(--color-action-ghost-bg)',
            'bg-hover': 'var(--color-action-ghost-bg-hover)',
            'bg-active': 'var(--color-action-ghost-bg-active)',
            text: 'var(--color-action-ghost-text)',
          },
          danger: {
            bg: 'var(--color-action-danger-bg)',
            'bg-hover': 'var(--color-action-danger-bg-hover)',
            'bg-active': 'var(--color-action-danger-bg-active)',
            text: 'var(--color-action-danger-text)',
          },
        },

        // Brand colors - Primary brand identity
        brand: {
          navy: '#235393',
          'navy-dark': '#1a3f7a',
          'navy-light': '#3a6db8',
          deep: '#132136',
          'deep-light': '#1a2a3f',
          green: '#60ba46',
          'green-dark': '#4a9a35',
          'green-light': '#7acc5e',
          yellow: '#fab915',
          'yellow-dark': '#e8a60a',
          'yellow-light': '#fcc548',
        },
      },

      // ========================================================================
      // TYPOGRAPHY
      // ========================================================================
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        mono: ['var(--font-family-mono)'],
      },

      fontSize: {
        '2xs': ['var(--font-size-2xs)', { lineHeight: 'var(--line-height-normal)' }],
        xs: ['var(--font-size-xs)', { lineHeight: 'var(--line-height-normal)' }],
        sm: ['var(--font-size-sm)', { lineHeight: 'var(--line-height-normal)' }],
        base: ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)' }],
        md: ['var(--font-size-md)', { lineHeight: 'var(--line-height-normal)' }],
        lg: ['var(--font-size-lg)', { lineHeight: 'var(--line-height-snug)' }],
        xl: ['var(--font-size-xl)', { lineHeight: 'var(--line-height-snug)' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-tight)' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-tight)' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: 'var(--line-height-tight)' }],
      },

      fontWeight: {
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },

      lineHeight: {
        none: 'var(--line-height-none)',
        tight: 'var(--line-height-tight)',
        snug: 'var(--line-height-snug)',
        normal: 'var(--line-height-normal)',
        relaxed: 'var(--line-height-relaxed)',
        loose: 'var(--line-height-loose)',
      },

      letterSpacing: {
        tighter: 'var(--letter-spacing-tighter)',
        tight: 'var(--letter-spacing-tight)',
        normal: 'var(--letter-spacing-normal)',
        wide: 'var(--letter-spacing-wide)',
        wider: 'var(--letter-spacing-wider)',
        widest: 'var(--letter-spacing-widest)',
      },

      // ========================================================================
      // SPACING (4px base grid)
      // ========================================================================
      spacing: {
        0: 'var(--spacing-0)',
        px: 'var(--spacing-px)',
        0.5: 'var(--spacing-0-5)',
        1: 'var(--spacing-1)',
        1.5: 'var(--spacing-1-5)',
        2: 'var(--spacing-2)',
        2.5: 'var(--spacing-2-5)',
        3: 'var(--spacing-3)',
        3.5: 'var(--spacing-3-5)',
        4: 'var(--spacing-4)',
        5: 'var(--spacing-5)',
        6: 'var(--spacing-6)',
        7: 'var(--spacing-7)',
        8: 'var(--spacing-8)',
        9: 'var(--spacing-9)',
        10: 'var(--spacing-10)',
        11: 'var(--spacing-11)',
        12: 'var(--spacing-12)',
        14: 'var(--spacing-14)',
        16: 'var(--spacing-16)',
        20: 'var(--spacing-20)',
        24: 'var(--spacing-24)',
        32: 'var(--spacing-32)',
      },

      // ========================================================================
      // BORDER RADIUS
      // ========================================================================
      borderRadius: {
        none: 'var(--radius-none)',
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
      },

      // ========================================================================
      // SHADOWS
      // ========================================================================
      boxShadow: {
        none: 'var(--shadow-none)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        inner: 'var(--shadow-inner)',
        focus: 'var(--shadow-focus-ring)',
      },

      // ========================================================================
      // TRANSITIONS
      // ========================================================================
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
        slowest: 'var(--duration-slowest)',
      },

      transitionTimingFunction: {
        linear: 'var(--ease-linear)',
        in: 'var(--ease-in)',
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
        bounce: 'var(--ease-bounce)',
      },

      // ========================================================================
      // Z-INDEX
      // ========================================================================
      zIndex: {
        below: 'var(--z-below)',
        base: 'var(--z-base)',
        raised: 'var(--z-raised)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
        toast: 'var(--z-toast)',
        max: 'var(--z-max)',
      },

      // ========================================================================
      // LAYOUT
      // ========================================================================
      width: {
        sidebar: 'var(--layout-sidebar-width)',
        'sidebar-collapsed': 'var(--layout-sidebar-width-collapsed)',
      },

      height: {
        header: 'var(--layout-header-height)',
        'input-xs': 'var(--component-height-xs)',
        'input-sm': 'var(--component-height-sm)',
        'input-md': 'var(--component-height-md)',
        'input-lg': 'var(--component-height-lg)',
        'input-xl': 'var(--component-height-xl)',
      },

      maxWidth: {
        page: 'var(--layout-page-max-width)',
        content: 'var(--layout-content-max-width)',
      },

      minHeight: {
        'screen-nav': 'calc(100vh - var(--layout-header-height))',
      },

      // ========================================================================
      // ANIMATIONS
      // ========================================================================
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },

      animation: {
        'fade-in': 'fade-in var(--duration-normal) var(--ease-out)',
        'fade-out': 'fade-out var(--duration-normal) var(--ease-in)',
        'slide-up': 'slide-up var(--duration-normal) var(--ease-out)',
        'slide-down': 'slide-down var(--duration-normal) var(--ease-out)',
        'scale-in': 'scale-in var(--duration-normal) var(--ease-out)',
        spin: 'spin 1s linear infinite',
        skeleton: 'skeleton-pulse 2s var(--ease-in-out) infinite',
      },

      // ========================================================================
      // BACKDROP BLUR
      // ========================================================================
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
} satisfies Config
