"use client";

// Global sign-out: navigates to the auth host, which clears the shared
// .cgspectrum.com cookie (logged out of every app) then bounces back here.
export function UserMenu({ email, authHostUrl }: { email: string; authHostUrl: string }) {
  function signOut() {
    const callbackUrl = encodeURIComponent(window.location.href);
    window.location.href = `${authHostUrl}/signout?callbackUrl=${callbackUrl}`;
  }
  return (
    <div className="flex items-center gap-3">
      {email && <span className="hidden text-xs text-text-3 sm:inline">{email}</span>}
      <button
        type="button"
        onClick={signOut}
        className="rounded border border-border px-2 py-1 text-xs text-text-2 hover:border-accent hover:text-accent transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
