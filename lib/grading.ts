import { z } from "zod";
import type { GradeInput } from "./prompts/grade";
import { pickCorrect, type RoundState } from "./round-reducer";

// Browser ↔ /api/grade. The browser holds the round, answer included (D56), and sends it with
// the learner's response; the server stays stateless (D55).

// E2E checklist: reject oversized grading payloads before they cost anything. A round is
// ~3–5 KB; learner text is capped below, so 32 KB leaves room without inviting abuse.
export const MAX_GRADE_BYTES = 32_000;
export const MAX_LEARNER_CHARS = 2_000;

const learnerText = z.string().max(MAX_LEARNER_CHARS);

export const GradeRequestSchema = z.object({
  round: z.object({
    goal: z.string(),
    domain: z.enum(["analysis", "other"]),
    concept: z.string(),
    rung: z.literal([1, 2, 3]),
    before: z.string(),
    blank: z.string(),
    after: z.string(),
    options: z
      .array(z.object({ text: z.string(), mistake: z.string().nullable() }))
      .length(4)
      .refine((opts) => opts.filter((o) => o.mistake === null).length === 1, "exactly one correct option"),
  }),
  pick: learnerText.nullable(),
  answer: learnerText.nullable(),
  why: learnerText,
});

type Answered = Extract<RoundState, { status: "answering" | "grading" }>;

// Rung 1: the picked option's text. Own words at rung 1 are graded as a rung-2 request (D44,
// D107): the only grader path that judges answer_sound, and the one M2/D106 measured.
// Parse the reply with the rung sent here, not the round's. Rungs 2–3: one box, sent as both
// answer and why (D105, verified in D106).
export function gradeInput(state: Answered): GradeInput {
  const { round, options, draft } = state;
  if (round.rung !== 1) return { round, pick: null, answer: draft.answer, why: draft.answer };
  if (draft.pick === "own") return { round: { ...round, rung: 2 }, pick: null, answer: draft.answer, why: draft.why };
  return { round, pick: draft.pick === null ? null : options[draft.pick].text, answer: null, why: draft.why };
}

// correct: sound answer (or correct pick) and sound why · weakWhy: right answer, unsound why ·
// wrong: wrong pick or unsound answer. Only "correct" climbs the staircase (M4, D44, D50).
export type Outcome = "correct" | "weakWhy" | "wrong";

export function outcome(state: Extract<RoundState, { status: "graded" }>): Outcome {
  const answerOk = pickCorrect(state) ?? state.grade.answer_sound === true;
  if (!answerOk) return "wrong";
  return state.grade.why_sound ? "correct" : "weakWhy";
}

// What the learner reads when a grade can't be had; the round goes back to answering (D103).
export function gradeFailureMessage(reason: number | "timeout" | "invalid" | "network"): string {
  switch (reason) {
    case "timeout":
      return "Checking took too long. Try again, or reveal the answer.";
    case "invalid":
      return "Claude couldn't check that one. Try again, or reveal the answer.";
    case 429:
      return "You're checking answers faster than this prototype allows. Wait a minute, then try again.";
    case 503:
      return "Claude is busy right now. Try again in a moment, or reveal the answer.";
    default:
      return "Something went wrong checking your answer. Try again, or reveal the answer.";
  }
}
