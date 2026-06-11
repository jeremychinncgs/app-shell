import { describe, expect, test } from "vitest";
import { resolveTheme, themeCookieString } from "./theme";

describe("resolveTheme", () => {
  test("explicit cookie wins over OS preference", () => {
    expect(resolveTheme("light", false)).toBe("light");
    expect(resolveTheme("dark", true)).toBe("dark");
  });
  test("no cookie → OS preference", () => {
    expect(resolveTheme(null, true)).toBe("light");
    expect(resolveTheme(undefined, false)).toBe("dark");
  });
  test("junk cookie falls through to OS preference", () => {
    expect(resolveTheme("disco", true)).toBe("light");
    expect(resolveTheme("", false)).toBe("dark");
  });
});

describe("themeCookieString", () => {
  test("estate hosts get the shared .cgspectrum.com domain", () => {
    const c = themeCookieString("light", "people.cgspectrum.com");
    expect(c).toContain("cgsi-theme=light");
    expect(c).toContain("domain=.cgspectrum.com");
    expect(c).toContain("secure");
  });
  test("localhost stays host-only (domain attribute would be rejected)", () => {
    const c = themeCookieString("dark", "localhost");
    expect(c).not.toContain("domain=");
    expect(c).not.toContain("secure");
  });
});
