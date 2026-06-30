"use client";
import { useEffect } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from "next/navigation";
import { buildUrl } from "./url-state";

export interface UrlStateCodec<T> {
  /** Derive state from the current URL params. Must be total (defaults for missing/invalid). */
  parse: (params: ReadonlyURLSearchParams) => T;
  /** Serialise state to params; omit params at their defaults for clean URLs. */
  serialize: (state: T) => URLSearchParams;
  /** True when params carry NONE of this view's keys → eligible for the localStorage restore.
   *  Default: no params at all (`params.toString() === ""`). */
  isBare?: (params: ReadonlyURLSearchParams) => boolean;
  /** localStorage key enabling the "open where you left off" restore + write-through. Omit to disable. */
  storageKey?: string;
  /** Write the URL via the native History API (history.replaceState/pushState)
   *  instead of router.replace/push. The URL still updates (shareable) and
   *  useSearchParams stays in sync (Next 14.1+), but the change does NOT trigger a
   *  navigation / server-component re-render. Use for `force-dynamic` pages that
   *  ship a large dataset once and filter CLIENT-side, where a router write would
   *  needlessly re-stream the whole RSC payload on every change. Leave false
   *  (default) for ordinary pages where a navigation re-render is cheap. */
  shallow?: boolean;
}

export interface UrlState<T> {
  state: T;
  /** Reflect `next` into the URL. history "replace" (default, no history entry) or "push". */
  setState: (next: T, history?: "replace" | "push") => void;
}

export function useUrlState<T>(codec: UrlStateCodec<T>): UrlState<T> {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL is the single source of truth — derive state each render, no useState.
  const state = codec.parse(searchParams);

  const setState = (next: T, history: "replace" | "push" = "replace"): void => {
    const params = codec.serialize(next);
    const url = buildUrl(pathname, params);
    if (codec.shallow) {
      // History API: update the URL without a navigation / server re-render.
      // useSearchParams stays in sync (Next 14.1+), so state still flows.
      if (history === "push") window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
    } else {
      // Use router[history]() — do NOT destructure replace/push into bare variables
      // or the router binding is lost.
      router[history](url, { scroll: false });
    }
    if (codec.storageKey) {
      try {
        localStorage.setItem(codec.storageKey, params.toString());
      } catch {
        // Ignore quota / security errors
      }
    }
  };

  // One-shot mount restore: if the URL is bare and localStorage has a prior
  // state, navigate to it so users re-open where they left off. Deps are
  // intentionally [] — adding searchParams or router would cause this effect
  // to re-run after its own router.replace(), creating an infinite loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!codec.storageKey) return;
    const bare = codec.isBare ? codec.isBare(searchParams) : searchParams.toString() === "";
    if (!bare) return; // Deep links win; never override an explicit URL
    try {
      const saved = localStorage.getItem(codec.storageKey);
      if (saved) {
        const url = `${pathname}?${saved}`;
        if (codec.shallow) window.history.replaceState(null, "", url);
        else router.replace(url, { scroll: false });
      }
    } catch {
      // Ignore quota / security errors
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { state, setState };
}
