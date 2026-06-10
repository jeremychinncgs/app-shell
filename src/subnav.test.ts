import { describe, it, expect } from "vitest";
import { isActiveTab } from "./SubNav";

describe("isActiveTab", () => {
  it("exact match is active", () => {
    expect(isActiveTab("/overview", "/overview")).toBe(true);
  });

  it("exact match with trailing segment is not active for non-prefix case", () => {
    // "/overview" does NOT match "/overview/detail" because startsWith would
    // catch it — but that's desired behaviour for non-root hrefs
    expect(isActiveTab("/overview", "/overview/detail")).toBe(true);
  });

  it("prefix match is active for non-root href", () => {
    expect(isActiveTab("/scheduling", "/scheduling/cost")).toBe(true);
  });

  it("root href '/' is active ONLY on exact '/'", () => {
    expect(isActiveTab("/", "/")).toBe(true);
    expect(isActiveTab("/", "/dashboard")).toBe(false);
    expect(isActiveTab("/", "/mentors")).toBe(false);
  });

  it("'/mentors' is not active on '/'", () => {
    expect(isActiveTab("/mentors", "/")).toBe(false);
  });

  it("inactive when path is completely different", () => {
    expect(isActiveTab("/overview", "/viability")).toBe(false);
  });

  it("inactive when href is a prefix of a different segment", () => {
    // '/schedule' should NOT match '/scheduling'
    expect(isActiveTab("/schedule", "/scheduling")).toBe(false);
  });

  it("active on exact match regardless of root rule", () => {
    expect(isActiveTab("/cost", "/cost")).toBe(true);
  });
});
