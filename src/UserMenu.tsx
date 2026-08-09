"use client";
import { useEffect, useRef, useState } from "react";
import { applyTheme, type Theme } from "./theme";
import { signOutUrl, themeToggleAriaLabel, themeToggleLabel, type ProfileLink } from "./usermenu-logic";

export type { ProfileLink };

/**
 * UserMenu: the Header's profile dropdown.
 *
 * Contents, top to bottom:
 *  1. Signed-in email, non-interactive.
 *  2. `profileLinks`, in the order given (nothing rendered when absent/empty).
 *     A future "Dashboard" entry slots in above these without restructuring.
 *  3. Theme toggle, as a text item labelled with the ACTION it performs.
 *  4. Sign out.
 *
 * 🔴 The shell stays dumb about which links a viewer should see. It renders
 * exactly what it's handed and never invents a link itself. This is
 * deliberate: /me is open to all staff but /me/availability is gated to a
 * handful of people, so a link the shell invented would 404 for everyone
 * else. Consumer apps own the gating logic (see e.g. people's
 * src/lib/profile/gates.ts) and decide what goes in `profileLinks`; the
 * shell just obeys.
 */
export function UserMenu({
  email,
  authHostUrl,
  profileLinks = [],
}: {
  email: string;
  authHostUrl: string;
  profileLinks?: ProfileLink[];
}) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // The server can't know the active theme (it's resolved pre-paint from
  // cookie/OS by THEME_INIT_SCRIPT), so the toggle's label renders only
  // after mount, same pattern as the standalone ThemeToggle.
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  // Close on outside click or Escape while open.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function signOut() {
    if (typeof window === "undefined") return;
    window.location.href = signOutUrl(authHostUrl, window.location.href);
  }

  function toggleTheme() {
    if (!theme) return;
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
    setOpen(false);
  }

  const itemClass =
    "block w-full px-3 py-2 text-left text-sm text-text-2 hover:bg-accent/10 hover:text-accent transition-colors";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-text-2 hover:border-accent hover:text-accent transition-colors"
      >
        <span className="max-w-[10rem] truncate">{email}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-full z-50 mt-1 w-56 rounded border border-border bg-surface py-1 shadow-lg"
        >
          <div className="truncate border-b border-border px-3 py-2 text-xs text-text-3">{email}</div>

          {/* A future "Dashboard" entry belongs here, above profileLinks,
              rendered the same way, no restructuring needed. */}
          {profileLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              {link.label}
            </a>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={toggleTheme}
            aria-label={themeToggleAriaLabel(theme)}
            className={itemClass}
          >
            {themeToggleLabel(theme)}
          </button>

          <button type="button" role="menuitem" onClick={signOut} className={itemClass}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
