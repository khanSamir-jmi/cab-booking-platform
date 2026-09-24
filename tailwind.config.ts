import type { Config } from "tailwindcss";

// Design system: "Transit Ticket" — grounded in the actual product (booking
// passage from A to B). Cards throughout the app are styled like ticket
// stubs; colors draw from highway route signage and the taxi-yellow of
// Indian cabs, rather than a generic SaaS palette.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5EF", // ticket paper background
        ink: "#181614", // primary text
        route: {
          DEFAULT: "#1B4332", // deep highway-signage green — primary brand color
          dark: "#123024",
          light: "#2D6A4F",
        },
        marigold: {
          DEFAULT: "#F4A300", // taxi-yellow accent — used sparingly (signature element)
          dark: "#C98600",
        },
        line: "#D9D2C4", // hairline borders / perforation
        alert: "#B3261E",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        stub: "4px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
