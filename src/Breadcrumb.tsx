import { Fragment } from "react";
import {
  type BreadcrumbItem,
  segmentKind,
  isCurrentPage,
} from "./breadcrumb-logic";

/**
 * Breadcrumb — shared hierarchical page trail.
 *
 * Any number of segments; two-level is just the simple case. Items with an
 * href render as links, the last item (or any item without href) renders as
 * current-page text. Pure presentational and server-component-safe: no
 * "use client", no hooks, plain <a> elements (same framework-agnostic call
 * as SubNav — no next/link dep).
 *
 * Classes use explicit var(--color-*) arbitrary values rather than the @theme
 * shorthands so the trail is pixel-identical to the hand-rolled breadcrumbs
 * it replaces (first consumer: salesapp page headers).
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="flex items-baseline gap-3">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="text-[var(--color-text-3)]">/</span>}
          {segmentKind(item, i, items.length) === "link" ? (
            <a
              href={item.href}
              className="text-sm text-[var(--color-text-3)] hover:text-[var(--color-text)]"
            >
              {item.label}
            </a>
          ) : (
            <span
              aria-current={isCurrentPage(i, items.length) ? "page" : undefined}
              className="text-sm font-semibold text-[var(--color-text)]"
            >
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
