"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("vitality-theme") as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (isDark: boolean) => {
      const targetTheme = isDark ? "dark" : "light";
      setResolvedTheme(targetTheme);

      root.classList.remove("light", "dark");
      root.classList.add(targetTheme);

      root.style.setProperty(
        "--background",
        isDark ? "#0F172A" : "#F8FAFC"
      );
      root.style.setProperty(
        "--foreground",
        isDark ? "#F8FAFC" : "#0F172A"
      );
      root.style.setProperty(
        "--surface",
        isDark ? "#1E293B" : "#FFFFFF"
      );
      root.style.setProperty(
        "--surface-hover",
        isDark ? "#334155" : "#F1F5F9"
      );
      root.style.setProperty(
        "--border",
        isDark ? "#334155" : "#E2E8F0"
      );
      root.style.setProperty(
        "--muted",
        isDark ? "#64748B" : "#64748B"
      );
      root.style.setProperty(
        "--muted-foreground",
        isDark ? "#94A3B8" : "#475569"
      );

      const glassBg = isDark
        ? "rgba(30, 41, 59, 0.7)"
        : "rgba(255, 255, 255, 0.8)";
      const glassBorder = isDark
        ? "rgba(51, 65, 85, 0.5)"
        : "rgba(226, 232, 240, 0.8)";

      root.style.setProperty("--glass-background", glassBg);
      root.style.setProperty("--glass-border", glassBorder);
    };

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      applyTheme(theme === "dark");
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("vitality-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}