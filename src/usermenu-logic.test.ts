import { describe, expect, test } from "vitest";
import {
  avatarAriaLabel,
  initialsFor,
  signOutUrl,
  themeToggleAriaLabel,
  themeToggleLabel,
} from "./usermenu-logic";

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

describe("initialsFor", () => {
  test("two-word name gives first and last initial", () => {
    expect(initialsFor("Jeremy Chinn", "jeremychinn@cgspectrum.com")).toBe("JC");
  });
  test("three-word name uses first and last, not middle", () => {
    expect(initialsFor("Jeremy Allen Chinn", "jeremychinn@cgspectrum.com")).toBe("JC");
  });
  test("single-word name gives just that initial", () => {
    expect(initialsFor("Jeremy", "jeremychinn@cgspectrum.com")).toBe("J");
  });
  test("no name falls back to the local part of the email", () => {
    expect(initialsFor(undefined, "jeremychinn@cgspectrum.com")).toBe("J");
  });
  test("null name falls back to the local part of the email", () => {
    expect(initialsFor(null, "jeremychinn@cgspectrum.com")).toBe("J");
  });
  test("blank name falls back to the email", () => {
    expect(initialsFor("   ", "jeremychinn@cgspectrum.com")).toBe("J");
  });
  test("name with irregular whitespace is still parsed", () => {
    expect(initialsFor("  Jeremy   Chinn  ", "jeremychinn@cgspectrum.com")).toBe("JC");
  });
  test("empty name and empty email do not throw and return empty", () => {
    expect(initialsFor("", "")).toBe("");
  });
  test("lowercase name is upper-cased", () => {
    expect(initialsFor("jeremy chinn", "jeremychinn@cgspectrum.com")).toBe("JC");
  });
});

describe("avatarAriaLabel", () => {
  test("uses the name when available", () => {
    expect(avatarAriaLabel("Jeremy Chinn", "jeremychinn@cgspectrum.com")).toBe(
      "User menu for Jeremy Chinn",
    );
  });
  test("falls back to the email when name is absent", () => {
    expect(avatarAriaLabel(undefined, "jeremychinn@cgspectrum.com")).toBe(
      "User menu for jeremychinn@cgspectrum.com",
    );
  });
  test("falls back to the email when name is blank", () => {
    expect(avatarAriaLabel("   ", "jeremychinn@cgspectrum.com")).toBe(
      "User menu for jeremychinn@cgspectrum.com",
    );
  });
  test("falls back to a generic label when neither is available", () => {
    expect(avatarAriaLabel(null, "")).toBe("User menu");
  });
});
