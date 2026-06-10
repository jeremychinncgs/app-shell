export type AppEntry = {
  key: string;
  name: string;
  url: string;
  description: string;
  icon?: string;
};

export type ShellUser = {
  email: string;
  apps: string[];
};

// Canonical CGSI app catalog. `key` matches the grant keys the auth host embeds
// in the session token. Adding an app here (+ a grant-matrix row in the auth
// host) is the only change needed to surface a new app in every launcher.
// (Future: courseapp/"Product" splits into HR + Partnerships — purely additive.)
export const APPS: AppEntry[] = [
  { key: "product", name: "Product", url: "https://catalog.cgspectrum.com", description: "Course catalogue, org & policy" },
  { key: "people", name: "People", url: "https://people.cgspectrum.com", description: "Org chart & mentor directory" },
  { key: "audit", name: "Course Audits", url: "https://audit.cgspectrum.com", description: "Cypher audit remediation" },
  { key: "scheduling", name: "Scheduling", url: "https://scheduling.cgspectrum.com", description: "Class viability & teaching cost" },
  { key: "sales", name: "Sales", url: "https://sales.cgspectrum.com", description: "Funnel & cohort operations" },
  { key: "cms", name: "Media", url: "https://cms.cgspectrum.com", description: "Media library (in development)" },
  { key: "admin", name: "Admin", url: "https://auth.cgspectrum.com/admin", description: "Manage app access" },
];

// Apps the user may open: those granted, plus the current app (you're in it).
// Order follows the canonical APPS order.
export function visibleApps(catalog: AppEntry[], userApps: string[], currentApp: string): AppEntry[] {
  const allowed = new Set(userApps);
  return catalog.filter((a) => allowed.has(a.key) || a.key === currentApp);
}
