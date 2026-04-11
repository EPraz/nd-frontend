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
        authCanvas: "hsl(var(--auth-canvas))",
        authShell: "hsl(var(--auth-shell))",
        authPanel: "hsl(var(--auth-panel))",
        authPanelSoft: "hsl(var(--auth-panel-soft))",
        authField: "hsl(var(--auth-field))",
        authLine: "hsl(var(--auth-line))",
        authCopy: "hsl(var(--auth-copy))",
        authCopyMuted: "hsl(var(--auth-copy-muted))",
        authCopySubtle: "hsl(var(--auth-copy-subtle))",
        authHighlight: "hsl(var(--auth-highlight))",
        authBadge: "hsl(var(--auth-badge))",
        authBadgeBorder: "hsl(var(--auth-badge-border))",
        authGlow: "hsl(var(--auth-glow))",
        authSoft: "hsl(var(--auth-soft))",
        shellCanvas: "hsl(var(--shell-canvas))",
        shellPanel: "hsl(var(--shell-panel))",
        shellPanelSoft: "hsl(var(--shell-panel-soft))",
        shellGlass: "hsl(var(--shell-glass))",
        shellLine: "hsl(var(--shell-line))",
        shellSoft: "hsl(var(--shell-soft))",
        shellChrome: "hsl(var(--shell-chrome))",
        shellChromeSoft: "hsl(var(--shell-chrome-soft))",
        shellCardHover: "hsl(var(--shell-card-hover))",
        shellBadge: "hsl(var(--shell-badge))",
        shellBadgeBorder: "hsl(var(--shell-badge-border))",
        shellHighlight: "hsl(var(--shell-highlight))",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
