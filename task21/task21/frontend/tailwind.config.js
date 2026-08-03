/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0F1D",
          900: "#0D1526",
          800: "#131D33",
          700: "#1B2740",
          600: "#243252",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F6F7FB",
          subtle: "#EEF1F7",
        },
        line: {
          DEFAULT: "#E4E7EE",
          soft: "#EDEFF4",
        },
        accent: {
          DEFAULT: "#14B8A6",
          dark: "#0D9488",
          light: "#5EEAD4",
          soft: "#E6FBF7",
        },
        indigo: {
          DEFAULT: "#5B5FEF",
          soft: "#EEEEFE",
        },
        success: { DEFAULT: "#12B76A", soft: "#E7F9EF" },
        danger: { DEFAULT: "#F04438", soft: "#FEEEEC" },
        warning: { DEFAULT: "#F79009", soft: "#FEF3E2" },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(13,21,38,0.04), 0 1px 12px rgba(13,21,38,0.05)",
        pop: "0 8px 24px rgba(13,21,38,0.10)",
      },
      borderRadius: {
        xl2: "14px",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(18,183,106,0.45)" },
          "70%": { boxShadow: "0 0 0 6px rgba(18,183,106,0)" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.8s infinite",
        fadeUp: "fadeUp .35s ease-out",
      },
    },
  },
  plugins: [],
};
