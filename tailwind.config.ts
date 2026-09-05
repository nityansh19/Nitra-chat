import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { ink: "#08090d", panel: "#0d0f14", line: "rgba(255,255,255,.08)" },
      boxShadow: { glow: "0 0 40px rgba(120,150,255,.12)" }
    }
  },
  plugins: []
};
export default config;
