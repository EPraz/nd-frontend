const hsl = (token) => `hsl(var(${token}))`;
const hslAlpha = (token) => `hsl(var(${token}) / <alpha-value>)`;
const hslFixedAlpha = (token, alpha) => `hsl(var(${token}) / ${alpha})`;

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
      opacity: {
        8: "0.08",
        12: "0.12",
        14: "0.14",
        15: "0.15",
        18: "0.18",
        35: "0.35",
        45: "0.45",
      },
      colors: {
        popover: hslAlpha("--popover"),

        border: hslAlpha("--border"),
        input: hslAlpha("--input"),
        ring: hslAlpha("--ring"),

        muted: hslAlpha("--muted"),

        destructive: hslAlpha("--destructive"),
        success: hslAlpha("--success"),
        warning: hslAlpha("--warning"),
        info: hslAlpha("--info"),

        baseBg: hslAlpha("--bg-base"),
        surface: hslAlpha("--bg-surface"),
        accent: hslAlpha("--accent"),
        textMain: hslAlpha("--text-main"),

        softAccent: hslFixedAlpha("--accent", "0.14"),
        softDestructive: hslFixedAlpha("--destructive", "0.12"),

        authCanvas: hslAlpha("--auth-canvas"),
        authShell: hsl("--auth-shell"),
        authPanel: hslAlpha("--auth-panel"),
        authPanelSoft: hsl("--auth-panel-soft"),
        authField: hsl("--auth-field"),
        authLine: hslAlpha("--auth-line"),
        authCopy: hslAlpha("--auth-copy"),
        authCopyMuted: hslAlpha("--auth-copy-muted"),
        authCopySubtle: hslAlpha("--auth-copy-subtle"),
        authHighlight: hslAlpha("--auth-highlight"),
        authBadge: hsl("--auth-badge"),
        authBadgeBorder: hsl("--auth-badge-border"),
        authGlow: hslAlpha("--auth-glow"),
        authSoft: hslAlpha("--auth-soft"),

        shellCanvas: hslAlpha("--shell-canvas"),
        shellPanel: hsl("--shell-panel"),
        shellPanelSoft: hsl("--shell-panel-soft"),
        shellGlass: hsl("--shell-glass"),
        shellLine: hsl("--shell-line"),
        shellSoft: hslAlpha("--shell-soft"),
        shellChrome: hsl("--shell-chrome"),
        shellChromeSoft: hsl("--shell-chrome-soft"),
        shellCardHover: hsl("--shell-card-hover"),
        shellBadge: hsl("--shell-badge"),
        shellBadgeBorder: hsl("--shell-badge-border"),
        shellHighlight: hslAlpha("--shell-highlight"),
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
