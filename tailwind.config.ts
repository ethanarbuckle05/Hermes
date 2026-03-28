import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        earth: {
          bg: "var(--earth-bg)",
          text: "var(--earth-text)",
          sage: "var(--earth-sage)",
          tan: "var(--earth-tan)",
          border: "var(--earth-border)",
          muted: "var(--earth-muted)",
          card: "var(--earth-card)",
          input: "var(--earth-input)",
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
