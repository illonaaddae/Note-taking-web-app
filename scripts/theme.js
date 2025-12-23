/**
 * Theme Module
 * Handles color theme and font theme switching with localStorage persistence
 */

import { savePreferences, loadPreferences } from "./storage.js";

/**
 * Available themes
 */
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

/**
 * Available fonts
 */
export const FONTS = {
  SANS_SERIF: "sans-serif",
  SERIF: "serif",
  MONOSPACE: "monospace",
};

/**
 * Get the system's preferred color scheme
 * @returns {string} - "light" or "dark"
 */
function getSystemTheme() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return THEMES.DARK;
  }
  return THEMES.LIGHT;
}

/**
 * Apply color theme to the document
 * @param {string} theme - "light", "dark", or "system"
 */
export function applyTheme(theme) {
  let effectiveTheme = theme;

  // If system theme, detect the actual preference
  if (theme === THEMES.SYSTEM) {
    effectiveTheme = getSystemTheme();
  }

  // Apply theme to document
  document.documentElement.setAttribute("data-theme", effectiveTheme);

  // Save preference (save the user's choice, not the effective theme)
  savePreferences({ theme });

  console.log(`Theme applied: ${theme} (effective: ${effectiveTheme})`);
}

/**
 * Apply font theme to the document
 * @param {string} font - "sans-serif", "serif", or "monospace"
 */
export function applyFont(font) {
  document.documentElement.setAttribute("data-font", font);
  savePreferences({ font });
  console.log(`Font applied: ${font}`);
}

/**
 * Get current theme preference
 * @returns {string} - Current theme
 */
export function getCurrentTheme() {
  const prefs = loadPreferences();
  return prefs.theme || THEMES.LIGHT;
}

/**
 * Get current font preference
 * @returns {string} - Current font
 */
export function getCurrentFont() {
  const prefs = loadPreferences();
  return prefs.font || FONTS.SANS_SERIF;
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
  applyTheme(newTheme);
}

/**
 * Initialize theme based on saved preferences
 * Also sets up listener for system theme changes
 */
export function initTheme() {
  const prefs = loadPreferences();
  const savedTheme = prefs.theme || THEMES.LIGHT;
  const savedFont = prefs.font || FONTS.SANS_SERIF;

  // Apply saved theme
  applyTheme(savedTheme);

  // Apply saved font
  applyFont(savedFont);

  // Listen for system theme changes (for "system" preference)
  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        const currentTheme = getCurrentTheme();
        if (currentTheme === THEMES.SYSTEM) {
          // Re-apply system theme to pick up the change
          applyTheme(THEMES.SYSTEM);
        }
      });
  }

  console.log("Theme initialized:", { theme: savedTheme, font: savedFont });
}
