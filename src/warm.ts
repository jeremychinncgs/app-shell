import type { AppEntry } from "./apps";

// Launcher keep-warm: opening the menu signals an app switch a beat before the
// click, so we pre-fetch the visible apps then. All apps are same-site
// subdomains (.cgspectrum.com cookie), so a credentialed no-cors fetch warms
// the target's full authenticated render path, not just a login redirect.
// Pure selection logic lives here so the throttle is testable; the component
// fires the actual fetches.

export const WARM_TTL_MS = 60_000;

// Returns the app keys worth warming now and mutates `lastWarm` to record
// them. The current app is skipped (no navigation will go there) and each app
// is warmed at most once per TTL window, so toggling the menu can't hammer
// the estate.
export function pickAppsToWarm(
  apps: AppEntry[],
  currentApp: string,
  lastWarm: Record<string, number>,
  now: number,
  ttlMs: number = WARM_TTL_MS,
): AppEntry[] {
  const due: AppEntry[] = [];
  for (const a of apps) {
    if (a.key === currentApp) continue;
    const last = lastWarm[a.key];
    if (last !== undefined && now - last < ttlMs) continue;
    lastWarm[a.key] = now;
    due.push(a);
  }
  return due;
}
