// Estate last-tab memory. When a user navigates to a sub-tab, the app writes
// their choice into a cookie scoped to .cgspectrum.com so that returning to
// any section in any app reopens the tab they were last on. One cookie holds
// all sections (keyed by section identifier, e.g. "feedback" or "scheduling");
// unlike the theme cookie, the value is a URL-encoded JSON object rather than
// a bare scalar. No cookie entry for a section → fall back to the default tab.

export const LAST_TAB_COOKIE = "cgsi-last-tab";

// Robustly decode and parse the raw cookie value. Returns a plain object whose
// values are all non-empty strings. Any parse failure → {}. Never throws.
export function parseLastTabCookie(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    // Tolerate both URL-encoded (the canonical form we write) and
    // already-decoded input (e.g. Next.js cookie helpers that pre-decode).
    let parsed: unknown;
    try {
      parsed = JSON.parse(decodeURIComponent(raw));
    } catch {
      parsed = JSON.parse(raw);
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const map = parsed as Record<string, unknown>;
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(map)) {
      if (typeof v === "string" && v.length > 0) result[k] = v;
    }
    return result;
  } catch {
    return {};
  }
}

// Return the remembered href for a section, or null if absent / cookie junk.
export function resolveLastTab(raw: string | null | undefined, section: string): string | null {
  const map = parseLastTabCookie(raw);
  const value = map[section];
  return typeof value === "string" && value.length > 0 ? value : null;
}

// Cookie string for a last-tab map. Domain-scoped to the estate in production;
// host-only on localhost (a .cgspectrum.com domain attribute would be rejected).
export function lastTabCookieString(map: Record<string, string>, hostname: string): string {
  const base = `${LAST_TAB_COOKIE}=${encodeURIComponent(JSON.stringify(map))}; path=/; max-age=31536000; samesite=lax`;
  return hostname.endsWith("cgspectrum.com") ? `${base}; domain=.cgspectrum.com; secure` : base;
}

// Client-side writer: remember the tab a user just navigated to for a given
// section. Safe to import anywhere — SSR-guarded by the document check.
export function rememberTab(section: string, href: string): void {
  if (typeof document === "undefined") return;
  const raw = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${LAST_TAB_COOKIE}=`))
    ?.slice(LAST_TAB_COOKIE.length + 1) ?? null;
  const map = parseLastTabCookie(raw);
  map[section] = href;
  document.cookie = lastTabCookieString(map, location.hostname);
}
