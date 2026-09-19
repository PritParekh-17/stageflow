import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        panel: {
          DEFAULT: "var(--panel-bg)",
          header: "var(--panel-header)",
          border: "var(--panel-border)",
        },
        stage: {
          live: "#10b981",
          liveBg: "rgba(16, 185, 129, 0.12)",
          delay: "#ef4444",
          delayBg: "rgba(239, 68, 68, 0.12)",
          warn: "#f59e0b",
          warnBg: "rgba(245, 158, 11, 0.12)",
          info: "#3b82f6",
          infoBg: "rgba(59, 130, 246, 0.12)",
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      keyframes: {
        "live-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.92)" },
        },
      },
      animation: {
        "live-pulse": "live-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
