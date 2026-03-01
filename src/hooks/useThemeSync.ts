import { useEffect } from "react";
import type { Theme } from "@/types/settings";

type ResolvedTheme = "light" | "dark" | "deep-dark";

/**
 * Syncs applied theme with OS preference when theme is "system".
 * Only subscribes to prefers-color-scheme when there is no user override
 * (i.e. theme === "system"); otherwise applies the chosen theme once.
 */
export function useThemeSync(
  theme: Theme,
  applyResolvedTheme: (resolved: ResolvedTheme) => void
): void {
  useEffect(() => {
    if (theme === "dark") {
      applyResolvedTheme("dark");
      return;
    }
    if (theme === "light") {
      applyResolvedTheme("light");
      return;
    }
    if (theme === "deep-dark") {
      applyResolvedTheme("deep-dark");
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () => (mediaQuery.matches ? "dark" : "light");
    applyResolvedTheme(resolve());
    const handleChange = () => applyResolvedTheme(resolve());
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyResolvedTheme]);
}
