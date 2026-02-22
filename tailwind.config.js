const customTheme = require("./src/lib/customTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        popover: "hsl(var(--popover))",

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        muted: "hsl(var(--muted))",

        destructive: "hsl(var(--destructive))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",

        //
        baseBg: "hsl(var(--bg-base))",
        surface: "hsl(var(--bg-surface))",
        accent: "hsl(var(--accent))",
        textMain: "hsl(var(--text-main))",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
