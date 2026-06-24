import { describe, expect, test } from "vitest";
import {
  parseLastTabCookie,
  resolveLastTab,
  lastTabCookieString,
  LAST_TAB_COOKIE,
} from "./last-tab";

describe("parseLastTabCookie", () => {
  test("null, undefined, and empty string all return {}", () => {
    expect(parseLastTabCookie(null)).toEqual({});
    expect(parseLastTabCookie(undefined)).toEqual({});
    expect(parseLastTabCookie("")).toEqual({});
  });

  test("junk / non-JSON input returns {}", () => {
    expect(parseLastTabCookie("not-json")).toEqual({});
    expect(parseLastTabCookie("%ZZ")).toEqual({});
    expect(parseLastTabCookie("!!!")).toEqual({});
  });

  test("JSON array returns {} (must be a plain object)", () => {
    expect(parseLastTabCookie(encodeURIComponent(JSON.stringify(["/feedback"])))).toEqual({});
    expect(parseLastTabCookie(encodeURIComponent("[]"))).toEqual({});
  });

  test('"null" literal returns {}', () => {
    expect(parseLastTabCookie(encodeURIComponent("null"))).toEqual({});
  });

  test("valid map round-trips through URL encoding", () => {
    const map = { feedback: "/feedback/mentors", scheduling: "/scheduling/costs" };
    const encoded = encodeURIComponent(JSON.stringify(map));
    expect(parseLastTabCookie(encoded)).toEqual(map);
  });

  test("entries with non-string values are dropped", () => {
    const raw = encodeURIComponent(JSON.stringify({ a: "/ok", b: 42, c: null, d: true }));
    expect(parseLastTabCookie(raw)).toEqual({ a: "/ok" });
  });

  test("entries with empty-string values are dropped", () => {
    const raw = encodeURIComponent(JSON.stringify({ a: "/ok", b: "" }));
    expect(parseLastTabCookie(raw)).toEqual({ a: "/ok" });
  });

  test("tolerates already-decoded input (no double-decoding required)", () => {
    const map = { placements: "/placements/overview" };
    const decoded = JSON.stringify(map);
    expect(parseLastTabCookie(decoded)).toEqual(map);
  });
});

describe("resolveLastTab", () => {
  test("returns the href for a present section", () => {
    const map = { feedback: "/feedback/mentors" };
    const raw = encodeURIComponent(JSON.stringify(map));
    expect(resolveLastTab(raw, "feedback")).toBe("/feedback/mentors");
  });

  test("returns null for a missing section", () => {
    const map = { feedback: "/feedback/mentors" };
    const raw = encodeURIComponent(JSON.stringify(map));
    expect(resolveLastTab(raw, "scheduling")).toBeNull();
  });

  test("returns null when the cookie is junk", () => {
    expect(resolveLastTab("garbage", "feedback")).toBeNull();
  });

  test("returns null for null/undefined cookie", () => {
    expect(resolveLastTab(null, "feedback")).toBeNull();
    expect(resolveLastTab(undefined, "feedback")).toBeNull();
  });
});

describe("lastTabCookieString", () => {
  const map = { feedback: "/feedback/mentors", scheduling: "/scheduling/costs" };

  test("contains the cookie name and URL-encoded JSON value", () => {
    const c = lastTabCookieString(map, "localhost");
    expect(c).toContain(`${LAST_TAB_COOKIE}=`);
    expect(c).toContain(encodeURIComponent(JSON.stringify(map)));
  });

  test("estate hosts get the shared .cgspectrum.com domain and secure flag", () => {
    const c = lastTabCookieString(map, "academicops.cgspectrum.com");
    expect(c).toContain("domain=.cgspectrum.com");
    expect(c).toContain("secure");
  });

  test("localhost stays host-only (no domain attribute, no secure)", () => {
    const c = lastTabCookieString(map, "localhost");
    expect(c).not.toContain("domain=");
    expect(c).not.toContain("secure");
  });

  test("round-trip: parsing the encoded value back yields the original map", () => {
    const c = lastTabCookieString(map, "localhost");
    // Extract the value portion after the first `=`
    const match = c.match(/cgsi-last-tab=([^;]+)/);
    expect(match).not.toBeNull();
    const recovered = parseLastTabCookie(match![1]);
    expect(recovered).toEqual(map);
  });
});

// rememberTab is DOM-dependent; it is exercised by integration tests in the
// consuming apps. Unit test skipped here — the guard `typeof document ===
// "undefined"` makes it a no-op in the Node/Vitest environment.
