import { describe, it, expect } from "vitest";
import { APPS, visibleApps } from "./apps";

describe("visibleApps", () => {
  it("staff (product only) sees just Product", () => {
    expect(visibleApps(APPS, ["product"], "product").map((a) => a.key)).toEqual(["product"]);
  });

  it("leadership sees four, not cms", () => {
    expect(
      visibleApps(APPS, ["product", "audit", "scheduling", "sales"], "audit").map((a) => a.key),
    ).toEqual(["product", "audit", "scheduling", "sales"]);
  });

  it("admin sees all five", () => {
    expect(
      visibleApps(APPS, ["product", "audit", "scheduling", "sales", "cms"], "cms").map((a) => a.key),
    ).toEqual(["product", "audit", "scheduling", "sales", "cms"]);
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

  it("people app is in the catalog before audit", () => {
    const keys = APPS.map((a) => a.key);
    expect(keys).toContain("people");
    expect(keys.indexOf("people")).toBeLessThan(keys.indexOf("audit"));
  });
});
