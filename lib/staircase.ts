import type { Turn } from "./conversation";
import type { Outcome } from "./grading";

// The adaptive staircase (D20): per concept, in-session only (D21). Nothing is stored: the rung
// map is derived from the turns every time a question is sent (D113).

export type Rung = 1 | 2 | 3;

// What the learner did on attempt 1 (D108): graded, or revealed (a miss on the staircase, D50).
export type FirstAttempt = Outcome | "revealed";

// Up one on a correct answer with a sound why; down one on anything else. Clamped to 1–3.
export function nextRung(seen: Rung, result: FirstAttempt): Rung {
  return result === "correct" ? (Math.min(3, seen + 1) as Rung) : (Math.max(1, seen - 1) as Rung);
}

// Later turns win. The base is the rung the learner saw (Claude's echo, D67), not the one the map
// asked for. Turns with no attempt-1 result (unanswered, plain, grade failed) change nothing.
// Sparse: only concepts above rung 1 (D66).
export function rungMap(turns: Turn[]): Record<string, 2 | 3> {
  const rungs = new Map<string, Rung>();
  for (const { round, firstAttempt } of turns) {
    if (!firstAttempt || round.status === "streaming" || round.status === "plain") continue;
    rungs.set(round.round.concept, nextRung(round.round.rung, firstAttempt));
  }
  return Object.fromEntries([...rungs].filter(([, rung]) => rung > 1)) as Record<string, 2 | 3>;
}
