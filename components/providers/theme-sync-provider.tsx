"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useThemeStore } from "@/lib/theme";
import { applyTheme } from "@/lib/theme/apply-theme";

/**
 * This component synchronizes our custom theme system with next-themes.
 * It listens for theme (light/dark) changes and re-applies the active
 * custom theme colors for the new mode.
 */
export function ThemeSyncProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const activeTheme = useThemeStore((state) => state.activeTheme);

  // Re-apply theme whenever the color mode changes
  useEffect(() => {
    if (activeTheme && resolvedTheme) {
      const mode = resolvedTheme === "dark" ? "dark" : "light";
      applyTheme(activeTheme, mode);
    }
  }, [resolvedTheme, activeTheme]);

  // Also listen for class changes on documentElement (for immediate response)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const isDark = document.documentElement.classList.contains("dark");
          const theme = useThemeStore.getState().activeTheme;
          if (theme) {
            applyTheme(theme, isDark ? "dark" : "light");
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
