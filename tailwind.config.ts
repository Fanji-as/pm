import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{css,scss}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#84B179",
          light: "#A2CB8B",
          lighter: "#C7EABB",
          dark: "#628141",
          darker: "#4A6332",
          50: "#F5F9F3",
          100: "#E8F5BD",
          200: "#C7EABB",
          300: "#A2CB8B",
          400: "#84B179",
          500: "#628141",
          600: "#4A6332",
          700: "#3A4E27",
          800: "#2A3A1D",
          900: "#1B211A",
        },
      },
    },
  },
  plugins: [],
};
export default config;
