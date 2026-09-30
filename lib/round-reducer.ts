import type { Grade } from "./grade";
import { parsePartialRound } from "./partial-round";
import { parseRound, type ClozeRound, type RawRound } from "./round";

// One round as an explicit state machine (D77). Pure: randomness (the option order, D100)
// and I/O (the stream, the grade call) arrive as actions.
//
//              ┌──▶ plain (terminal)
//   streaming ─┤
//              └──▶ answering ──check──▶ grading ──▶ graded
//                     │   ▲                 │
//                  reveal └── gradeFailed ──┘
//                     ▼
//                  revealed
//
// Reveal only while answering (D101): no blank exists yet while streaming, and during
// grading a Reveal would race the grade on the staircase (D50).

export type Option = ClozeRound["options"][number];

// pick: index into the displayed (shuffled) options, or "own" for the 5th option (D39, D44).
// Rungs 2–3 have no options: the learner writes `answer` (D43).
export type Draft = { pick: number | "own" | null; answer: string; why: string };

type Cloze = { round: ClozeRound; options: Option[]; order: number[]; draft: Draft };

export type RoundState =
  | { status: "streaming"; raw: string; preview: Partial<RawRound> | null }
  | { status: "plain"; text: string; reason: string | null }
  | ({ status: "answering"; error: string | null } & Cloze)
  | ({ status: "grading" } & Cloze)
  | ({ status: "graded"; grade: Grade } & Cloze)
  | ({ status: "revealed" } & Cloze);

export type RoundAction =
  | { type: "chunk"; text: string }
  | { type: "streamEnd"; order: number[] } // order = shuffledOrder(4), made at the dispatch site
  | { type: "pick"; pick: number | "own" }
  | { type: "editAnswer"; text: string }
  | { type: "editWhy"; text: string }
  | { type: "check" }
  | { type: "gradeDone"; grade: Grade }
  | { type: "gradeFailed"; message: string }
  | { type: "reveal" };

export const initialRound: RoundState = { status: "streaming", raw: "", preview: null };

// An action that doesn't fit the current state returns the same state object: a no-op,
// never a throw, so a late or double-clicked event can't corrupt a round.
export function roundReducer(state: RoundState, action: RoundAction): RoundState {
  switch (state.status) {
    case "streaming":
      if (action.type === "chunk") {
        const raw = state.raw + action.text;
        // Display only (D99): keep the last good preview when this prefix can't be repaired.
        return { status: "streaming", raw, preview: parsePartialRound(raw) ?? state.preview };
      }
      if (action.type === "streamEnd") {
        // A truncated or empty stream lands here too: parseRound() turns it into a plain answer (D57, D91).
        const parsed = parseRound(state.raw);
        if (parsed.kind === "plain") return { status: "plain", text: parsed.text, reason: parsed.reason };
        const { round } = parsed;
        return {
          status: "answering",
          round,
          options: action.order.map((i) => round.options[i]),
          order: action.order,
          draft: { pick: null, answer: "", why: "" },
          error: null,
        };
      }
      return state;

    case "answering":
      switch (action.type) {
        case "pick":
          return { ...state, draft: { ...state.draft, pick: action.pick } };
        case "editAnswer":
          return { ...state, draft: { ...state.draft, answer: action.text } };
        case "editWhy":
          return { ...state, draft: { ...state.draft, why: action.text } };
        case "check": {
          if (!canCheck(state)) return state;
          const { round, options, order, draft } = state;
          return { status: "grading", round, options, order, draft };
        }
        case "reveal": {
          const { round, options, order, draft } = state;
          return { status: "revealed", round, options, order, draft };
        }
        default:
          return state;
      }

    case "grading":
      if (action.type === "gradeDone") {
        const { round, options, order, draft } = state;
        return { status: "graded", round, options, order, draft, grade: action.grade };
      }
      if (action.type === "gradeFailed") {
        // Back to answering with the draft intact; the learner can retry or reveal.
        const { round, options, order, draft } = state;
        return { status: "answering", round, options, order, draft, error: action.message };
      }
      return state;

    default: // plain, graded, revealed: terminal for M3 (rung-3 "Revise my draft" is decided in M3.5)
      return state;
  }
}

// "Check my answer" is enabled only when there's something to grade. Rung 1: a pick and a why
// (own words also needs the answer). Rungs 2–3: the answer box.
export function canCheck(state: RoundState): boolean {
  if (state.status !== "answering") return false;
  const { round, draft } = state;
  const filled = (s: string) => s.trim() !== "";
  if (round.rung !== 1) return filled(draft.answer);
  if (draft.pick === null || !filled(draft.why)) return false;
  return draft.pick !== "own" || filled(draft.answer);
}

// Code decides pick correctness, not the grader (Phase 4). null when there's no option pick.
export function pickCorrect(state: Extract<RoundState, Cloze>): boolean | null {
  const { pick } = state.draft;
  if (typeof pick !== "number") return null;
  return state.options[pick]?.mistake === null;
}
