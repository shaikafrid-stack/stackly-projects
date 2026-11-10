/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Lato", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#134b4a",
          dark: "#0e3a39",
          link: "#316160",
        },
        danger: {
          DEFAULT: "#fc5a5a",
          icon: "#c85a5a",
          bg: "#ffe2e2",
          border: "#d57c7c",
        },
        pill: "#dbe8ff",
      },
      boxShadow: {
        card: "0 10px 40px rgba(0,0,0,0.35)",
        field: "0 2px 3px rgba(0,0,0,0.25)",
        icon: "0 2px 4px rgba(0,0,0,0.55)",
      },
    },
  },
  plugins: [],
};
