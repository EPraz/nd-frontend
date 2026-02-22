import { useColorScheme } from "nativewind";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getThemeStore, setThemeStore } from "../helpers";

type Theme = "dark" | "light";
type ThemeCtx = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);
const THEME_KEY = "nd_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    (async () => {
      const saved = await getThemeStore(THEME_KEY);
      if (saved === "dark" || saved === "light") setThemeState(saved);
    })();
  }, []);

  useEffect(() => {
    setColorScheme(theme);
    void setThemeStore(THEME_KEY, theme);
  }, [setColorScheme, theme]);

  const api = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () =>
        setThemeState((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
