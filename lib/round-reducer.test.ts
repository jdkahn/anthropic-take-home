import { describe, expect, it } from "vitest";
import { chunkText, fixtureText } from "./fixtures";
import type { Grade } from "./grade";
import {
  canCheck,
  initialRound,
  pickCorrect,
  roundReducer,
  type RoundAction,
  type RoundState,
} from "./round-reducer";
import { shuffledOrder } from "./shuffle";

const AUGUST = "Summarize August for the leadership update"; // rung 1
const SUMMER = "How does this summer compare to last summer?"; // rung 2

const run = (state: RoundState, ...actions: RoundAction[]) => actions.reduce(roundReducer, state);

// Stream a fixture in real chunk sizes, then end it with a fixed option order.
function streamed(message: string, order = [2, 0, 3, 1]): RoundState {
  const chunks = chunkText(fixtureText(message)).map((text): RoundAction => ({ type: "chunk", text }));
  return run(initialRound, ...chunks, { type: "streamEnd", order });
}

const grade: Grade = {
  assessment: "Cites the matching dip last August.",
  answer_sound: null,
  why_sound: true,
  mistake: null,
  feedback: "You matched this August against last August.",
  gap: null,
  corrective_prompt: null,
};

describe("shuffledOrder (Fisher–Yates)", () => {
  it("reaches each of the 24 orders of 4 by exactly one path", () => {
    const seen = new Set<string>();
    for (const j3 of [0, 1, 2, 3]) {
      for (const j2 of [0, 1, 2]) {
        for (const j1 of [0, 1]) {
          // random() values that make Math.floor(r * (i + 1)) land on j at i = 3, 2, 1.
          const rs = [(j3 + 0.5) / 4, (j2 + 0.5) / 3, (j1 + 0.5) / 2];
          seen.add(shuffledOrder(4, () => rs.shift()!).join(""));
        }
      }
    }
    expect(seen.size).toBe(24);
  });
});

describe("roundReducer: streaming", () => {
  it("keeps the last good preview when a prefix can't be repaired (D99)", () => {
    const s1 = run(initialRound, { type: "chunk", text: '{"significant":true,"goal":"Tell' });
    const s2 = run(s1, { type: "chunk", text: '","domain"' }); // dangling key → no repair
    expect(s2.status === "streaming" && s2.preview?.goal).toBe("Tell");
  });

  it("ends a valid round in answering, options in the dispatched order", () => {
    const s = streamed(AUGUST, [2, 0, 3, 1]);
    if (s.status !== "answering") throw new Error(s.status);
    expect(s.options).toEqual([2, 0, 3, 1].map((i) => s.round.options[i]));
    expect(s.draft).toEqual({ pick: null, answer: "", why: "" });
  });

  it.each([
    ["/plain", null],
    ["/truncated", "invalid JSON"],
    ["/empty", "invalid JSON"],
  ])("ends %s as a plain answer (%s)", (message, reason) => {
    expect(streamed(message)).toMatchObject({ status: "plain", reason });
  });

  it("ignores answering actions while streaming", () => {
    for (const action of [{ type: "reveal" }, { type: "check" }, { type: "pick", pick: 0 }] as RoundAction[]) {
      expect(roundReducer(initialRound, action)).toBe(initialRound);
    }
  });
});

describe("roundReducer: rung 1 golden path", () => {
  it("pick → why → check → graded", () => {
    const answering = streamed(AUGUST);
    const correct = answering.status === "answering" ? answering.options.findIndex((o) => o.mistake === null) : -1;
    const ready = run(answering, { type: "pick", pick: correct }, { type: "editWhy", text: "Last August fell too." });
    expect(canCheck(ready)).toBe(true);

    const grading = run(ready, { type: "check" });
    expect(grading.status).toBe("grading");
    const graded = run(grading, { type: "gradeDone", grade });
    expect(graded).toMatchObject({ status: "graded", grade });
    if (graded.status === "graded") expect(pickCorrect(graded)).toBe(true);
  });

  it("can't check without a pick and a why; own words also needs the answer", () => {
    const s = streamed(AUGUST);
    expect(canCheck(run(s, { type: "editWhy", text: "because" }))).toBe(false);
    expect(canCheck(run(s, { type: "pick", pick: 0 }, { type: "editWhy", text: "  " }))).toBe(false);
    const own = run(s, { type: "pick", pick: "own" }, { type: "editWhy", text: "because" });
    expect(canCheck(own)).toBe(false);
    expect(canCheck(run(own, { type: "editAnswer", text: "It's seasonal" }))).toBe(true);
    expect(run(s, { type: "check" })).toBe(s); // not ready → no-op
  });

  it("marks a wrong pick and an own-words pick for the staircase", () => {
    const s = streamed(AUGUST);
    if (s.status !== "answering") throw new Error(s.status);
    const wrong = s.options.findIndex((o) => o.mistake !== null);
    expect(pickCorrect(run(s, { type: "pick", pick: wrong }) as typeof s)).toBe(false);
    expect(pickCorrect(run(s, { type: "pick", pick: "own" }) as typeof s)).toBeNull();
  });
});

describe("roundReducer: rungs 2–3", () => {
  it("checks on the answer box alone", () => {
    const s = streamed(SUMMER);
    expect(s.status === "answering" && s.round.rung).toBe(2);
    expect(canCheck(s)).toBe(false);
    expect(canCheck(run(s, { type: "editAnswer", text: "Seasonal, up 36% on last summer" }))).toBe(true);
  });
});

describe("roundReducer: reveal and failures", () => {
  const ready = () => run(streamed(AUGUST), { type: "pick", pick: 0 }, { type: "editWhy", text: "because" });

  it("reveals from answering, keeping the draft", () => {
    expect(run(ready(), { type: "reveal" })).toMatchObject({ status: "revealed", draft: { pick: 0, why: "because" } });
  });

  it("can't reveal while grading (D101) or after grading", () => {
    const grading = run(ready(), { type: "check" });
    expect(roundReducer(grading, { type: "reveal" })).toBe(grading);
    const graded = run(grading, { type: "gradeDone", grade });
    expect(roundReducer(graded, { type: "reveal" })).toBe(graded);
  });

  it("returns to answering with the draft intact when grading fails", () => {
    const back = run(ready(), { type: "check" }, { type: "gradeFailed", message: "busy" });
    expect(back).toMatchObject({ status: "answering", error: "busy", draft: { pick: 0, why: "because" } });
  });

  it("ignores a late grade after the round moved on", () => {
    const revealed = run(ready(), { type: "reveal" });
    expect(roundReducer(revealed, { type: "gradeDone", grade })).toBe(revealed);
  });
});

describe("roundReducer: rung 3 revise (D108)", () => {
  const DECEMBER = "We're setting Q4 targets. What should we expect for December?";
  const gradedAt = (message: string) =>
    run(streamed(message), { type: "editAnswer", text: "Set December ~15% below November" }, { type: "check" }, { type: "gradeDone", grade });

  it("goes back to answering with the draft kept and the attempt counted", () => {
    const graded = gradedAt(DECEMBER);
    expect(graded).toMatchObject({ status: "graded", attempt: 1, lastGrade: null });
    const back = run(graded, { type: "revise" });
    expect(back).toMatchObject({ status: "answering", attempt: 2, error: null, draft: { answer: "Set December ~15% below November" } });
    // D109: the critique stays on screen while revising and re-checking.
    expect(back).toMatchObject({ lastGrade: grade });
    expect(run(back, { type: "check" })).toMatchObject({ status: "grading", lastGrade: grade });
    const again = run(back, { type: "check" }, { type: "gradeDone", grade });
    expect(again).toMatchObject({ status: "graded", attempt: 2 });
  });

  it("is rung 3 only", () => {
    const summer = gradedAt(SUMMER);
    expect(roundReducer(summer, { type: "revise" })).toBe(summer);
  });
});
