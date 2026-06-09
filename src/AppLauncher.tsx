"use client";
import { useState } from "react";
import { visibleApps, type AppEntry } from "./apps";

export function AppLauncher({
  catalog,
  userApps,
  currentApp,
}: {
  catalog: AppEntry[];
  userApps: string[];
  currentApp: string;
}) {
  const [open, setOpen] = useState(false);
  const apps = visibleApps(catalog, userApps, currentApp);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Switch app"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center rounded px-2 py-1 text-text-3 hover:text-accent transition-colors"
      >
        <span className="grid grid-cols-3 gap-0.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="h-1 w-1 rounded-full bg-current" />
          ))}
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute left-0 z-50 mt-2 w-72 rounded-lg border border-border bg-surface-2 p-2 shadow-xl">
            {apps.map((a) => {
              const isCurrent = a.key === currentApp;
              return (
                <a
                  key={a.key}
                  href={a.url}
                  className={`block rounded px-3 py-2 transition-colors ${
                    isCurrent
                      ? "bg-accent-soft text-text"
                      : "text-text-2 hover:bg-surface hover:text-text"
                  }`}
                >
                  <span className="block text-sm font-bold">{a.name}</span>
                  <span className="block text-xs text-text-3">{a.description}</span>
                </a>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
