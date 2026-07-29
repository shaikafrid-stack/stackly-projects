/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b3ccff',
          300: '#80a8ff',
          400: '#4d7dff',
          500: '#2a56f6',
          600: '#1e40d1',
          700: '#1a34a8',
          800: '#182c85',
          900: '#18286b',
        },
      },
    },
  },
  plugins: [],
};
