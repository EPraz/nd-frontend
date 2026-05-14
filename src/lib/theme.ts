import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme,
} from "@react-navigation/native";

const LIGHT_COLORS = {
  background: "hsl(var(--bg-base))",
  text: "hsl(var(--text-main))",
  card: "hsl(var(--bg-surface))",
  border: "hsl(var(--border))",
  primary: "hsl(var(--accent))",
  notification: "hsl(var(--destructive))",
};

const DARK_COLORS = {
  background: "hsl(var(--bg-base))",
  text: "hsl(var(--text-main))",
  card: "hsl(var(--bg-surface))",
  border: "hsl(var(--border))",
  primary: "hsl(var(--accent))",
  notification: "hsl(var(--destructive))",
};

export const LIGHT_THEME: Theme = {
  ...NavigationDefaultTheme,
  colors: { ...NavigationDefaultTheme.colors, ...LIGHT_COLORS },
};

export const DARK_THEME: Theme = {
  ...NavigationDarkTheme,
  colors: { ...NavigationDarkTheme.colors, ...DARK_COLORS },
};
