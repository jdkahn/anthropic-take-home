import type { Grade } from "./grade";
import { parsePartialRound } from "./partial-round";
import { parseRound, type ClozeRound, type RawRound } from "./round";

// One round as an explicit state machine (D77). Pure: randomness (the option order, D100)
// and I/O (the stream, the grade call) arrive as actions.
//
//              ┌──▶ plain (terminal)
//   streaming ─┤
//              └──▶ answering ──check──▶ grading ──▶ graded
//                     │ ▲ ▲                 │          │
//                     │ │ └── gradeFailed ──┘          │
//          reveal/skip └────── revise (rung 3) ─────┘
//                     ▼
//                  revealed
//
// Reveal only while answering (D101): no blank exists yet while streaming, and during
// grading a Reveal would race the grade on the staircase (D50). Skip (D117) is the learner moving
// on without answering: it shows the answer like Reveal, but the staircase ignores it.

export type Option = ClozeRound["options"][number];

// pick: index into the displayed (shuffled) options, or "own" for the 5th option (D39, D44).
// Rungs 2–3 have no options: the learner writes `answer` (D43).
export type Draft = { pick: number | "own" | null; answer: string; why: string };

// attempt: 1 on the first answer, +1 per rung-3 revision. M4's staircase counts attempt 1 only.
// lastGrade: the critique being revised against, kept on screen while revising (D109); null on attempt 1.
type Cloze = { round: ClozeRound; options: Option[]; order: number[]; draft: Draft; attempt: number; lastGrade: Grade | null };

export type RoundState =
  | { status: "streaming"; raw: string; preview: Partial<RawRound> | null }
  | { status: "plain"; text: string; reason: string | null }
  | ({ status: "answering"; error: string | null } & Cloze)
  | ({ status: "grading" } & Cloze)
  | ({ status: "graded"; grade: Grade } & Cloze)
  | ({ status: "revealed"; skipped: boolean } & Cloze);

export type RoundAction =
  | { type: "chunk"; text: string }
  | { type: "streamEnd"; order: number[]; stopped?: boolean } // order = shuffledOrder(4), made at the dispatch site
  | { type: "requestFailed"; reason: "busy" | "rate_limited" | "upstream" | "network" } // no stream at all
  | { type: "pick"; pick: number | "own" }
  | { type: "editAnswer"; text: string }
  | { type: "editWhy"; text: string }
  | { type: "check" }
  | { type: "gradeDone"; grade: Grade }
  | { type: "gradeFailed"; message: string }
  | { type: "reveal" }
  | { type: "skip" } // a new message sent while this round is unanswered (D117)
  | { type: "revise" }; // rung 3: back to the draft after the critique (Rung3.dc.html)

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
      if (action.type === "requestFailed") {
        return { status: "plain", text: "", reason: action.reason };
      }
      if (action.type === "streamEnd") {
        // A truncated or empty stream lands here too: parseRound() turns it into a plain answer (D57, D91).
        const parsed = parseRound(state.raw);
        if (parsed.kind === "plain") {
          // Unparseable JSON: show what streamed of the answer, never the raw JSON.
          const broken = parsed.reason === "invalid JSON" || parsed.reason === "schema mismatch";
          const text = broken ? (state.preview?.before ?? "") : parsed.text;
          const reason = broken && action.stopped ? "stopped" : parsed.reason;
          return { status: "plain", text, reason };
        }
        const { round } = parsed;
        return {
          status: "answering",
          round,
          options: action.order.map((i) => round.options[i]),
          order: action.order,
          draft: { pick: null, answer: "", why: "" },
          attempt: 1,
          lastGrade: null,
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
          const { round, options, order, draft, attempt, lastGrade } = state;
          return { status: "grading", round, options, order, draft, attempt, lastGrade };
        }
        case "reveal":
        case "skip": {
          // Skip applies to attempt 1 only: a rung-3 revision in progress stays as is (D109).
          if (action.type === "skip" && state.attempt !== 1) return state;
          const { round, options, order, draft, attempt, lastGrade } = state;
          return { status: "revealed", skipped: action.type === "skip", round, options, order, draft, attempt, lastGrade };
        }
        default:
          return state;
      }

    case "grading":
      if (action.type === "gradeDone") {
        const { round, options, order, draft, attempt, lastGrade } = state;
        return { status: "graded", round, options, order, draft, attempt, lastGrade, grade: action.grade };
      }
      if (action.type === "gradeFailed") {
        // Back to answering with the draft intact; the learner can retry or reveal.
        const { round, options, order, draft, attempt, lastGrade } = state;
        return { status: "answering", round, options, order, draft, attempt, lastGrade, error: action.message };
      }
      return state;

    case "graded":
      // Rung 3 only: revise the draft after reading the critique, and check again (D43, PRD).
      if (action.type === "revise" && state.round.rung === 3) {
        const { round, options, order, draft, attempt, grade } = state;
        return { status: "answering", round, options, order, draft, attempt: attempt + 1, lastGrade: grade, error: null };
      }
      return state;

    default: // plain, revealed: terminal
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
