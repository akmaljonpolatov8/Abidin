/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: "#003366",
        sand: "#F5DEB3",
        success: "#2E7D32",
        danger: "#C62828",
        divider: "rgba(0, 51, 102, 0.2)",
      },
      boxShadow: {
        panel: "0 2px 8px rgba(0,51,102,0.1)",
      },
      borderRadius: {
        soft: "8px",
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
