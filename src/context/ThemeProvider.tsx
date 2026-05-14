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
const DEFAULT_THEME: Theme = "dark";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [hasHydratedTheme, setHasHydratedTheme] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getThemeStore(THEME_KEY);
      setThemeState(
        saved === "dark" || saved === "light" ? saved : DEFAULT_THEME,
      );
      setHasHydratedTheme(true);
    })();
  }, []);

  useEffect(() => {
    setColorScheme(theme);
    if (!hasHydratedTheme) return;

    void setThemeStore(THEME_KEY, theme);
  }, [hasHydratedTheme, setColorScheme, theme]);

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
