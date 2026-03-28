import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        hermes: {
          50: "#fef7ee",
          100: "#feedd6",
          200: "#fbd7ad",
          300: "#f8b978",
          400: "#f49141",
          500: "#f1741c",
          600: "#e25a12",
          700: "#bb4311",
          800: "#953616",
          900: "#782f15",
          950: "#411509",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
