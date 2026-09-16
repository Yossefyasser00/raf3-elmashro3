import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        white: "rgb(var(--color-white) / <alpha-value>)",
        sand: "rgb(var(--color-sand) / <alpha-value>)",
        coral: "#EE5A36",     // primary CTA / brand accent
        coralDark: "#D6491F",
        sun: "#F6B93B",       // yellow blob accent
        lilac: "#7C6FE0",     // secondary icon accent
        mint: "#22A65E",      // success / grad icon accent
      },
      fontFamily: {
        arabic: ["var(--font-tajawal)", "Tajawal", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
