import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme,
} from "@react-navigation/native";

const LIGHT_COLORS = {
  background: "hsl(var(--background))",
  text: "hsl(var(--foreground))",
  card: "hsl(var(--card))",
  border: "hsl(var(--border))",
  primary: "hsl(var(--primary))",
  notification: "hsl(var(--destructive))",
};

const DARK_COLORS = {
  background: "hsl(var(--background))",
  text: "hsl(var(--foreground))",
  card: "hsl(var(--card))",
  border: "hsl(var(--border))",
  primary: "hsl(var(--primary))",
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
