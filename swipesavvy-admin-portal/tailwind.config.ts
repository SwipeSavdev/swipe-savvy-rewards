import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        headline: ['var(--ss-font-headline)'],
        body: ['var(--ss-font-body)'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        sm: 'var(--ss-shadow-sm)',
        md: 'var(--ss-shadow-md)',
      },
      borderRadius: {
        md: 'var(--ss-radius-md)',
        lg: 'var(--ss-radius-lg)',
        pill: 'var(--ss-radius-pill)',
      },
    },
  },
  plugins: [],
} satisfies Config
