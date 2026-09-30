import { describe, expect, it } from "vitest";
import august from "@/fixtures/rounds/august-rung1.json";
import type { Turn } from "./conversation";
import type { ClozeRound } from "./round";
import { initialRound, type RoundState } from "./round-reducer";
import { nextRung, rungChange, rungMap, rungNote, type FirstAttempt, type Rung } from "./staircase";

describe("nextRung (D20, D50)", () => {
  it.each([
    [1, "correct", 2],
    [2, "correct", 3],
    [3, "correct", 3], // clamped
    [3, "weakWhy", 2], // a sound answer with an unsound why is still a miss
    [2, "wrong", 1],
    [1, "wrong", 1], // clamped
    [2, "revealed", 1], // Reveal counts as a miss
  ] as const)("rung %i + %s → %i", (seen, result, next) => {
    expect(nextRung(seen, result)).toBe(next);
  });
});

// A turn Claude answered with a cloze on `concept` at `rung`, and what the learner did on attempt 1.
function turn(concept: string, rung: Rung, firstAttempt: FirstAttempt | null): Turn {
  const round = { ...august, concept, rung } as ClozeRound;
  const cloze = { round, options: round.options, order: [0, 1, 2, 3], draft: { pick: null, answer: "", why: "" }, attempt: 1, lastGrade: null };
  const state: RoundState = firstAttempt === "revealed" ? { status: "revealed", ...cloze } : { status: "answering", error: null, ...cloze };
  return { id: 0, question: "q", attached: true, reply: "{}", firstAttempt, round: state };
}

describe("rungMap (D113)", () => {
  const S = "seasonality_vs_trend";
  const A = "averages_hiding_segments";

  it("is empty for a new conversation: every concept starts at rung 1", () => {
    expect(rungMap([])).toEqual({});
  });

  it("climbs the golden path: August correct → 2, summer correct → 3 (D36)", () => {
    expect(rungMap([turn(S, 1, "correct")])).toEqual({ [S]: 2 });
    expect(rungMap([turn(S, 1, "correct"), turn(S, 2, "correct")])).toEqual({ [S]: 3 });
  });

  it("drops a concept back to rung 1 out of the sparse map (D66)", () => {
    expect(rungMap([turn(S, 1, "correct"), turn(S, 2, "revealed")])).toEqual({});
  });

  it("tracks each concept on its own (D21)", () => {
    expect(rungMap([turn(S, 1, "correct"), turn(A, 1, "wrong"), turn(A, 1, "correct")])).toEqual({ [S]: 2, [A]: 2 });
  });

  it("builds on the rung the learner saw, not the one requested (D67)", () => {
    // Map asked for rung 2 after August; Claude rendered rung 1 anyway, and the learner got it right.
    expect(rungMap([turn(S, 1, "correct"), turn(S, 1, "correct")])).toEqual({ [S]: 2 });
  });

  it("ignores rounds with no attempt-1 result: unanswered, plain, still streaming", () => {
    const plain: Turn = { id: 1, question: "q", attached: true, reply: "hi", firstAttempt: null, round: { status: "plain", text: "hi", reason: null } };
    const streaming: Turn = { ...plain, round: initialRound };
    expect(rungMap([turn(S, 1, "correct"), turn(S, 2, null), plain, streaming])).toEqual({ [S]: 2 });
  });
});

describe("rungChange + rungNote (D33)", () => {
  const S = "seasonality_vs_trend";
  const A = "averages_hiding_segments";

  it("has no note for a concept seen for the first time", () => {
    expect(rungChange([turn(S, 1, null)], 0)).toBeNull();
    expect(rungChange([turn(S, 1, "correct"), turn(A, 1, null)], 1)).toBeNull();
  });

  it("compares with the last earlier round on the same concept, skipping others", () => {
    const turns = [turn(S, 1, "correct"), turn(A, 1, "wrong"), turn(S, 2, null)];
    expect(rungChange(turns, 2)).toEqual({ from: 1, to: 2 });
  });

  it("has no note when the format didn't change (e.g. Claude kept rung 1 despite the map)", () => {
    expect(rungChange([turn(S, 1, "correct"), turn(S, 1, null)], 1)).toBeNull();
  });

  it("notes a step down too", () => {
    expect(rungChange([turn(S, 2, "revealed"), turn(S, 1, null)], 1)).toEqual({ from: 2, to: 1 });
  });

  it("uses the Rung2.dc.html copy for 1 → 2, and one line for every other change", () => {
    expect(rungNote({ from: 1, to: 2 })).toBe("Your turn to write it: you’ve got the multiple-choice version down.");
    for (const change of [{ from: 2, to: 3 }, { from: 3, to: 2 }, { from: 2, to: 1 }] as const) {
      expect(rungNote(change)).toMatch(/^[^\n]+\.$/);
    }
  });
});
