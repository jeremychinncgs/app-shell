"use client";
import { useEffect, useRef, useState } from "react";
import { applyTheme, type Theme } from "./theme";
import {
  avatarAriaLabel,
  initialsFor,
  signOutUrl,
  themeToggleAriaLabel,
  themeToggleLabel,
  type ProfileLink,
} from "./usermenu-logic";

export type { ProfileLink };

/**
 * UserMenu: the Header's profile dropdown.
 *
 * Trigger: the viewer's round profile photo (or an initials badge when no
 * photo is available or it fails to load), plus the chevron. The visible
 * email is gone from the trigger, the conventional pattern for this kind of
 * menu, but the trigger keeps an accessible name via aria-label since that
 * was the only thing making the button nameable to assistive tech.
 *
 * Dropdown contents, top to bottom:
 *  1. Signed-in name (if known) and email, non-interactive. This is now the
 *     only place identity is confirmable at a glance, which matters when
 *     someone is signed in as the wrong account.
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
  name,
  image,
  authHostUrl,
  profileLinks = [],
}: {
  email: string;
  name?: string | null;
  image?: string | null;
  authHostUrl: string;
  profileLinks?: ProfileLink[];
}) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initials = initialsFor(name, email);
  const showImage = !!image && !imageFailed;

  // Google's avatar URLs rotate and expire on session/token refresh: a
  // failed URL must not sour later, valid ones for the rest of this mount.
  // Without this, a stale URL A that 404s once would leave the badge stuck
  // on initials even after the session refreshes with a good URL B for the
  // same person, since imageFailed itself never clears on its own.
  useEffect(() => {
    setImageFailed(false);
  }, [image]);

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
        aria-label={avatarAriaLabel(name, email)}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded border border-border px-1.5 py-1 text-xs text-text-2 hover:border-accent hover:text-accent transition-colors"
      >
        {showImage ? (
          // 🔴 Plain <img>, deliberately not next/image: the photo lives on
          // lh3.googleusercontent.com, and next/image requires a
          // remotePatterns entry in EVERY consuming app's next.config before
          // it will render an external host. A plain <img> needs no config
          // anywhere. Do not "upgrade" this to next/image; it would break
          // the other 13 apps on this shell version until each one edited
          // its own config. referrerPolicy="no-referrer" because Google's
          // CDN can reject a request carrying a referrer from an
          // unexpected origin, and this menu renders on 14 different
          // hostnames.
          <img
            src={image!}
            alt=""
            width={28}
            height={28}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            // Arbitrary-pixel size classes, not h-7/w-7: this component
            // renders inside whichever app's DOM hosts the shell, and
            // Tailwind's rem-based scale resolves against THAT app's root
            // font-size, not a fixed 16px. people sets a 14px root font, so
            // h-7 (1.75rem) would render at 24.5px there, not the intended
            // 28px. Arbitrary-value classes compile to literal pixels and
            // stay correct regardless of the host's root size.
            className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent"
          >
            {initials}
          </span>
        )}
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
          <div className="truncate border-b border-border px-3 py-2 text-xs text-text-3">
            {name && (
              <div className="truncate text-sm font-medium text-text-2">{name}</div>
            )}
            {email}
          </div>

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
