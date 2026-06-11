import { describe, expect, test } from "vitest";
import { pickAppsToWarm } from "./warm";
import type { AppEntry } from "./apps";

const app = (key: string): AppEntry => ({
  key,
  name: key,
  description: "",
  url: `https://${key}.cgspectrum.com`,
});

describe("pickAppsToWarm", () => {
  test("warms every visible app except the current one", () => {
    const due = pickAppsToWarm([app("people"), app("finance"), app("sales")], "finance", {}, 1000);
    expect(due.map((a) => a.key)).toEqual(["people", "sales"]);
  });

  test("throttles: an app warmed within the TTL is not re-warmed", () => {
    const lastWarm: Record<string, number> = {};
    const first = pickAppsToWarm([app("people")], "x", lastWarm, 1000, 60_000);
    expect(first).toHaveLength(1);
    const second = pickAppsToWarm([app("people")], "x", lastWarm, 30_000, 60_000);
    expect(second).toHaveLength(0);
    const third = pickAppsToWarm([app("people")], "x", lastWarm, 61_001, 60_000);
    expect(third).toHaveLength(1);
  });

  test("records warm time per app, not globally", () => {
    const lastWarm: Record<string, number> = {};
    pickAppsToWarm([app("people")], "x", lastWarm, 1000, 60_000);
    const due = pickAppsToWarm([app("people"), app("sales")], "x", lastWarm, 2000, 60_000);
    expect(due.map((a) => a.key)).toEqual(["sales"]);
  });
});
