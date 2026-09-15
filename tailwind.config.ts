import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ah: {
          blue: "#008CFF",
          "blue-dark": "#0068C7",
          red: "#E31B23",
          green: "#21D14A",
          "green-dark": "#12A336",
          ink: "#12141A",
          muted: "#5A6270",
          line: "#E6E8EE",
          bg: "#F6F7F9",
          card: "#FFFFFF",
          orange: "#F59E0B",
        },
      },
      boxShadow: {
        card: "0 10px 30px rgba(18, 20, 26, 0.06)",
        brand: "0 12px 32px rgba(0, 140, 255, 0.18)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
