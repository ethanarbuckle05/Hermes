import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        earth: {
          bg: "#FAFAF7",
          text: "#1A1A18",
          sage: "#5C6B4F",
          tan: "#8B7355",
          border: "#E5E2DB",
          muted: "#8A8680",
          card: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Georgia", "Times New Roman", "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
