/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7f5',
          100: '#d9ebe5',
          500: '#2f7d6b',
          600: '#256656',
          700: '#1c4f43',
        },
      },
    },
  },
  plugins: [],
};
