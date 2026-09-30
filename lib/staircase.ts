import type { Turn } from "./conversation";
import type { Outcome } from "./grading";

// The adaptive staircase (D20): per concept, in-session only (D21). Nothing is stored: the rung
// map is derived from the turns every time a question is sent (D113).

export type Rung = 1 | 2 | 3;

// What the learner did on attempt 1 (D108): graded, revealed (a miss on the staircase, D50), or
// skipped by sending a new message (D117: kept for the event log, ignored by the staircase).
export type FirstAttempt = Outcome | "revealed" | "skipped";

// Up one on a correct answer with a sound why; down one on anything else. Clamped to 1–3.
export function nextRung(seen: Rung, result: Exclude<FirstAttempt, "skipped">): Rung {
  return result === "correct" ? (Math.min(3, seen + 1) as Rung) : (Math.max(1, seen - 1) as Rung);
}

// Later turns win. The base is the rung the learner saw (Claude's echo, D67), not the one the map
// asked for. Turns with no attempt-1 result (unanswered, plain, grade failed) or a skip change nothing.
// Sparse: only concepts above rung 1 (D66).
export function rungMap(turns: Turn[]): Record<string, 2 | 3> {
  const rungs = new Map<string, Rung>();
  for (const { round, firstAttempt } of turns) {
    if (!firstAttempt || firstAttempt === "skipped" || round.status === "streaming" || round.status === "plain") continue;
    rungs.set(round.round.concept, nextRung(round.round.rung, firstAttempt));
  }
  return Object.fromEntries([...rungs].filter(([, rung]) => rung > 1)) as Record<string, 2 | 3>;
}

// D33: when a round's format differs from the last time the learner saw its concept, the goal
// chip says why in one line. Compared with the last earlier round on the same concept, answered
// or not; a concept seen for the first time gets no note.
export function rungChange(turns: Turn[], index: number): { from: Rung; to: Rung } | null {
  const { round } = turns[index];
  if (round.status === "streaming" || round.status === "plain") return null;
  const { concept, rung } = round.round;
  for (let i = index - 1; i >= 0; i--) {
    const earlier = turns[i].round;
    if (earlier.status === "streaming" || earlier.status === "plain" || earlier.round.concept !== concept) continue;
    return earlier.round.rung === rung ? null : { from: earlier.round.rung, to: rung };
  }
  return null;
}

// Rung 1→2 copy is from Rung2.dc.html; the other lines have no artboard (proposed in M4.4b).
export function rungNote({ from, to }: { from: Rung; to: Rung }): string {
  if (to > from) {
    return to === 2
      ? "Your turn to write it: you’ve got the multiple-choice version down."
      : "Your turn to make the call: you’ve got the reasoning down.";
  }
  return to === 1
    ? "Back to options for this one, to firm up the idea."
    : "Back to one sentence for this one, before the full recommendation.";
}
