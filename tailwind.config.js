/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        brand: {
          bg: "#050508", // ងងឹតជាងមុនបន្តិច ដើម្បីឱ្យ Neon លេចធ្លោ
          surface: "#0F0F15",
          card: "#15151E",
          border: "#27272A",
          primary: "#A855F7", // Purple Neon
          accent: "#06B6D4",  // Cyan Neon
          gold: "#FBBF24",
          text: "#FAFAFA",
          muted: "#A1A1AA",
        },
        fox: { // រក្សាទុកសម្រាប់ Admin ចាស់ៗ
          bg: "#050508", surface: "#0F0F15", card: "#15151E", border: "#27272A",
          primary: "#A855F7", accent: "#06B6D4", gold: "#FBBF24", text: "#FAFAFA", muted: "#A1A1AA",
        },
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(168, 85, 247, 0.4)",
        "glow-accent": "0 0 20px rgba(6, 182, 212, 0.4)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        "aurora": "aurora 15s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        aurora: {
          "0%": { transform: "scale(1) translate(0, 0)", opacity: "0.6" },
          "50%": { transform: "scale(1.2) translate(5%, 5%)", opacity: "0.8" },
          "100%": { transform: "scale(1) translate(-5%, -5%)", opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.8", filter: "brightness(1.5)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      },
    },
  },
  plugins: [],
};