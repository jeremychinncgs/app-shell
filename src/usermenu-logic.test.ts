import { describe, expect, test } from "vitest";
import {
  anyLinkIncomplete,
  avatarAriaLabel,
  initialsFor,
  signOutUrl,
  themeToggleAriaLabel,
  themeToggleLabel,
  type ProfileLink,
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
  test("email with no local part does not throw and returns empty", () => {
    expect(initialsFor(undefined, "@example.com")).toBe("");
  });
  test("whitespace-only name AND whitespace-only email do not throw", () => {
    expect(initialsFor("   ", "   ")).toBe("");
  });
  test("three-or-more-word name uses first and last only (re-confirms above)", () => {
    expect(initialsFor("Mary Jane Watson Parker", "mjwp@cgspectrum.com")).toBe("MP");
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
  test("hasIncomplete defaults to false: unchanged label", () => {
    expect(avatarAriaLabel("Jeremy Chinn", "jeremychinn@cgspectrum.com")).toBe(
      "User menu for Jeremy Chinn",
    );
  });
  test("hasIncomplete true appends the incomplete state to the name case", () => {
    expect(avatarAriaLabel("Jeremy Chinn", "jeremychinn@cgspectrum.com", true)).toBe(
      "User menu for Jeremy Chinn, profile incomplete",
    );
  });
  test("hasIncomplete true appends the incomplete state to the email fallback", () => {
    expect(avatarAriaLabel(undefined, "jeremychinn@cgspectrum.com", true)).toBe(
      "User menu for jeremychinn@cgspectrum.com, profile incomplete",
    );
  });
  test("hasIncomplete true appends the incomplete state to the generic fallback", () => {
    expect(avatarAriaLabel(null, "", true)).toBe("User menu, profile incomplete");
  });
  test("hasIncomplete false is identical to omitting the argument", () => {
    expect(avatarAriaLabel("Jeremy Chinn", "jeremychinn@cgspectrum.com", false)).toBe(
      avatarAriaLabel("Jeremy Chinn", "jeremychinn@cgspectrum.com"),
    );
  });
});

describe("anyLinkIncomplete", () => {
  test("no links at all: false", () => {
    expect(anyLinkIncomplete([])).toBe(false);
  });
  test("links with no incomplete field at all (the 13-app case): false", () => {
    const links: ProfileLink[] = [
      { label: "Profile", href: "https://people.cgspectrum.com/me" },
      { label: "Availability", href: "https://people.cgspectrum.com/me/availability" },
    ];
    expect(anyLinkIncomplete(links)).toBe(false);
  });
  test("links explicitly marked incomplete: false, not incomplete: false", () => {
    const links: ProfileLink[] = [
      { label: "Profile", href: "/me", incomplete: false },
      { label: "Availability", href: "/me/availability", incomplete: false },
    ];
    expect(anyLinkIncomplete(links)).toBe(false);
  });
  test("some links incomplete: true", () => {
    const links: ProfileLink[] = [
      { label: "Profile", href: "/me", incomplete: true },
      { label: "Availability", href: "/me/availability", incomplete: false },
    ];
    expect(anyLinkIncomplete(links)).toBe(true);
  });
  test("all links incomplete: true", () => {
    const links: ProfileLink[] = [
      { label: "Profile", href: "/me", incomplete: true },
      { label: "Availability", href: "/me/availability", incomplete: true },
    ];
    expect(anyLinkIncomplete(links)).toBe(true);
  });
  test("a mix of no field at all and one explicitly incomplete: true", () => {
    const links: ProfileLink[] = [
      { label: "Profile", href: "/me" },
      { label: "Availability", href: "/me/availability", incomplete: true },
    ];
    expect(anyLinkIncomplete(links)).toBe(true);
  });
});
