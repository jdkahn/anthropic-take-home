import { describe, expect, it } from "vitest";
import tasklane from "./tasklane.json";

// The Python generator asserts the traps; this guards the contract the app relies on.
describe("tasklane.json", () => {
  it("has 24 months × 2 devices × 2 plans of metrics", () => {
    expect(tasklane.metrics).toHaveLength(96);
    expect(tasklane.dashboard).toHaveLength(24);
  });

  it("dashboard totals equal the sum of the metrics rows", () => {
    for (const day of tasklane.dashboard) {
      const rows = tasklane.metrics.filter((r) => r.month === day.month);
      expect(rows).toHaveLength(4);
      expect(rows.reduce((n, r) => n + r.active_users, 0)).toBe(day.active_users);
      expect(rows.reduce((n, r) => n + r.new_signups, 0)).toBe(day.new_signups);
    }
  });

  it("names the two files the UI shows (D84)", () => {
    expect(tasklane.files).toEqual(["tasklane_metrics.csv", "tasklane_events.csv"]);
  });
});
