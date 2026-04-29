import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f0f0f",
        cyan: "#00B5FF",
        magenta: "#FF2EBF",
        yellow: "#FFD300",
        mist: "#F6F7F9",
        steel: "#707070",
      },
      fontFamily: {
        display: ["var(--font-sora)", '"Sora"', '"Space Grotesk"', "sans-serif"],
        sans: ["var(--font-inter)", '"Inter"', '"Segoe UI"', "sans-serif"],
        mono: ['"JetBrains Mono"', '"Consolas"', "monospace"],
      },
      boxShadow: {
        panel: "0 18px 48px rgba(15, 15, 15, 0.08)",
        glow: "0 0 0 1px rgba(15, 15, 15, 0.05), 0 18px 42px rgba(0, 181, 255, 0.1)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(rgba(15,15,15,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,15,15,0.06) 1px, transparent 1px)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
