/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b8d0ff',
          300: '#8ab1ff',
          400: '#5b8bff',
          500: '#3a66f5',
          600: '#2748e0',
          700: '#2038b5',
          800: '#1e318f',
          900: '#1d2d72',
        },
      },
    },
  },
  plugins: [],
};
