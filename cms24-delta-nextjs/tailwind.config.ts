import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'green-dark': '#006907',
        'green-mid': '#309E0E',
        'background-gray': '#252525',
        background: "var(--background)",
        foreground: "var(--foreground)",
        darkgreen: {
          800: '#006400'
        },
        lightgreen: {
          300: '#98FB98'
        },
        sky: {
          950: '#082f49'
        },
      },
    },
  },
  plugins: [],
};
export default config;
