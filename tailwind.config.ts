import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        basalt: {
          DEFAULT: "#2c2a26",
          deep: "#0d0d0d",
          elevated: "#1a1a1a",
          muted: "#242424",
        },
        bone: "#f2efe6",
        amber: {
          DEFAULT: "#e0a526",
          bright: "#ffb800",
        },
        "text-secondary": "#a0a0a0",
      },
      fontFamily: {
        sans: [
          "var(--font-plex-sans)",
          "var(--font-noto-ethiopic)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "var(--font-space-grotesk)",
          "var(--font-noto-ethiopic)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
        ethiopic: [
          "var(--font-noto-ethiopic)",
          "var(--font-plex-sans)",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
