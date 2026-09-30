import { describe, expect, it } from "vitest";
import { chunkText, fixtureText } from "./fixtures";
import type { Grade } from "./grade";
import { gradeFailureMessage, GradeRequestSchema, gradeInput, outcome } from "./grading";
import { initialRound, roundReducer, type RoundAction, type RoundState } from "./round-reducer";

const AUGUST = "Summarize August for the leadership update";
const SUMMER = "How does this summer compare to last summer?";

const run = (state: RoundState, ...actions: RoundAction[]) => actions.reduce(roundReducer, state);
function answering(message: string) {
  const chunks = chunkText(fixtureText(message)).map((text): RoundAction => ({ type: "chunk", text }));
  const s = run(initialRound, ...chunks, { type: "streamEnd", order: [2, 0, 3, 1] });
  if (s.status !== "answering") throw new Error(s.status);
  return s;
}

const g = (over: Partial<Grade> = {}): Grade => ({
  assessment: "a",
  answer_sound: null,
  why_sound: true,
  mistake: null,
  feedback: "f",
  gap: null,
  corrective_prompt: null,
  ...over,
});

describe("gradeInput", () => {
  it("rung 1: sends the picked option's text, not its shuffled index", () => {
    const s = answering(AUGUST);
    const input = gradeInput(run(s, { type: "pick", pick: 1 }, { type: "editWhy", text: "because" }) as typeof s);
    expect(input).toMatchObject({ pick: s.options[1].text, answer: null, why: "because" });
    expect(GradeRequestSchema.safeParse(input).success).toBe(true);
  });

  it("rung 1 own words: graded as a rung-2 request, round otherwise unchanged (D44, D107)", () => {
    const s = answering(AUGUST);
    const own = run(s, { type: "pick", pick: "own" }, { type: "editAnswer", text: "seasonal" }, { type: "editWhy", text: "because" });
    const input = gradeInput(own as typeof s);
    expect(input).toMatchObject({ pick: null, answer: "seasonal", why: "because" });
    expect(input.round).toEqual({ ...s.round, rung: 2 });
    expect(s.round.rung).toBe(1); // the learner's round keeps its rung for the staircase
  });

  it("rungs 2–3: one box sent as both answer and why (D105)", () => {
    const s = answering(SUMMER);
    const input = gradeInput(run(s, { type: "editAnswer", text: "Seasonal, up 35% YoY" }) as typeof s);
    expect(input).toMatchObject({ pick: null, answer: "Seasonal, up 35% YoY", why: "Seasonal, up 35% YoY" });
  });
});

describe("outcome", () => {
  function graded(message: string, draft: RoundAction[], grade: Grade) {
    const s = run(answering(message), ...draft, { type: "check" }, { type: "gradeDone", grade });
    if (s.status !== "graded") throw new Error(s.status);
    return s;
  }
  const correctIndex = (m: string) => answering(m).options.findIndex((o) => o.mistake === null);
  const wrongIndex = (m: string) => answering(m).options.findIndex((o) => o.mistake !== null);
  const why: RoundAction = { type: "editWhy", text: "because" };

  it("rung 1: code decides the pick, the grader decides the why", () => {
    expect(outcome(graded(AUGUST, [{ type: "pick", pick: correctIndex(AUGUST) }, why], g()))).toBe("correct");
    expect(outcome(graded(AUGUST, [{ type: "pick", pick: correctIndex(AUGUST) }, why], g({ why_sound: false })))).toBe("weakWhy");
    // A wrong pick is wrong even if the grader liked the why.
    expect(outcome(graded(AUGUST, [{ type: "pick", pick: wrongIndex(AUGUST) }, why], g()))).toBe("wrong");
  });

  it("rung 1 own words: the grader decides both, as at rung 2 (D107)", () => {
    const own: RoundAction[] = [{ type: "pick", pick: "own" }, { type: "editAnswer", text: "x" }, why];
    expect(outcome(graded(AUGUST, own, g({ answer_sound: true })))).toBe("correct");
    expect(outcome(graded(AUGUST, own, g({ answer_sound: false, why_sound: false })))).toBe("wrong");
  });

  it("rungs 2–3: the grader decides both", () => {
    const box: RoundAction = { type: "editAnswer", text: "x" };
    expect(outcome(graded(SUMMER, [box], g({ answer_sound: true })))).toBe("correct");
    expect(outcome(graded(SUMMER, [box], g({ answer_sound: true, why_sound: false })))).toBe("weakWhy");
    expect(outcome(graded(SUMMER, [box], g({ answer_sound: false, why_sound: false })))).toBe("wrong");
  });
});

describe("gradeFailureMessage", () => {
  it("names the cause and always offers Reveal as a way out (D3)", () => {
    for (const reason of ["timeout", "invalid", "network", 429, 503, 500] as const) {
      expect(gradeFailureMessage(reason)).toMatch(/reveal|Wait a minute/i);
    }
    expect(gradeFailureMessage("timeout")).toMatch(/too long/);
  });
});
