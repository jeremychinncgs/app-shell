import { describe, expect, test } from "vitest";
import { signOutUrl, themeToggleAriaLabel, themeToggleLabel } from "./usermenu-logic";

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
  test("dark theme names the destination: Light mode", () => {
    expect(themeToggleLabel("dark")).toBe("Light mode");
  });
  test("light theme names the destination: Dark mode", () => {
    expect(themeToggleLabel("light")).toBe("Dark mode");
  });
  test("unresolved (pre-mount) theme renders no label yet", () => {
    expect(themeToggleLabel(null)).toBe("");
  });
});

describe("themeToggleAriaLabel", () => {
  test("dark theme: full phrasing, switch to light", () => {
    expect(themeToggleAriaLabel("dark")).toBe("Switch to light mode");
  });
  test("light theme: full phrasing, switch to dark", () => {
    expect(themeToggleAriaLabel("light")).toBe("Switch to dark mode");
  });
  test("unresolved (pre-mount) theme has no aria-label yet", () => {
    expect(themeToggleAriaLabel(null)).toBe("");
  });
});
