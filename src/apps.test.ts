import { describe, it, expect } from "vitest";
import { APPS, visibleApps, adminEntryFor } from "./apps";

describe("visibleApps", () => {
  it("staff (product only) sees just Product", () => {
    expect(visibleApps(APPS, ["product"], "product").map((a) => a.key)).toEqual(["product"]);
  });

  it("leadership sees four, not cms", () => {
    expect(
      visibleApps(APPS, ["product", "audit", "scheduling", "sales"], "audit").map((a) => a.key),
    ).toEqual(["product", "sales", "scheduling", "audit"]);
  });

  it("admin sees all five", () => {
    expect(
      visibleApps(APPS, ["product", "audit", "scheduling", "sales", "cms"], "cms").map((a) => a.key),
    ).toEqual(["product", "sales", "scheduling", "cms", "audit"]);
  });

  it("always includes the current app even when not granted", () => {
    expect(visibleApps(APPS, ["product"], "audit").map((a) => a.key)).toEqual(["product", "audit"]);
  });

  it("ignores unknown grant keys", () => {
    expect(visibleApps(APPS, ["product", "bogus"], "product").map((a) => a.key)).toEqual(["product"]);
  });

  it("user with no grants still sees the current app", () => {
    expect(visibleApps(APPS, [], "audit").map((a) => a.key)).toEqual(["audit"]);
  });

  it("shows the admin entry only when granted", () => {
    expect(visibleApps(APPS, ["product"], "product").map((a) => a.key)).not.toContain("admin");
    expect(visibleApps(APPS, ["product", "admin"], "product").map((a) => a.key)).toContain("admin");
  });

  it("APPS canonical order", () => {
    expect(APPS.map((a) => a.key)).toEqual([
      "product", "people", "marketing", "sales", "scheduling", "finance", "partnerships", "cms", "audit", "governance", "admin",
    ]);
  });

  it("adminEntryFor returns the admin entry only for admin-grant holders", () => {
    expect(adminEntryFor(["product", "people"])).toBeNull();
    expect(adminEntryFor(["product", "admin"])?.key).toBe("admin");
    expect(adminEntryFor(["product", "admin"])?.url).toContain("/admin");
  });

  it("scheduling entry has name Academic Ops and academicops URL (key unchanged)", () => {
    const entry = APPS.find((a) => a.key === "scheduling");
    expect(entry).toBeDefined();
    expect(entry?.name).toBe("Academic Ops");
    expect(entry?.url).toBe("https://academicops.cgspectrum.com");
  });
});
