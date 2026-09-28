/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe7ff',
          200: '#bcd2ff',
          300: '#8fb4ff',
          400: '#5c8dff',
          500: '#3466f6',
          600: '#2148ec',
          700: '#1c39d1',
          800: '#1c31a8',
          900: '#1c2e84',
          950: '#141c50',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          violet: '#8b5cf6',
          teal: '#14b8a6',
          amber: '#f59e0b',
          rose: '#f43f5e',
          sky: '#0ea5e9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)',
        cardHover: '0 8px 24px -4px rgba(15,23,42,0.12), 0 4px 8px -4px rgba(15,23,42,0.08)',
        glow: '0 0 0 1px rgba(52,102,246,0.08), 0 8px 24px -6px rgba(52,102,246,0.25)',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
