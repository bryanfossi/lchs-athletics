"use client";

import { useEffect } from "react";

/**
 * Reads the saved `theme` from /api/settings and applies it site-wide by
 * setting a `data-theme` attribute on <html> plus CSS custom properties for
 * the school's primary/secondary colours.  Rendered once in the root layout.
 */
export function ThemeApplicator() {
  useEffect(() => {
    const apply = async () => {
      try {
        const res = await fetch("/api/settings");
        const result = await res.json();
        if (!result.success || !result.data) return;

        const {
          theme = "light",
          primaryColor = "#581C87",
          secondaryColor = "#FBBF24",
        } = result.data;

        const root = document.documentElement;
        root.dataset.theme = theme;
        root.style.setProperty("--school-primary", primaryColor);
        root.style.setProperty("--school-secondary", secondaryColor);
      } catch {
        // Fail silently — default light theme remains active
      }
    };
    apply();
  }, []);

  return null;
}
