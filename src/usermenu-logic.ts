// Pure logic behind UserMenu, extracted for direct unit testing (package
// tests are logic-only, no DOM rendering; there is no jsdom here).

import type { Theme } from "./theme";

/**
 * A single profile-menu entry a consuming app hands the shell to render.
 *
 * `incomplete` is optional and defaults to falsy everywhere it's read: 13 of
 * the 14 consuming apps build their `profileLinks` array against an older
 * shell version and pass no such field at all, and none of them may break by
 * upgrading past this one. Only a link that explicitly sets it `true` gets
 * the incomplete dot; absence and `false` render identically (no dot).
 */
export interface ProfileLink {
  label: string;
  href: string;
  incomplete?: boolean;
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
 * Theme-toggle menu label. Names the mode a click switches TO, not the
 * current one, since the visible menu item is short by design: the viewer
 * can already see which mode they're in, so the destination alone is
 * unambiguous ("Light mode" while dark, "Dark mode" while light).
 *
 * theme is null before mount (the server can't know the active theme; it
 * resolves from document.documentElement.dataset.theme post-mount). Returns
 * "" in that window; the caller reserves the row's height regardless, so
 * there's no layout shift once it resolves.
 */
export function themeToggleLabel(theme: Theme | null): string {
  if (theme === "dark") return "Light mode";
  if (theme === "light") return "Dark mode";
  return "";
}

/**
 * Theme-toggle aria-label. Kept as the full "Switch to X mode" phrasing even
 * though the visible label is shortened to just the destination: a screen
 * reader user doesn't have the visual context (seeing which mode is
 * currently active) that makes the short label unambiguous, so the
 * accessible name spells out the action instead of just naming a mode.
 */
export function themeToggleAriaLabel(theme: Theme | null): string {
  if (theme === "dark") return "Switch to light mode";
  if (theme === "light") return "Switch to dark mode";
  return "";
}

/**
 * Initials for the trigger's fallback badge, shown when there is no profile
 * image (or it fails to load). Prefers `name` ("Jeremy Chinn" -> "JC", a
 * single word "Jeremy" -> "J"); falls back to the local part of `email`
 * ("jeremychinn@cgspectrum.com" -> "J") when name is absent or blank.
 * Never throws on empty strings or odd whitespace: worst case is "".
 */
export function initialsFor(name: string | null | undefined, email: string): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    // Spread to an array of code points rather than indexing with [0]:
    // string indexing takes a single UTF-16 code unit, which would split a
    // surrogate pair for any name outside the BMP. Every realistic CGSI name
    // is in the BMP, so this is a theoretical edge today, but the spread
    // costs nothing and this renders on every page of all 14 apps.
    const first = [...words[0]!][0] ?? "";
    const last = words.length > 1 ? ([...words[words.length - 1]!][0] ?? "") : "";
    return (first + last).toUpperCase();
  }
  const local = (email ?? "").split("@")[0]?.trim() ?? "";
  return local.length > 0 ? ([...local][0] ?? "").toUpperCase() : "";
}

/**
 * Accessible name for the avatar trigger button, replacing the email text
 * that used to be visible on the button itself. Names the person when
 * possible; falls back to the email so the button always has an accessible
 * name, and finally to a generic label if somehow neither is available.
 *
 * `hasIncomplete` folds the corner dot's meaning into this same label rather
 * than relying on a second, separately-discoverable piece of text: the dot
 * sits on the one control every viewer already looks at (the avatar), so its
 * accessible name is the only place a screen reader user would think to
 * check for it. A bare coloured dot with no text counterpart here would be
 * invisible to assistive tech and to anyone who cannot distinguish colour —
 * exactly the discoverability gap that replacing the theme icon with text
 * was fixing elsewhere in this component.
 */
export function avatarAriaLabel(
  name: string | null | undefined,
  email: string,
  hasIncomplete = false,
): string {
  const trimmedName = (name ?? "").trim();
  const base =
    trimmedName.length > 0
      ? `User menu for ${trimmedName}`
      : (email ?? "").trim().length > 0
        ? `User menu for ${(email ?? "").trim()}`
        : "User menu";
  return hasIncomplete ? `${base}, profile incomplete` : base;
}

/**
 * Whether ANY supplied profile link still needs attention. Drives the
 * avatar-trigger corner dot: without a trigger-level marker, a viewer would
 * have no reason to ever open the menu and discover that Profile or
 * Availability needs filling in, the same discoverability gap the trigger's
 * accessible name already exists to close.
 *
 * Pure and pessimism-free: an absent `incomplete` field (the 13-app case, and
 * every link built before this shell version) reads as "not incomplete",
 * never as "unknown, assume incomplete". A consuming app that has not yet
 * opted in gets no dot, not a false one.
 */
export function anyLinkIncomplete(links: readonly ProfileLink[]): boolean {
  return links.some((link) => link.incomplete === true);
}
