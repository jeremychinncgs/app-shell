// Pure URL utility — no react/next imports. Safe to use in any environment.

/** Join a pathname and query params into a URL. Empty params → bare pathname (no trailing "?"). */
export function buildUrl(pathname: string, params: URLSearchParams): string {
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
