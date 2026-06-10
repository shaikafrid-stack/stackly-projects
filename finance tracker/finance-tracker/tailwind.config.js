export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        display: ['Clash Display', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: '#0a0a0f',
        surface: '#12121a',
        card: '#1a1a26',
        border: '#2a2a3a',
        accent: '#6c63ff',
        'accent-2': '#ff6584',
        'accent-3': '#43d9ad',
        muted: '#6b6b8a',
        text: '#e8e8f0',
      }
    }
  },
  plugins: []
}
