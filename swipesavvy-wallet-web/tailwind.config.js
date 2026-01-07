/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Colors
      colors: {
        // Primary Brand - Navy Blue
        primary: {
          50: '#E8EFF8',
          100: '#C5D7ED',
          200: '#9EBDE1',
          300: '#77A3D5',
          400: '#508AC8',
          500: '#235393',
          600: '#1C4275',
          700: '#153157',
          800: '#0E213A',
          900: '#07101D',
        },
        // Success - Green
        success: {
          50: '#ECFAE8',
          100: '#C9F2BD',
          200: '#A6E992',
          300: '#83E067',
          400: '#72CD56',
          500: '#60BA46',
          600: '#4D9538',
          700: '#3A702A',
          800: '#274B1C',
          900: '#14260E',
          DEFAULT: '#60BA46',
        },
        // Warning - Yellow/Gold
        warning: {
          50: '#FFF8E6',
          100: '#FEEAB3',
          200: '#FDDC80',
          300: '#FCCE4D',
          400: '#FBC31A',
          500: '#FAB915',
          600: '#C89411',
          700: '#966F0D',
          800: '#644A09',
          900: '#322504',
          DEFAULT: '#FAB915',
        },
        // Danger - Red
        danger: {
          50: '#FDECEC',
          100: '#F9CCCF',
          200: '#F5ABAF',
          300: '#F08A90',
          400: '#EB6970',
          500: '#E5484D',
          600: '#B73A3E',
          700: '#892B2F',
          800: '#5C1D1F',
          900: '#2E0E10',
          DEFAULT: '#E5484D',
        },
        // Neutral - Gray
        neutral: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },
      },

      // Font Families
      fontFamily: {
        display: ['"SF Pro Display"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Barlow', '"SF Pro Text"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"SF Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },

      // Font Sizes
      fontSize: {
        'display-1': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-2': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-1': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-2': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-4': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
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

      // Box Shadow
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },

      // Border Radius
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        'card': '16px',
      },

      // Transitions
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
        'slower': '500ms',
      },

      transitionTimingFunction: {
        'ease-in-out-custom': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
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
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
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
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 200ms ease-in',
        'slide-up': 'slide-up 200ms ease-out',
        'slide-down': 'slide-down 200ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        'skeleton': 'skeleton-pulse 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },

      // Background Image (for gradients)
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #235393 0%, #1A3F7A 100%)',
        'gradient-primary-vibrant': 'linear-gradient(135deg, #235393 0%, #4A90E2 100%)',
        'gradient-success': 'linear-gradient(135deg, #60BA46 0%, #4A9A35 100%)',
        'gradient-warning': 'linear-gradient(135deg, #FAB915 0%, #FF8C00 100%)',
        'gradient-danger': 'linear-gradient(135deg, #E5484D 0%, #B73A3E 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F4D03F 0%, #FAB915 50%, #E67E22 100%)',
        'gradient-card': 'linear-gradient(135deg, #235393 0%, #1C4275 50%, #153157 100%)',
        'gradient-card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
        'gradient-hero': 'linear-gradient(180deg, #235393 0%, #1A3F7A 100%)',
      },

      // Backdrop Blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },

      // Max Width for containers
      maxWidth: {
        'page': '1400px',
        'content': '1200px',
        'narrow': '600px',
        'card': '400px',
      },

      // Min Height
      minHeight: {
        'screen-nav': 'calc(100vh - 64px)',
      },
    },
  },
  plugins: [],
}
