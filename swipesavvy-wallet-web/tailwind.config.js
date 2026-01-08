/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Colors - Refined Palette (matching admin portal)
      colors: {
        // Primary - Navy Blue
        primary: {
          50: '#f0f4fa',
          100: '#dce5f4',
          200: '#b8cbe8',
          300: '#8aa8d8',
          400: '#5c85c8',
          500: '#235393',
          600: '#1c4275',
          700: '#153157',
          800: '#0e213a',
          900: '#07101d',
        },
        // Success - Green
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#60BA46',
          600: '#4d9538',
          700: '#3a702a',
          800: '#274B1C',
          900: '#14260E',
          DEFAULT: '#60BA46',
        },
        // Warning - Gold
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FAB915',
          600: '#c89411',
          700: '#966F0D',
          800: '#644A09',
          900: '#322504',
          DEFAULT: '#FAB915',
        },
        // Danger - Red
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#E5484D',
          600: '#b73a3e',
          700: '#892B2F',
          800: '#5C1D1F',
          900: '#2E0E10',
          DEFAULT: '#E5484D',
        },
        // Neutral - Gray (extended)
        neutral: {
          25: '#fcfcfd',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },

      // Font Families
      fontFamily: {
        sans: ['Barlow', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['SF Pro Display', 'Barlow', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Consolas', 'monospace'],
      },

      // Font Sizes
      fontSize: {
        'display-1': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-2': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-1': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-2': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-4': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.5' }],
        'body': ['1rem', { lineHeight: '1.5' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },

      // Spacing
      spacing: {
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem',
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // Box Shadow - Refined & Subtle
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.03)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'primary': '0 4px 14px 0 rgb(35 83 147 / 0.12)',
        'success': '0 4px 14px 0 rgb(96 186 70 / 0.12)',
        'danger': '0 4px 14px 0 rgb(229 72 77 / 0.12)',
      },

      // Border Radius - Refined (Less Bulky)
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        'card': '8px',
        'button': '6px',
        'input': '6px',
        'badge': '4px',
        'pill': '9999px',
      },

      // Transitions
      transitionDuration: {
        'instant': '50ms',
        'fast': '100ms',
        'normal': '150ms',
        'slow': '200ms',
        'slower': '300ms',
      },

      transitionTimingFunction: {
        'ease-default': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-bounce': 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
      },

      // Z-Index
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },

      // Keyframes & Animations
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
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.9)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'fade-out': 'fade-out 150ms ease-in',
        'slide-up': 'slide-up 150ms ease-out',
        'slide-down': 'slide-down 150ms ease-out',
        'slide-in-right': 'slide-in-right 200ms ease-out',
        'slide-in-left': 'slide-in-left 200ms ease-out',
        'scale-in': 'scale-in 150ms ease-out',
        'skeleton': 'skeleton-pulse 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },

      // Background Image - Refined gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #235393 0%, #1c4275 100%)',
        'gradient-primary-subtle': 'linear-gradient(135deg, #f0f4fa 0%, #dce5f4 100%)',
        'gradient-success': 'linear-gradient(135deg, #60BA46 0%, #4d9538 100%)',
        'gradient-warning': 'linear-gradient(135deg, #FAB915 0%, #c89411 100%)',
        'gradient-danger': 'linear-gradient(135deg, #E5484D 0%, #b73a3e 100%)',
        'gradient-card': 'linear-gradient(135deg, #235393 0%, #1c4275 100%)',
        'gradient-card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
      },

      // Backdrop Blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },

      // Max Width
      maxWidth: {
        'page': '1400px',
        'content': '1200px',
        'narrow': '600px',
        'card': '400px',
        'prose': '65ch',
      },

      // Min Height
      minHeight: {
        'screen-nav': 'calc(100vh - 64px)',
      },
    },
  },
  plugins: [],
}
