import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Premium beauty palette: soft blush, warm gold, deep plum
        blush: {
          50: "#fdf6f6",
          100: "#fbeaec",
          200: "#f6d3d8",
          300: "#eeb0ba",
          400: "#e28396",
          500: "#d35e76",
          600: "#bd4060",
        },
        gold: {
          400: "#d4af6a",
          500: "#c69749",
          600: "#a87d33",
        },
        plum: {
          700: "#4a2c3d",
          800: "#3a2230",
          900: "#2a1822",
        },
        cream: "#fbf7f2",
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"],
        display: ["var(--font-tajawal)", "var(--font-cairo)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(74, 44, 61, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
