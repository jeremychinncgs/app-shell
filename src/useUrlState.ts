"use client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // Use router[history]() — do NOT destructure replace/push into bare variables
    // or the router binding is lost.
    router[history](buildUrl(pathname, params), { scroll: false });
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
        router.replace(`${pathname}?${saved}`, { scroll: false });
      }
    } catch {
      // Ignore quota / security errors
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { state, setState };
}
