/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        cream: { 50: '#fdfdf8', 100: '#f9f7ee', 200: '#f2edd8', 300: '#e8dfc0' },
        spice: { 400: '#e8793a', 500: '#d4622a', 600: '#b84f20' },
        herb: { 400: '#5a8a4a', 500: '#4a7a3a', 600: '#3a6a2a' },
        ink: { 800: '#1a1410', 900: '#0d0a07' },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      }
    },
  },
  plugins: [],
}
