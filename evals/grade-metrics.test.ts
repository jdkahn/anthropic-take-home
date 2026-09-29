import { describe, expect, it } from "vitest";
import { decide, flipped, itemAgrees, majority, percentile, runAgrees, type Label, type Vote } from "./grade-metrics";

const r1: Label = { answer_sound: null, why_sound: true }; // rung 1: only why is judged
const r2: Label = { answer_sound: true, why_sound: false }; // rungs 2–3: both judged
const v = (why_sound: boolean, answer_sound: boolean | null = null): Vote => ({ answer_sound, why_sound });

describe("majority", () => {
  it("needs 2 of 3", () => {
    expect(majority([true, true, false])).toBe(true);
    expect(majority([false, true, false])).toBe(false);
    expect(majority([true, false, undefined])).toBeNull(); // an invalid run can leave no majority
  });
});

describe("itemAgrees (D92)", () => {
  it("rung 1 judges only why_sound; answer_sound votes are ignored", () => {
    expect(itemAgrees(r1, [v(true), v(true), v(false)])).toBe(true);
    expect(itemAgrees(r1, [v(true, true), v(true, false), v(true)])).toBe(true);
  });

  it("rungs 2–3 need both booleans to match", () => {
    expect(itemAgrees(r2, [v(false, true), v(false, true), v(true, true)])).toBe(true);
    expect(itemAgrees(r2, [v(false, false), v(false, false), v(false, true)])).toBe(false);
  });

  it("invalid runs cast no vote, so two invalids sink the item", () => {
    expect(itemAgrees(r1, [v(true), null, null])).toBe(false);
    expect(itemAgrees(r1, [v(true), v(true), null])).toBe(true);
  });
});

describe("diagnostics", () => {
  it("runAgrees scores one run; invalid never agrees", () => {
    expect(runAgrees(r2, v(false, true))).toBe(true);
    expect(runAgrees(r2, v(true, true))).toBe(false);
    expect(runAgrees(r2, null)).toBe(false);
  });

  it("flipped flags runs that disagree with each other, ignoring unjudged fields", () => {
    expect(flipped(r1, [v(true, true), v(true, false), v(true)])).toBe(false);
    expect(flipped(r1, [v(true), v(false), v(true)])).toBe(true);
    expect(flipped(r1, [v(true), v(true), null])).toBe(true);
  });

  it("percentile uses nearest rank", () => {
    expect(percentile([5, 1, 3, 2, 4], 50)).toBe(3);
    expect(percentile([1, 2, 3, 4], 50)).toBe(2);
    expect(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 90)).toBe(9);
  });
});

describe("decide (D71)", () => {
  it("picks the fastest model that passes quality and speed", () => {
    expect(decide([
      { model: "sonnet", agreement: 10, p50Ms: 2500 },
      { model: "opus", agreement: 11, p50Ms: 2900 },
    ]).pick).toBe("sonnet");
  });

  it("drops a model more than 1 item behind the best, even if fast", () => {
    expect(decide([
      { model: "sonnet", agreement: 10, p50Ms: 1000 },
      { model: "opus", agreement: 12, p50Ms: 2900 },
    ]).pick).toBe("opus");
  });

  it("none pass quality → no pick, fix the rubric", () => {
    expect(decide([
      { model: "sonnet", agreement: 9, p50Ms: 1000 },
      { model: "opus", agreement: 9, p50Ms: 2000 },
    ])).toEqual({ pick: null, reason: "No model passes quality: fix the rubric (D71)." });
  });

  it("none pass speed → fastest that passes quality", () => {
    const d = decide([
      { model: "sonnet", agreement: 11, p50Ms: 4200 },
      { model: "opus", agreement: 11, p50Ms: 9000 },
    ]);
    expect(d.pick).toBe("sonnet");
    expect(d.reason).toMatch(/No model meets p50/);
  });
});
