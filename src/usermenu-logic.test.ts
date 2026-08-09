import { describe, expect, test } from "vitest";
import { signOutUrl, themeToggleLabel } from "./usermenu-logic";

describe("signOutUrl", () => {
  test("builds the auth-host signout URL with an encoded callback", () => {
    expect(signOutUrl("https://auth.cgspectrum.com", "https://people.cgspectrum.com/me")).toBe(
      "https://auth.cgspectrum.com/signout?callbackUrl=https%3A%2F%2Fpeople.cgspectrum.com%2Fme",
    );
  });
  test("encodes query strings and fragments in the callback", () => {
    const href = "https://people.cgspectrum.com/roster?tab=all&x=1#top";
    const url = signOutUrl("https://auth.cgspectrum.com", href);
    expect(url).toBe(`https://auth.cgspectrum.com/signout?callbackUrl=${encodeURIComponent(href)}`);
  });
});

describe("themeToggleLabel", () => {
  test("dark theme offers to switch to light", () => {
    expect(themeToggleLabel("dark")).toBe("Switch to light mode");
  });
  test("light theme offers to switch to dark", () => {
    expect(themeToggleLabel("light")).toBe("Switch to dark mode");
  });
  test("unresolved (pre-mount) theme renders no label yet", () => {
    expect(themeToggleLabel(null)).toBe("");
  });
});
