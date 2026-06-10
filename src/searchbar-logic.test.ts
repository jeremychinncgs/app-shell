import { describe, it, expect } from "vitest";
import { visibleResults, groupByApp, APP_GROUP_ORDER } from "./searchbar-logic";
import type { SearchResult } from "./searchbar-logic";

const peopleResult: SearchResult = {
  app: "people",
  type: "mentor",
  title: "Alice Smith",
  href: "https://people.cgspectrum.com/mentors",
};

const productResult: SearchResult = {
  app: "product",
  type: "course",
  title: "3D Animation Diploma",
  href: "https://catalog.cgspectrum.com",
};

const partnershipsResult: SearchResult = {
  app: "partnerships",
  type: "partner",
  title: "Studio Ghibli Academy",
  href: "https://partnerships.cgspectrum.com",
};

// ---- visibleResults ---------------------------------------------------------

describe("visibleResults", () => {
  it("floor app 'product' is always visible regardless of userApps", () => {
    const results = visibleResults([productResult], []);
    expect(results).toContain(productResult);
  });

  it("floor app 'people' is always visible regardless of userApps", () => {
    const results = visibleResults([peopleResult], []);
    expect(results).toContain(peopleResult);
  });

  it("non-floor app 'partnerships' is hidden when user lacks the grant", () => {
    const results = visibleResults([partnershipsResult], ["product"]);
    expect(results).not.toContain(partnershipsResult);
  });

  it("non-floor app 'partnerships' is visible when user has the grant", () => {
    const results = visibleResults([partnershipsResult], ["product", "partnerships"]);
    expect(results).toContain(partnershipsResult);
  });

  it("mixed list: floor results always visible, non-floor filtered", () => {
    const all = [peopleResult, productResult, partnershipsResult];
    const results = visibleResults(all, ["product"]);
    expect(results).toContain(peopleResult);
    expect(results).toContain(productResult);
    expect(results).not.toContain(partnershipsResult);
  });

  it("user with all grants sees all results", () => {
    const all = [peopleResult, productResult, partnershipsResult];
    const results = visibleResults(all, ["product", "people", "partnerships"]);
    expect(results).toHaveLength(3);
  });

  it("empty results produce empty output regardless of grants", () => {
    expect(visibleResults([], ["product", "partnerships"])).toEqual([]);
  });
});

// ---- groupByApp -------------------------------------------------------------

describe("groupByApp", () => {
  it("groups by app into canonical order People → Product → Partnerships", () => {
    const grouped = groupByApp([partnershipsResult, productResult, peopleResult]);
    const order = grouped.map((g) => g.app);
    expect(order).toEqual(["people", "product", "partnerships"]);
  });

  it("omits apps with no results", () => {
    const grouped = groupByApp([productResult]);
    expect(grouped.map((g) => g.app)).toEqual(["product"]);
  });

  it("each group carries the human-readable label", () => {
    const grouped = groupByApp([peopleResult, productResult, partnershipsResult]);
    const labels = grouped.map((g) => g.label);
    expect(labels).toEqual(["People", "Product", "Partnerships"]);
  });

  it("preserves all results within each group", () => {
    const secondProduct: SearchResult = {
      app: "product",
      type: "subject",
      title: "Rigging Fundamentals",
      href: "https://catalog.cgspectrum.com",
    };
    const grouped = groupByApp([productResult, secondProduct]);
    const productGroup = grouped.find((g) => g.app === "product");
    expect(productGroup?.results).toHaveLength(2);
  });

  it("empty input produces empty output", () => {
    expect(groupByApp([])).toEqual([]);
  });

  it("APP_GROUP_ORDER is People → Product → Partnerships", () => {
    expect(APP_GROUP_ORDER).toEqual(["people", "product", "partnerships"]);
  });
});
