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
// Department split in progress (dept-split spec 2026-06-10): People shipped;
// Finance/Marketing/Partnerships/AcademicOps land as their phases ship.
export const APPS: AppEntry[] = [
  { key: "product", name: "Product", url: "https://catalog.cgspectrum.com", description: "Course catalogue, org & policy" },
  { key: "people", name: "People", url: "https://people.cgspectrum.com", description: "Org chart & mentor directory" },
  { key: "marketing", name: "Marketing", url: "https://marketing.cgspectrum.com", description: "Testimonials & brand" },
  { key: "sales", name: "Sales", url: "https://sales.cgspectrum.com", description: "Funnel & cohort operations" },
  { key: "leadership", name: "Leadership", url: "https://leadership.cgspectrum.com", description: "Conversion rally dashboard: lead→enrolment, CAC, referrals" },
  { key: "scheduling", name: "Academic Ops", url: "https://academicops.cgspectrum.com", description: "Scheduling, accreditation & policy" },
  { key: "finance", name: "Finance", url: "https://finance.cgspectrum.com", description: "Cohort & financial dashboards" },
  { key: "partnerships", name: "Partnerships", url: "https://partnerships.cgspectrum.com", description: "Partner programs & industry" },
  { key: "cms", name: "Media", url: "https://cms.cgspectrum.com", description: "Media library (in development)" },
  { key: "audit", name: "Audits", url: "https://audit.cgspectrum.com", description: "Cypher audit remediation" },
  { key: "governance", name: "Governance", url: "https://governance.cgspectrum.com", description: "TEQSA self-assurance registers & compliance" },
  { key: "admin", name: "Admin", url: "https://auth.cgspectrum.com/admin", description: "Manage app access" },
];

// Apps the user may open: those granted, plus the current app (you're in it).
// Order follows the canonical APPS order.
export function visibleApps(catalog: AppEntry[], userApps: string[], currentApp: string): AppEntry[] {
  const allowed = new Set(userApps);
  return catalog.filter((a) => allowed.has(a.key) || a.key === currentApp);
}

// The admin-page entry for admin-grant holders, else null. Drives the header's
// far-right Admin shortcut so admins reach the grants/roles page from any app.
export function adminEntryFor(userApps: string[]): AppEntry | null {
  if (!userApps.includes("admin")) return null;
  return APPS.find((a) => a.key === "admin") ?? null;
}
