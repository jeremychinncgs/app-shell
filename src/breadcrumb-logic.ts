/**
 * Pure decisions behind the Breadcrumb component — exported for direct unit
 * testing (package tests are logic-only, no DOM rendering).
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type SegmentKind = "link" | "current";

/**
 * How a breadcrumb segment renders.
 *
 * Rules:
 *  - the LAST item is always current-page text, even if an href was supplied
 *    (you don't link to the page you're on)
 *  - any earlier item WITHOUT an href renders as plain current-style text
 *  - everything else (earlier item with href) renders as a link
 */
export function segmentKind(
  item: BreadcrumbItem,
  index: number,
  total: number
): SegmentKind {
  if (index === total - 1) return "current";
  return item.href !== undefined ? "link" : "current";
}

/** aria-current="page" goes on the final segment only. */
export function isCurrentPage(index: number, total: number): boolean {
  return index === total - 1;
}
