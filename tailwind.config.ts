import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--nitra-bg)",
        panel: "var(--nitra-bg-elevated)",
        line: "var(--nitra-line)",
        nitra: {
          accent: "var(--nitra-accent)",
          cyan: "var(--nitra-cyan)",
          success: "var(--nitra-success)",
          danger: "var(--nitra-danger)",
          warning: "var(--nitra-warning)",
        },
      },
      borderRadius: {
        nitra: "var(--nitra-radius-md)",
      },
      boxShadow: {
        glow: "var(--nitra-shadow-glow)",
        "nitra-sm": "var(--nitra-shadow-sm)",
        "nitra-md": "var(--nitra-shadow-md)",
        "nitra-lg": "var(--nitra-shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
