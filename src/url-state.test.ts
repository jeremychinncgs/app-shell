import { describe, expect, test } from "vitest";
import { buildUrl } from "./url-state";

describe("buildUrl", () => {
  test("empty params returns pathname unchanged (no trailing '?')", () => {
    expect(buildUrl("/x", new URLSearchParams())).toBe("/x");
  });

  test("with params returns pathname + query string", () => {
    expect(buildUrl("/x", new URLSearchParams({ a: "1", b: "2" }))).toBe("/x?a=1&b=2");
  });

  test("params with special chars are URL-encoded by URLSearchParams", () => {
    expect(buildUrl("/x", new URLSearchParams({ q: "a b" }))).toBe("/x?q=a+b");
  });
});
