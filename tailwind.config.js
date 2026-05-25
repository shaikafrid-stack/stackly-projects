/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#0a0e18',
          900: '#0d1117',
          800: '#161b27',
          700: '#1e2535',
        }
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(1.5rem)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease',
        'fade-in': 'fade-in 0.2s ease',
      },
    },
  },
  plugins: [],
}
