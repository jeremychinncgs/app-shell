"use client";
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
 * current-page text. Plain <a> elements (framework-agnostic — no next/link dep);
 * a server component may still render this with serializable `items`.
 *
 * `onNavigate` (optional): when provided, link segments intercept ordinary
 * clicks and call it with the segment's href instead of doing a full-page
 * navigation — so a consumer can client-route (e.g. router.replace) for
 * filter-trail breadcrumbs. Modified clicks (cmd/ctrl/shift/alt, middle-button)
 * fall through to the native anchor so "open in new tab" still works. When
 * omitted, segments are plain links exactly as before (back-compatible).
 *
 * Classes use explicit var(--color-*) arbitrary values rather than the @theme
 * shorthands so the trail is pixel-identical to the hand-rolled breadcrumbs
 * it replaces (first consumer: salesapp page headers).
 */
export function Breadcrumb({
  items,
  onNavigate,
}: {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="flex items-baseline gap-3">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="text-[var(--color-text-3)]">/</span>}
          {segmentKind(item, i, items.length) === "link" ? (
            <a
              href={item.href}
              onClick={
                onNavigate && item.href
                  ? (e) => {
                      // Let modified clicks (new tab / new window / middle-click)
                      // use the native anchor; intercept only plain left-clicks.
                      if (
                        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
                        e.button === 1
                      ) {
                        return;
                      }
                      e.preventDefault();
                      onNavigate(item.href!);
                    }
                  : undefined
              }
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
