// Pure logic behind UserMenu — extracted for direct unit testing (package
// tests are logic-only, no DOM rendering; there is no jsdom here).

import type { Theme } from "./theme";

/** A single profile-menu entry a consuming app hands the shell to render. */
export interface ProfileLink {
  label: string;
  href: string;
}

/**
 * Global sign-out target. Navigates to the auth host, which clears the
 * shared .cgspectrum.com cookie (logging the user out of every app), then
 * bounces back to wherever they were.
 */
export function signOutUrl(authHostUrl: string, currentHref: string): string {
  return `${authHostUrl}/signout?callbackUrl=${encodeURIComponent(currentHref)}`;
}

/**
 * Theme-toggle menu label — describes the ACTION the click performs, not the
 * current state, so it flips the moment the user clicks it.
 *
 * theme is null before mount (the server can't know the active theme; it
 * resolves from document.documentElement.dataset.theme post-mount). Returns
 * "" in that window — the caller reserves the row's height regardless, so
 * there's no layout shift once it resolves.
 */
export function themeToggleLabel(theme: Theme | null): string {
  if (theme === "dark") return "Switch to light mode";
  if (theme === "light") return "Switch to dark mode";
  return "";
}
