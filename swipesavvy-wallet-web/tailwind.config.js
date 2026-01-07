/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f1ff',
          100: '#b3d9ff',
          500: '#235393',
          600: '#1b4275',
          700: '#132136',
        },
        success: '#60BA46',
        warning: '#FAB915',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
}
