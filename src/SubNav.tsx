"use client";

/**
 * SubNav — shared left-justified section tab row.
 *
 * Sits flush under the Header's bottom border. Consumers supply tabs and
 * currentPath (from their own usePathname() or router). No next/link dep —
 * renders plain <a> elements so the component stays framework-agnostic.
 *
 * Active state: accent underline + accent text.
 * Inactive state: muted text, hover → primary text.
 *
 * Visual reference: courseapp viewer-tab row (bg-surface, border-border,
 * border-accent, text-text-2, text-accent). Implemented with shared @theme
 * Tailwind tokens every consuming app already defines.
 */

export interface SubNavTab {
  href: string;
  label: string;
}

/**
 * Pure active-state helper — exported for direct unit testing.
 *
 * Rules:
 *  - root href "/" → active ONLY on exact "/"
 *  - any other href → active on exact match OR when currentPath starts with href
 *    followed by "/" (prevents "/schedule" matching "/scheduling")
 */
export function isActiveTab(href: string, currentPath: string): boolean {
  if (href === "/") {
    return currentPath === "/";
  }
  if (currentPath === href) return true;
  // Prefix match — require the next character to be "/" so segments don't bleed
  return currentPath.startsWith(href + "/");
}

export function SubNav({
  tabs,
  currentPath,
}: {
  tabs: SubNavTab[];
  currentPath: string;
}) {
  return (
    <nav
      className="w-full bg-surface border-b border-border"
      aria-label="Section navigation"
    >
      <div className="flex items-end gap-1 px-6">
        {tabs.map((tab) => {
          const active = isActiveTab(tab.href, currentPath);
          return (
            <a
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={[
                "inline-block px-3 py-2.5 text-sm font-semibold transition-colors duration-100",
                "border-b-2 -mb-px", // sits on the nav's bottom border
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-text-2 hover:text-text hover:border-border",
              ].join(" ")}
            >
              {tab.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
