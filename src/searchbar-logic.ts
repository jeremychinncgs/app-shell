// Pure logic helpers for the SearchBar component — extracted for unit testing
// without needing a DOM environment.

export type SearchResultApp = "people" | "product" | "partnerships";

export type SearchResult = {
  app: SearchResultApp;
  type: "mentor" | "course" | "subject" | "partner";
  title: string;
  subtitle?: string;
  href: string;
};

/** The stable display order for app group headers. */
export const APP_GROUP_ORDER: SearchResultApp[] = ["people", "product", "partnerships"];

/** App → human-readable group header label. */
export const APP_LABELS: Record<SearchResultApp, string> = {
  people: "People",
  product: "Product",
  partnerships: "Partnerships",
};

/**
 * Floor apps: always visible regardless of whether the user has a grant key.
 * "product" and "people" are surfaced for all logged-in users.
 */
const FLOOR_APPS: ReadonlySet<SearchResultApp> = new Set<SearchResultApp>(["product", "people"]);

/**
 * Filter results to only those the user is allowed to open.
 * Floor apps (product + people) are always visible.
 * All other apps require the user to hold the matching grant key.
 */
export function visibleResults(
  results: SearchResult[],
  userApps: string[],
): SearchResult[] {
  const granted = new Set(userApps);
  return results.filter((r) => FLOOR_APPS.has(r.app) || granted.has(r.app));
}

/**
 * Group results by app, preserving the canonical order:
 * People → Product → Partnerships.
 * Apps with no matching results are omitted from the output.
 */
export function groupByApp(
  results: SearchResult[],
): Array<{ app: SearchResultApp; label: string; results: SearchResult[] }> {
  const byApp = new Map<SearchResultApp, SearchResult[]>();
  for (const r of results) {
    if (!byApp.has(r.app)) byApp.set(r.app, []);
    byApp.get(r.app)!.push(r);
  }
  return APP_GROUP_ORDER
    .filter((app) => byApp.has(app))
    .map((app) => ({ app, label: APP_LABELS[app], results: byApp.get(app)! }));
}
