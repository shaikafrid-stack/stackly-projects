/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f0ff',
          100: '#e6e1ff',
          200: '#cabdff',
          300: '#a98cff',
          400: '#8a5cff',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3b1478'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 8px 30px -6px rgba(124, 58, 237, 0.45)',
        card: '0 4px 24px -4px rgba(15, 23, 42, 0.08)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 45%, #ec4899 100%)',
        'app-bg': 'radial-gradient(circle at 0% 0%, #f5f3ff 0%, #eef2ff 40%, #fdf4ff 100%)'
      }
    }
  },
  plugins: []
};
